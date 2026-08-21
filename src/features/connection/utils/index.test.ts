import { describe, it, expect } from "vitest";
import { cleanUsername, isValidZennUsernameFormat } from "./index";

describe("cleanUsername", () => {
	it("strips a single leading @", () => {
		expect(cleanUsername("@mirino")).toBe("mirino");
	});

	it("leaves a username without @ unchanged", () => {
		expect(cleanUsername("mirino")).toBe("mirino");
	});

	it("only strips the leading @, not internal ones", () => {
		expect(cleanUsername("@mi@rino")).toBe("mi@rino");
	});
});

describe("isValidZennUsernameFormat", () => {
	it.each(["mirino", "mirino_123", "user-name", "ABC123", "_", "-"])(
		"accepts valid username: %s",
		(username) => {
			expect(isValidZennUsernameFormat(username)).toBe(true);
		}
	);

	it.each(["", "@mirino", "mi rino", "ミリノ", "user.name", "user!", "a/b"])(
		"rejects invalid username: %s",
		(username) => {
			expect(isValidZennUsernameFormat(username)).toBe(false);
		}
	);
});
