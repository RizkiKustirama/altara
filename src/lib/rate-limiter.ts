/**
 * Rate Limiter & Anti-Brute-Force Protection for Public Portal
 *
 * Rules:
 * 1. General Rate Limit: Max 60 requests per minute per IP.
 * 2. Anti-Token Enumeration: Max 10 consecutive 404 invalid token attempts
 *    within 5 minutes -> 15-minute temporary IP ban.
 */

interface IpBucket {
  requestTimestamps: number[];
  failedAttempts: number[];
  blockedUntil: number | null;
}

const ipStore = new Map<string, IpBucket>();

const MAX_REQUESTS_PER_MINUTE = 60;
const WINDOW_ONE_MINUTE_MS = 60 * 1000;
const MAX_CONSECUTIVE_FAILURES = 10;
const FAILURE_WINDOW_MS = 5 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getOrCreateBucket(ip: string, now: number): IpBucket {
  let bucket = ipStore.get(ip);
  if (!bucket) {
    bucket = {
      requestTimestamps: [],
      failedAttempts: [],
      blockedUntil: null,
    };
    ipStore.set(ip, bucket);
  }

  // Clean old requests older than 1 minute
  bucket.requestTimestamps = bucket.requestTimestamps.filter(
    (t) => now - t < WINDOW_ONE_MINUTE_MS
  );

  // Clean old failures older than 5 minutes
  bucket.failedAttempts = bucket.failedAttempts.filter(
    (t) => now - t < FAILURE_WINDOW_MS
  );

  // Check if block duration expired
  if (bucket.blockedUntil && now > bucket.blockedUntil) {
    bucket.blockedUntil = null;
    bucket.failedAttempts = [];
  }

  return bucket;
}

export function checkRateLimit(
  ip: string,
  now: number = Date.now()
): {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: "THROTTLED" | "RATE_LIMITED";
} {
  const bucket = getOrCreateBucket(ip, now);

  // 1. Check if currently blocked
  if (bucket.blockedUntil && now < bucket.blockedUntil) {
    const retryAfter = Math.ceil((bucket.blockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: retryAfter,
      reason: "THROTTLED",
    };
  }

  // 2. Check general rate limit (60 req/min)
  if (bucket.requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = bucket.requestTimestamps[0] || now;
    const retryAfter = Math.ceil((oldest + WINDOW_ONE_MINUTE_MS - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, retryAfter),
      reason: "RATE_LIMITED",
    };
  }

  // Record this request
  bucket.requestTimestamps.push(now);
  return { allowed: true };
}

/**
 * Record a 404 invalid token probe.
 * If 10 failures occur within 5 minutes, block IP for 15 minutes.
 */
export function recordFailedAttempt(
  ip: string,
  now: number = Date.now()
): {
  isBlocked: boolean;
  blockDurationSeconds?: number;
} {
  const bucket = getOrCreateBucket(ip, now);
  bucket.failedAttempts.push(now);

  if (bucket.failedAttempts.length >= MAX_CONSECUTIVE_FAILURES) {
    bucket.blockedUntil = now + BLOCK_DURATION_MS;
    return {
      isBlocked: true,
      blockDurationSeconds: BLOCK_DURATION_MS / 1000,
    };
  }

  return { isBlocked: false };
}

/**
 * Reset failed attempts on valid token request.
 */
export function recordSuccessfulAttempt(
  ip: string,
  now: number = Date.now()
): void {
  const bucket = getOrCreateBucket(ip, now);
  bucket.failedAttempts = [];
}

/**
 * Reset store (for testing).
 */
export function resetRateLimiter(): void {
  ipStore.clear();
}
