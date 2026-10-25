import test from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  resetRateLimiter,
} from "../../src/lib/rate-limiter";

test("🧪 Testing Rate Limiter & Anti-Brute-Force Token Enumeration...", () => {
  resetRateLimiter();
  const testIp = "192.168.1.100";
  const now = 1700000000000;

  // 1. Initial request should be allowed
  const req1 = checkRateLimit(testIp, now);
  assert.equal(req1.allowed, true, "Initial request must be allowed");

  // 2. 60 requests within 1 minute should all be allowed
  for (let i = 2; i <= 60; i++) {
    const res = checkRateLimit(testIp, now + i * 10);
    assert.equal(res.allowed, true, `Request #${i} should be allowed`);
  }

  // 3. 61st request should be rate-limited
  const req61 = checkRateLimit(testIp, now + 1000);
  assert.equal(req61.allowed, false, "61st request in same minute must be blocked");
  assert.equal(req61.reason, "RATE_LIMITED");

  // 4. Test Token Enumeration (10 invalid tokens -> 15 min ban)
  resetRateLimiter();
  const attackerIp = "10.0.0.99";

  for (let i = 1; i <= 9; i++) {
    const failureRes = recordFailedAttempt(attackerIp, now + i * 1000);
    assert.equal(failureRes.isBlocked, false, `Failure #${i} should not trigger ban yet`);
  }

  // 10th consecutive failure triggers ban
  const failure10 = recordFailedAttempt(attackerIp, now + 10000);
  assert.equal(failure10.isBlocked, true, "10th failure must trigger IP ban");
  assert.equal(failure10.blockDurationSeconds, 900, "Block duration must be 900s (15 mins)");

  // Subsequent request from attacker is immediately THROTTLED
  const blockedCheck = checkRateLimit(attackerIp, now + 11000);
  assert.equal(blockedCheck.allowed, false);
  assert.equal(blockedCheck.reason, "THROTTLED");

  // Legitimate user on different IP is unaffected
  const legitimateCheck = checkRateLimit("10.0.0.1", now + 11000);
  assert.equal(legitimateCheck.allowed, true, "Different IP should not be blocked");

  console.log("✅ Rate Limiter & Anti-Brute-Force tests PASSED!");
});
