import { describe, it, expect } from "vitest";
import { cleanUsername, isValidZennUsernameFormat } from "./index";

describe("cleanUsername", () => {
	it("strips a single leading @", () => {
		expect(cleanUsername("@dende")).toBe("dende");
	});

	it("leaves a username without @ unchanged", () => {
		expect(cleanUsername("dende")).toBe("dende");
	});

	it("only strips the leading @, not internal ones", () => {
		expect(cleanUsername("@de@nde")).toBe("de@nde");
	});
});

describe("isValidZennUsernameFormat", () => {
	it.each(["dende", "dende_123", "user-name", "ABC123", "_", "-"])(
		"accepts valid username: %s",
		(username) => {
			expect(isValidZennUsernameFormat(username)).toBe(true);
		}
	);

	it.each(["", "@dende", "den de", "デンデ", "user.name", "user!", "a/b"])(
		"rejects invalid username: %s",
		(username) => {
			expect(isValidZennUsernameFormat(username)).toBe(false);
		}
	);
});
