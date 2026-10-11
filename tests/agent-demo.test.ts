import { test } from "node:test";
import assert from "node:assert/strict";
import { APPROVAL_TTL_MS, DEMO_CASES, DEMO_CRM_SEED, approveRun, hashPayload, newCrm, rejectRun, startRun } from "../lib/agent-demo";

const byId = (id: string) => DEMO_CASES.find((c) => c.id === id)!.event;
const T0 = 1_000_000;

test("a normal enquiry is drafted, approved and written exactly once", () => {
  const crm = newCrm(DEMO_CRM_SEED);
  const { run } = startRun(byId("normal"), crm, [], T0);
  assert.equal(run.state, "AWAITING_APPROVAL");
  assert.equal(run.proposal?.fields.owner, "Amaka");
  const first = approveRun(run, crm, { actionHash: run.actionHash!, now: T0 + 1000 });
  assert.equal(first.run.state, "SUCCEEDED");
  assert.equal(first.crm.records.length, crm.records.length + 1);
  assert.ok(first.run.externalId);
  // approving again must not write again
  const second = approveRun(first.run, first.crm, { actionHash: run.actionHash!, now: T0 + 2000 });
  assert.ok(second.error);
  assert.equal(second.crm.records.length, first.crm.records.length);
});

test("the same approved run replayed against the CRM does not create a second record", () => {
  const crm = newCrm();
  const { run } = startRun(byId("normal"), crm, [], T0);
  const first = approveRun(run, crm, { actionHash: run.actionHash!, now: T0 });
  // simulate a retry of the original (pre-approval) run after a timeout: same idempotency key
  const retry = approveRun({ ...run, matchesAtDraft: 1 }, first.crm, { actionHash: run.actionHash!, now: T0 });
  assert.equal(retry.crm.records.length, 1);
  assert.equal(retry.run.externalId, first.run.externalId);
});

test("a replayed event is rejected", () => {
  const crm = newCrm();
  const a = startRun(byId("normal"), crm, [], T0);
  const b = startRun(byId("normal"), crm, a.seen, T0);
  assert.equal(b.run.state, "REJECTED");
});

test("an unauthorised source is rejected before anything else", () => {
  const { run } = startRun({ ...byId("normal"), source: "unknown-webhook" }, newCrm(), [], T0);
  assert.equal(run.state, "REJECTED");
  assert.equal(run.proposal, null);
});

test("a possible duplicate is held, never merged", () => {
  const crm = newCrm(DEMO_CRM_SEED);
  const { run } = startRun(byId("duplicate"), crm, [], T0);
  assert.equal(run.state, "MANUAL_REVIEW");
  assert.match(run.holdReason!, /duplicate/i);
  assert.equal(run.proposal, null);
});

test("a missing field is held, and instructions in the message change nothing", () => {
  const { run } = startRun(byId("missing"), newCrm(), [], T0);
  assert.equal(run.state, "MANUAL_REVIEW");
  const complete = startRun({ ...byId("missing"), eventId: "evt-x", company: "Example Co" }, newCrm(), [], T0).run;
  assert.equal(complete.proposal?.fields.owner, "Lena"); // routed by the rule, not by "owned by the CEO"
});

test("an unrouted region is held", () => {
  const { run } = startRun({ ...byId("normal"), region: "Antarctica" }, newCrm(), [], T0);
  assert.equal(run.state, "MANUAL_REVIEW");
});

test("an expired approval does not execute", () => {
  const crm = newCrm();
  const { run } = startRun(byId("normal"), crm, [], T0);
  const out = approveRun(run, crm, { actionHash: run.actionHash!, now: T0 + APPROVAL_TTL_MS + 1 });
  assert.equal(out.run.state, "MANUAL_REVIEW");
  assert.equal(out.crm.records.length, 0);
});

test("an approval for a different payload does not execute", () => {
  const crm = newCrm();
  const { run } = startRun(byId("normal"), crm, [], T0);
  const wrongHash = approveRun(run, crm, { actionHash: "deadbeef", now: T0 });
  assert.equal(wrongHash.run.state, "MANUAL_REVIEW");
  const edited = { ...run, proposal: { ...run.proposal!, fields: { ...run.proposal!.fields, owner: "Someone else" } } };
  const out = approveRun(edited, crm, { actionHash: run.actionHash!, now: T0 });
  assert.equal(out.run.state, "MANUAL_REVIEW");
  assert.equal(out.crm.records.length, 0);
});

test("a paused workflow blocks execution and leaves the action pending", () => {
  const crm = newCrm();
  const { run } = startRun(byId("normal"), crm, [], T0);
  const out = approveRun(run, crm, { actionHash: run.actionHash!, now: T0, paused: true });
  assert.ok(out.error);
  assert.equal(out.run.state, "AWAITING_APPROVAL");
  assert.equal(out.crm.records.length, 0);
});

test("a CRM change between draft and approval is caught on revalidation", () => {
  const crm = newCrm();
  const { run } = startRun(byId("held"), crm, [], T0);
  const changed = { ...crm, records: [{ id: "CRM-9", name: "Sam", email: "sam@fictional-energy.test", company: "Fictional Energy", owner: "Kofi", version: 1 }] };
  const out = approveRun(run, changed, { actionHash: run.actionHash!, now: T0 });
  assert.equal(out.run.state, "MANUAL_REVIEW");
  assert.equal(out.crm.records.length, 1);
});

test("rejecting writes nothing; every transition is traced", () => {
  const crm = newCrm();
  const { run } = startRun(byId("normal"), crm, [], T0);
  const rejected = rejectRun(run, T0);
  assert.equal(rejected.state, "REJECTED");
  assert.deepEqual(run.trace.map((t) => t.state), ["RECEIVED", "VALIDATED", "DRAFTED", "AWAITING_APPROVAL"]);
});

test("the payload hash ignores key order and changes with content", () => {
  assert.equal(hashPayload({ a: 1, b: { c: 2, d: 3 } }), hashPayload({ b: { d: 3, c: 2 }, a: 1 }));
  assert.notEqual(hashPayload({ a: 1 }), hashPayload({ a: 2 }));
});
