"use client";

import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, type RemoteParticipant, type RemoteTrack, type RemoteTrackPublication } from "livekit-client";

type Speaker = { identity: string; name: string; isLocal: boolean; canPublish: boolean; speaking: boolean };
type HandRaise = { identity: string; name: string };

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function DiscussionVoicePanel({ discussionId, isHost, roomOpen }: { discussionId: string; isHost: boolean; roomOpen: boolean }) {
  const roomRef = useRef<Room | null>(null);
  const audioHostRef = useRef<HTMLDivElement>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [canPublish, setCanPublish] = useState(isHost);
  const [handRaised, setHandRaised] = useState(false);
  const [participants, setParticipants] = useState<Speaker[]>([]);
  const [pending, setPending] = useState<HandRaise[]>([]);
  const [error, setError] = useState("");

  useEffect(() => () => { roomRef.current?.disconnect(); }, []);

  function refreshParticipants(room: Room) {
    const all: Speaker[] = [room.localParticipant, ...Array.from(room.remoteParticipants.values())].map((p) => ({
      identity: p.identity,
      name: p.name || "Member",
      isLocal: p === room.localParticipant,
      canPublish: p.permissions?.canPublish ?? false,
      speaking: p.isSpeaking
    }));
    setParticipants(all);
  }

  async function join() {
    setError("");
    setConnecting(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}/voice/token`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not join voice."); return; }

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication, _p: RemoteParticipant) => {
        if (track.kind !== Track.Kind.Audio) return;
        const el = track.attach();
        el.autoplay = true;
        audioHostRef.current?.appendChild(el);
      });
      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => { track.detach().forEach((el) => el.remove()); });
      room.on(RoomEvent.ParticipantConnected, () => refreshParticipants(room));
      room.on(RoomEvent.ParticipantDisconnected, () => refreshParticipants(room));
      room.on(RoomEvent.ActiveSpeakersChanged, () => refreshParticipants(room));
      room.on(RoomEvent.ParticipantPermissionsChanged, () => {
        setCanPublish(room.localParticipant.permissions?.canPublish ?? false);
        refreshParticipants(room);
      });
      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const msg = JSON.parse(decoder.decode(payload));
          if (msg.type === "raise-hand" && isHost) {
            setPending((p) => (p.some((x) => x.identity === msg.identity) ? p : [...p, { identity: msg.identity, name: msg.name }]));
          }
        } catch {
          // ignore malformed data messages
        }
      });
      room.on(RoomEvent.Disconnected, () => { setConnected(false); setParticipants([]); });

      await room.connect(data.url, data.token);

      // Connecting to the room (signaling) and enabling the microphone (getUserMedia) are
      // separate failure modes: mic permission can be denied — by the browser's own prompt, or by
      // the Permissions-Policy header — after the room connection already succeeded. Treating that
      // as a generic "check your connection" error was misleading, and leaving the room connected
      // with nothing visibly wrong left the member stuck in it with no way to leave from the UI.
      setCanPublish(data.canPublish);
      if (data.canPublish) {
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          setMicOn(true);
        } catch (micErr) {
          room.disconnect();
          roomRef.current = null;
          const denied = micErr instanceof DOMException && (micErr.name === "NotAllowedError" || micErr.name === "SecurityError");
          setError(denied ? "Microphone access was blocked. Allow microphone access for this site in your browser settings, then try again." : "Could not enable your microphone. Check your connection and try again.");
          return;
        }
      }
      refreshParticipants(room);
      setConnected(true);
    } catch {
      roomRef.current?.disconnect();
      roomRef.current = null;
      setError("Could not join voice. Check your connection and try again.");
    } finally {
      setConnecting(false);
    }
  }

  function leave() {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setConnected(false);
    setMicOn(false);
    setHandRaised(false);
    setParticipants([]);
  }

  async function toggleMic() {
    const room = roomRef.current;
    if (!room || !canPublish) return;
    const next = !micOn;
    setError("");
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
    } catch (micErr) {
      // Listeners first touch the microphone here, after a host lets them speak.
      const denied = micErr instanceof DOMException && (micErr.name === "NotAllowedError" || micErr.name === "SecurityError");
      setError(denied ? "Microphone access was blocked. Allow microphone access for this site in your browser settings, then try again." : "Could not switch your microphone. Please try again.");
    }
  }

  async function raiseHand() {
    const room = roomRef.current;
    if (!room) return;
    await room.localParticipant.publishData(encoder.encode(JSON.stringify({ type: "raise-hand", identity: room.localParticipant.identity, name: room.localParticipant.name })), { reliable: true });
    setHandRaised(true);
  }

  async function approve(identity: string) {
    setPending((p) => p.filter((x) => x.identity !== identity));
    await fetch(`/api/discussions/${discussionId}/voice/permission`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identity, canPublish: true }) });
  }

  if (!roomOpen) return null;

  return (
    <div className="disc-voice">
      <div ref={audioHostRef} style={{ display: "none" }} />
      {!connected ? (
        <button className="button secondary" type="button" disabled={connecting} onClick={join}>{connecting ? "Joining…" : "🔊 Join voice"}</button>
      ) : (
        <div className="disc-voice-live">
          <div className="disc-voice-controls">
            {canPublish ? (
              <button className={`button secondary${micOn ? " active" : ""}`} type="button" onClick={toggleMic}>{micOn ? "🎙️ Mute" : "🎙️ Unmute"}</button>
            ) : (
              <button className="button secondary" type="button" disabled={handRaised} onClick={raiseHand}>{handRaised ? "✋ Waiting for host" : "✋ Ask to speak"}</button>
            )}
            <button className="button secondary" type="button" onClick={leave}>Leave voice</button>
          </div>
          <ul className="disc-voice-participants">
            {participants.map((p) => (
              <li key={p.identity} className={`disc-voice-participant${p.speaking ? " speaking" : ""}`}>
                {p.canPublish ? "🎙️" : "👂"} {p.name}{p.isLocal ? " (you)" : ""}
              </li>
            ))}
          </ul>
          {isHost && pending.length > 0 && (
            <div className="disc-voice-requests">
              {pending.map((p) => (
                <span key={p.identity} className="disc-voice-request">
                  {p.name} wants to speak
                  <button className="button secondary" type="button" onClick={() => approve(p.identity)}>Allow</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <p className="status error" role="alert">{error}</p>}
    </div>
  );
}
