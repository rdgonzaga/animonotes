import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import path from "path";

describe("Auth Configuration Files", () => {
  it("should have auth.ts in project root", () => {
    const authPath = path.resolve(__dirname, "../../auth.ts");
    expect(existsSync(authPath)).toBe(true);
  });

  it("should have API route handler", () => {
    const routePath = path.resolve(__dirname, "../../app/api/auth/[...nextauth]/route.ts");
    expect(existsSync(routePath)).toBe(true);
  });

  it("should have middleware.ts in project root", () => {
    const middlewarePath = path.resolve(__dirname, "../../middleware.ts");
    expect(existsSync(middlewarePath)).toBe(true);
  });

  it("should have auth utility in lib", () => {
    const libAuthPath = path.resolve(__dirname, "../lib/auth.ts");
    expect(existsSync(libAuthPath)).toBe(true);
  });

  it("should have SessionProvider component", () => {
    const providerPath = path.resolve(__dirname, "../components/providers/session-provider.tsx");
    expect(existsSync(providerPath)).toBe(true);
  });

  it("should have type definitions", () => {
    const typesPath = path.resolve(__dirname, "../../types/next-auth.d.ts");
    expect(existsSync(typesPath)).toBe(true);
  });
});

describe("SessionProvider Component", () => {
  it("should export SessionProvider component", async () => {
    const { SessionProvider } = await import("@/components/providers/session-provider");
    expect(SessionProvider).toBeDefined();
    expect(typeof SessionProvider).toBe("function");
  });
});
