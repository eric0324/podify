import { describe, it, expect, vi, beforeAll } from "vitest";

// Must set env BEFORE jwt module is imported (JWT_SECRET is read at module level)
vi.stubEnv("JWT_SECRET", "test-secret-key-for-vitest");

let signJWT: typeof import("@/lib/auth/jwt").signJWT;
let verifyJWT: typeof import("@/lib/auth/jwt").verifyJWT;

beforeAll(async () => {
  const mod = await import("@/lib/auth/jwt");
  signJWT = mod.signJWT;
  verifyJWT = mod.verifyJWT;
});

describe("signJWT", () => {
  it("returns a valid JWT string", () => {
    const token = signJWT({ userId: "user-1", email: "test@example.com" });
    expect(typeof token).toBe("string");
    // JWT format: header.payload.signature
    expect(token.split(".")).toHaveLength(3);
  });
});

describe("verifyJWT", () => {
  it("decodes a token signed by signJWT", () => {
    const payload = { userId: "user-1", email: "test@example.com" };
    const token = signJWT(payload);
    const result = verifyJWT(token);
    expect(result).toMatchObject(payload);
  });

  it("returns null for an invalid token", () => {
    const result = verifyJWT("invalid.token.here");
    expect(result).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      { userId: "user-1", email: "test@example.com" },
      "test-secret-key-for-vitest",
      { expiresIn: "0s" }
    );
    await new Promise((r) => setTimeout(r, 10));
    const result = verifyJWT(token);
    expect(result).toBeNull();
  });
});
