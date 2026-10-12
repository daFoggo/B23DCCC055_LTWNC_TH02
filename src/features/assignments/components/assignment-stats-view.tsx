import {
	IconCalendarStats,
	IconCheck,
	IconClock,
	IconListCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/features/course";
import { CourseIcon } from "@/features/course";
import { calcStats } from "../lib";
import type { Assignment } from "../schemas";

interface AssignmentStatsViewProps {
	assignments: Assignment[];
	courses: Course[];
}

export const AssignmentStatsView = ({
	assignments,
	courses,
}: AssignmentStatsViewProps) => {
	const stats = calcStats(assignments);

	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card size="sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Tổng bài tập</CardTitle>
						<IconListCheck className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">
							Tất cả bài tập đã giao
						</p>
					</CardContent>
				</Card>

				<Card size="sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
						<IconCheck className="size-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{stats.completed}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.total > 0
								? `${Math.round((stats.completed / stats.total) * 100)}% tổng số`
								: "0%"}
						</p>
					</CardContent>
				</Card>

				<Card size="sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Đang triển khai
						</CardTitle>
						<IconClock className="size-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-primary">
							{stats.inProgress}
						</div>
						<p className="text-xs text-muted-foreground">Chưa đến hạn nộp</p>
					</CardContent>
				</Card>

				<Card size="sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
						<IconCalendarStats className="size-4 text-destructive" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-destructive">
							{stats.overdue}
						</div>
						<p className="text-xs text-muted-foreground">Cần hoàn thành gấp</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base font-semibold">
						Thống kê theo môn học
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col divide-y divide-border">
						{courses.map((course) => {
							const courseStat = stats.byCourse[course.id] ?? {
								total: 0,
								completed: 0,
								overdue: 0,
							};
							const percent =
								courseStat.total > 0
									? Math.round((courseStat.completed / courseStat.total) * 100)
									: 0;

							return (
								<div
									key={course.id}
									className="flex flex-wrap items-center justify-between gap-3 py-3"
								>
									<div className="flex items-center gap-2">
										<CourseIcon code={course.code} className="size-4" />
										<span className="font-medium">{course.name}</span>
										<Badge variant="outline" className="text-xs">
											{course.code}
										</Badge>
									</div>
									<div className="flex items-center gap-4 text-sm">
										<span className="text-muted-foreground">
											Tổng: <strong>{courseStat.total}</strong>
										</span>
										<span className="text-green-600">
											Đã xong: <strong>{courseStat.completed}</strong>
										</span>
										{courseStat.overdue > 0 && (
											<span className="text-destructive">
												Quá hạn: <strong>{courseStat.overdue}</strong>
											</span>
										)}
										<Badge variant="secondary">{percent}% hoàn thành</Badge>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default AssignmentStatsView;
