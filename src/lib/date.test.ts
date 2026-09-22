import { describe, expect, it } from "vitest";
import { fromLocalInputValue, toLocalInputValue } from "./date";

describe("toLocalInputValue", () => {
	it("trả về chuỗi rỗng khi chuỗi rỗng hoặc không hợp lệ", () => {
		expect(toLocalInputValue("")).toBe("");
		expect(toLocalInputValue("invalid-date")).toBe("");
	});

	it("chuyển đổi ISO string sang định dạng YYYY-MM-DDTHH:mm cục bộ", () => {
		const iso = "2026-09-22T08:30:00.000Z";
		const result = toLocalInputValue(iso);
		const expectedDate = new Date(iso);
		const pad = (n: number) => String(n).padStart(2, "0");
		const expected = `${expectedDate.getFullYear()}-${pad(
			expectedDate.getMonth() + 1,
		)}-${pad(expectedDate.getDate())}T${pad(expectedDate.getHours())}:${pad(
			expectedDate.getMinutes(),
		)}`;
		expect(result).toBe(expected);
	});
});

describe("fromLocalInputValue", () => {
	it("trả về chuỗi rỗng khi chuỗi rỗng hoặc không hợp lệ", () => {
		expect(fromLocalInputValue("")).toBe("");
		expect(fromLocalInputValue("invalid-date")).toBe("");
	});

	it("chuyển đổi local input string sang ISO string", () => {
		const localValue = "2026-09-22T15:30";
		const result = fromLocalInputValue(localValue);
		expect(result).toBe(new Date(localValue).toISOString());
	});
});
