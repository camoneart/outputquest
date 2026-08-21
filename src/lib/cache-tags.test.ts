import { describe, it, expect } from "vitest";
// cache-tags.ts imports "server-only" (throws outside an RSC graph); it is
// aliased to an empty stub in vitest.config.ts so this module is importable.
import { CacheTags } from "./cache-tags";

describe("CacheTags", () => {
	it("user() returns user-{clerkId}", () => {
		expect(CacheTags.user("abc123")).toBe("user-abc123");
	});

	it("zennArticles() returns zenn-{username}", () => {
		expect(CacheTags.zennArticles("mirino")).toBe("zenn-mirino");
	});

	it("dashboard() returns dashboard-{clerkId}", () => {
		expect(CacheTags.dashboard("abc123")).toBe("dashboard-abc123");
	});

	it("preserves special characters in the identifier", () => {
		expect(CacheTags.zennArticles("user-name_1")).toBe("zenn-user-name_1");
	});
});
