import { describe, expect, it } from "vitest";
import {
	calcDaysLeft,
	calcStats,
	describeDeadline,
	filterAndSortAssignments,
	getAssignmentStatus,
	getDeadlineLabel,
	isOverdue,
} from "./lib";
import type { Assignment } from "./schemas";

describe("assignments lib unit tests", () => {
	const fixedNow = new Date("2026-10-10T12:00:00.000Z");

	describe("isOverdue", () => {
		it("returns false if assignment is completed regardless of deadline", () => {
			const completedPastAssignment = {
				completed: true,
				deadline: "2026-10-01T12:00:00.000Z",
			};
			expect(isOverdue(completedPastAssignment, fixedNow)).toBe(false);
		});

		it("returns true if assignment is not completed and deadline is in the past", () => {
			const overdueAssignment = {
				completed: false,
				deadline: "2026-10-09T12:00:00.000Z",
			};
			expect(isOverdue(overdueAssignment, fixedNow)).toBe(true);
		});

		it("returns false if assignment is not completed and deadline is in the future", () => {
			const futureAssignment = {
				completed: false,
				deadline: "2026-10-15T12:00:00.000Z",
			};
			expect(isOverdue(futureAssignment, fixedNow)).toBe(false);
		});

		it("handles edge case: exact deadline match", () => {
			const exactAssignment = {
				completed: false,
				deadline: "2026-10-10T12:00:00.000Z",
			};
			expect(isOverdue(exactAssignment, fixedNow)).toBe(false);
		});
	});

	describe("calcDaysLeft", () => {
		it("calculates positive days left for future deadline", () => {
			const future = "2026-10-13T12:00:00.000Z";
			expect(calcDaysLeft(future, fixedNow)).toBe(3);
		});

		it("calculates negative days for past deadline", () => {
			const past = "2026-10-08T12:00:00.000Z";
			expect(calcDaysLeft(past, fixedNow)).toBe(-2);
		});

		it("calculates 0 days left for exact current time", () => {
			const today = "2026-10-10T12:00:00.000Z";
			expect(calcDaysLeft(today, fixedNow)).toBe(0);
		});
	});

	describe("getDeadlineLabel & describeDeadline", () => {
		it("returns remaining kind for future deadline", () => {
			const label = getDeadlineLabel("2026-10-12T12:00:00.000Z", fixedNow);
			expect(label).toEqual({ kind: "remaining", days: 2 });
			expect(describeDeadline("2026-10-12T12:00:00.000Z", fixedNow)).toBe(
				"Còn 2 ngày",
			);
		});

		it("returns overdue kind for past deadline", () => {
			const label = getDeadlineLabel("2026-10-08T12:00:00.000Z", fixedNow);
			expect(label).toEqual({ kind: "overdue", days: 2 });
			expect(describeDeadline("2026-10-08T12:00:00.000Z", fixedNow)).toBe(
				"Quá hạn 2 ngày",
			);
		});

		it("returns today kind for today deadline", () => {
			const label = getDeadlineLabel("2026-10-10T12:00:00.000Z", fixedNow);
			expect(label).toEqual({ kind: "today" });
			expect(describeDeadline("2026-10-10T12:00:00.000Z", fixedNow)).toBe(
				"Hạn nộp hôm nay",
			);
		});
	});

	describe("getAssignmentStatus", () => {
		it("returns completed if completed is true", () => {
			expect(
				getAssignmentStatus(
					{ completed: true, deadline: "2026-10-01T00:00:00.000Z" },
					fixedNow,
				),
			).toBe("completed");
		});

		it("returns overdue if not completed and deadline passed", () => {
			expect(
				getAssignmentStatus(
					{ completed: false, deadline: "2026-10-01T00:00:00.000Z" },
					fixedNow,
				),
			).toBe("overdue");
		});

		it("returns in-progress if not completed and deadline in future", () => {
			expect(
				getAssignmentStatus(
					{ completed: false, deadline: "2026-10-20T00:00:00.000Z" },
					fixedNow,
				),
			).toBe("in-progress");
		});
	});

	describe("calcStats", () => {
		const sampleAssignments: Assignment[] = [
			{
				id: "1",
				courseId: "course-web",
				name: "Bài 1",
				deadline: "2026-10-15T00:00:00.000Z", // in-progress
				priority: "high",
				completed: false,
				createdAt: "2026-10-01T00:00:00.000Z",
			},
			{
				id: "2",
				courseId: "course-web",
				name: "Bài 2",
				deadline: "2026-10-05T00:00:00.000Z", // overdue
				priority: "medium",
				completed: false,
				createdAt: "2026-10-01T00:00:00.000Z",
			},
			{
				id: "3",
				courseId: "course-db",
				name: "Bài 3",
				deadline: "2026-10-01T00:00:00.000Z", // completed
				priority: "low",
				completed: true,
				createdAt: "2026-10-01T00:00:00.000Z",
			},
		];

		it("computes overall and per-course stats correctly", () => {
			const stats = calcStats(sampleAssignments, fixedNow);
			expect(stats.total).toBe(3);
			expect(stats.completed).toBe(1);
			expect(stats.overdue).toBe(1);
			expect(stats.inProgress).toBe(1);

			expect(stats.byCourse["course-web"]).toEqual({
				total: 2,
				completed: 0,
				overdue: 1,
			});
			expect(stats.byCourse["course-db"]).toEqual({
				total: 1,
				completed: 1,
				overdue: 0,
			});
		});

		it("handles edge case: empty assignments array", () => {
			const stats = calcStats([], fixedNow);
			expect(stats).toEqual({
				total: 0,
				completed: 0,
				inProgress: 0,
				overdue: 0,
				byCourse: {},
			});
		});
	});

	describe("filterAndSortAssignments", () => {
		const list: Assignment[] = [
			{
				id: "1",
				courseId: "course-web",
				name: "Bài tập React",
				deadline: "2026-10-15T00:00:00.000Z",
				priority: "high",
				completed: false,
				createdAt: "2026-10-01T00:00:00.000Z",
			},
			{
				id: "2",
				courseId: "course-db",
				name: "Bài tập SQL",
				deadline: "2026-10-20T00:00:00.000Z",
				priority: "low",
				completed: false,
				createdAt: "2026-10-01T00:00:00.000Z",
			},
			{
				id: "3",
				courseId: "course-web",
				name: "Đồ án Web",
				deadline: "2026-10-12T00:00:00.000Z",
				priority: "medium",
				completed: false,
				createdAt: "2026-10-01T00:00:00.000Z",
			},
		];

		it("filters by searchQuery matching name or courseName", () => {
			const courseNameById = {
				"course-web": "Lập trình web",
				"course-db": "Cơ sở dữ liệu",
			};
			const resultName = filterAndSortAssignments(
				list,
				{ searchQuery: "React" },
				courseNameById,
			);
			expect(resultName.map((i) => i.id)).toEqual(["1"]);

			const resultCourse = filterAndSortAssignments(
				list,
				{ searchQuery: "dữ liệu" },
				courseNameById,
			);
			expect(resultCourse.map((i) => i.id)).toEqual(["2"]);
		});

		it("filters by priorityFilter and courseFilter", () => {
			const resultPriority = filterAndSortAssignments(list, {
				priorityFilter: "low",
			});
			expect(resultPriority.map((i) => i.id)).toEqual(["2"]);

			const resultCourse = filterAndSortAssignments(list, {
				courseFilter: "course-web",
			});
			expect(resultCourse.length).toBe(2);
		});

		it("sorts pinned assignments first", () => {
			const result = filterAndSortAssignments(list, { pinnedIds: ["2"] });
			expect(result[0].id).toBe("2");
		});

		it("sorts by deadline-desc and priority-desc and name-asc", () => {
			const desc = filterAndSortAssignments(list, { sortBy: "deadline-desc" });
			expect(desc[0].id).toBe("2");

			const byPrio = filterAndSortAssignments(list, {
				sortBy: "priority-desc",
			});
			expect(byPrio[0].id).toBe("1"); // high is highest

			const byName = filterAndSortAssignments(list, { sortBy: "name-asc" });
			expect(byName[0].id).toBe("1"); // "Bài tập React" < "Bài tập SQL"
		});
	});
});
