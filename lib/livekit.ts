// Server-only: mints LiveKit access tokens and changes participant permissions for Discussions'
// live voice. The host can speak from the moment they join; anyone else joins listening-only and
// can "raise a hand" (a LiveKit data message, see components/DiscussionVoicePanel.tsx) which the
// host can approve, promoting that listener to a speaker without anyone needing to reconnect.
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const URL = process.env.LIVEKIT_URL;
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

export function livekitConfigured(): boolean {
  return Boolean(URL && API_KEY && API_SECRET);
}

export const voiceRoomName = (discussionId: string) => `discussion-${discussionId}`;

let roomService: RoomServiceClient | null = null;
function service(): RoomServiceClient {
  if (!roomService) roomService = new RoomServiceClient(URL!.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), API_KEY!, API_SECRET!);
  return roomService;
}

/** A token for joining a discussion's voice room. The host can publish (speak) immediately. */
export async function mintVoiceToken(discussionId: string, identity: string, name: string, canPublish: boolean): Promise<{ token: string; url: string } | null> {
  if (!livekitConfigured()) return null;
  const at = new AccessToken(API_KEY!, API_SECRET!, { identity, name, ttl: "6h" });
  at.addGrant({ room: voiceRoomName(discussionId), roomJoin: true, canPublish, canSubscribe: true, canPublishData: true });
  return { token: await at.toJwt(), url: URL! };
}

/** The host grants (or revokes) a listener's ability to speak. LiveKit pushes this to them live. */
export async function setVoicePublishPermission(discussionId: string, identity: string, canPublish: boolean): Promise<boolean> {
  if (!livekitConfigured()) return false;
  try {
    await service().updateParticipant(voiceRoomName(discussionId), identity, undefined, { canPublish, canSubscribe: true, canPublishData: true });
    return true;
  } catch (err) {
    console.error("setVoicePublishPermission failed:", err);
    return false;
  }
}

/** Disconnects everyone and tears down the voice room, e.g. once a discussion is closed. */
export async function endVoiceRoom(discussionId: string): Promise<void> {
  if (!livekitConfigured()) return;
  try {
    await service().deleteRoom(voiceRoomName(discussionId));
  } catch (err) {
    // Deleting a room that was never joined (no one used voice) throws — that's fine, not an error.
  }
}
