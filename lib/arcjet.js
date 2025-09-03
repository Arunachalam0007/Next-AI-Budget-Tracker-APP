import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KET, // Get your site key from https://app.arcjet.com
  characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),

    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 2, // Refill 2 tokens per interval
      interval: 3600, // Refill every 3600 seconds = 1hr
      capacity: 2, // Bucket capacity of 2 tokens
    }),
  ],
});
