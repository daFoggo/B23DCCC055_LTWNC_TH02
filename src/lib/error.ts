export const getErrorMessage = (
	error: unknown,
	fallback = "Something went wrong",
) => {
	if (error instanceof Error) {
		return error.message.trim() || fallback;
	}

	if (typeof error === "string") {
		return error.trim() || fallback;
	}

	if (isRecord(error) && typeof error.message === "string") {
		return error.message.trim() || fallback;
	}

	return fallback;
};

export const getFieldError = (err: unknown): string => {
	if (!err) return "";
	if (typeof err === "string") return err;
	if (err instanceof Error) return err.message;
	if (isRecord(err) && "message" in err) {
		return String(err.message ?? "");
	}
	return String(err);
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};
