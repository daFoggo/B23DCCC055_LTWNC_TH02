import { describe, expect, it } from "vitest";
import { getErrorMessage, getFieldError } from "./error";

describe("getErrorMessage", () => {
	it("trả về message từ Error instance", () => {
		expect(getErrorMessage(new Error("Database error"))).toBe("Database error");
	});

	it("trả về message từ string", () => {
		expect(getErrorMessage("Invalid request")).toBe("Invalid request");
	});

	it("trả về message từ object có thuộc tính message", () => {
		expect(getErrorMessage({ message: "Network timeout" })).toBe(
			"Network timeout",
		);
	});

	it("fallback khi gặp unknown/null/undefined hoặc chuỗi rỗng", () => {
		expect(getErrorMessage(null, "Default error")).toBe("Default error");
		expect(getErrorMessage(undefined, "Default error")).toBe("Default error");
		expect(getErrorMessage("", "Default error")).toBe("Default error");
		expect(getErrorMessage(new Error("   "), "Default error")).toBe(
			"Default error",
		);
		expect(getErrorMessage(12345, "Default error")).toBe("Default error");
	});
});

describe("getFieldError", () => {
	it("trả về chuỗi rỗng khi null hoặc undefined", () => {
		expect(getFieldError(null)).toBe("");
		expect(getFieldError(undefined)).toBe("");
		expect(getFieldError("")).toBe("");
	});

	it("trả về string khi đầu vào là string", () => {
		expect(getFieldError("Email không hợp lệ")).toBe("Email không hợp lệ");
	});

	it("trả về message khi đầu vào là Error instance", () => {
		expect(getFieldError(new Error("Tên bài tập bắt buộc"))).toBe(
			"Tên bài tập bắt buộc",
		);
	});

	it("trả về message khi đầu vào là object có key message", () => {
		expect(getFieldError({ message: "Mật khẩu quá ngắn" })).toBe(
			"Mật khẩu quá ngắn",
		);
	});

	it("chuyển đổi string cho các kiểu dữ liệu khác", () => {
		expect(getFieldError(404)).toBe("404");
	});
});
