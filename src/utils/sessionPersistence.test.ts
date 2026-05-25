import assert from "node:assert/strict";
import test from "node:test";
import {
  parseAuthSession,
  parseOnboardingCompleted,
  resolveStartupScreen,
  serializeAuthSession,
} from "./sessionPersistence";

test("parses valid persisted auth sessions", () => {
  const rawSession = serializeAuthSession("token-123", {
    id: "user-1",
    email: "learner@example.com",
    displayName: "Learner",
    avatarUrl: null,
  });

  const session = parseAuthSession(rawSession);

  assert.equal(session?.accessToken, "token-123");
  assert.equal(session?.user?.email, "learner@example.com");
  assert.equal(session?.user?.displayName, "Learner");
});

test("rejects corrupted or incomplete persisted auth sessions", () => {
  assert.equal(parseAuthSession(null), null);
  assert.equal(parseAuthSession("{not-json"), null);
  assert.equal(parseAuthSession(JSON.stringify({ accessToken: "" })), null);
  assert.equal(parseAuthSession(JSON.stringify({ user: { id: "1" } })), null);
});

test("parses onboarding completion flag defensively", () => {
  assert.equal(parseOnboardingCompleted("true"), true);
  assert.equal(parseOnboardingCompleted("false"), false);
  assert.equal(parseOnboardingCompleted(null), false);
  assert.equal(parseOnboardingCompleted("definitely"), null);
});

test("resolves startup route after hydration", () => {
  assert.equal(
    resolveStartupScreen({
      hasCompletedOnboarding: false,
      hasValidSession: true,
    }),
    "onboarding-1",
  );
  assert.equal(
    resolveStartupScreen({
      hasCompletedOnboarding: true,
      hasValidSession: false,
    }),
    "auth-select",
  );
  assert.equal(
    resolveStartupScreen({
      hasCompletedOnboarding: true,
      hasValidSession: true,
    }),
    "home",
  );
});
