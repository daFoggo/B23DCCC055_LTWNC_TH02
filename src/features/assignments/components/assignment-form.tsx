import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/features/course";
import { CourseIcon } from "@/features/course";
import { getFieldError } from "@/lib/error";
import { fromLocalInputValue, PRIORITY_META, toLocalInputValue } from "../lib";
import type { NewAssignmentInput, Priority } from "../schemas";
import { NewAssignmentInputSchema, PRIORITIES } from "../schemas";

interface AssignmentFormProps {
	courses: Course[];
	defaultValues: NewAssignmentInput;
	submitLabel: string;
	onSubmit: (input: NewAssignmentInput) => Promise<void> | void;
}

export const AssignmentForm = ({
	courses,
	defaultValues,
	submitLabel,
	onSubmit,
}: AssignmentFormProps) => {
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: NewAssignmentInputSchema,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-4"
		>
			<form.Field name="courseId">
				{(field) => {
					const errorMsg = getFieldError(field.state.meta.errors[0]);
					const selectedCourse = courses.find(
						(course) => course.id === field.state.value,
					);
					return (
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={field.name}>Môn học</Label>
							<Select
								value={field.state.value}
								onValueChange={(value) => field.handleChange(value ?? "")}
							>
								<SelectTrigger id={field.name} className="w-full">
									<SelectValue placeholder="Chọn môn học">
										{selectedCourse ? (
											<span className="flex items-center gap-2">
												<CourseIcon
													code={selectedCourse.code}
													className="size-4"
												/>
												<span>{selectedCourse.name}</span>
											</span>
										) : null}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{courses.map((course) => (
										<SelectItem key={course.id} value={course.id}>
											<span className="flex items-center gap-2">
												<CourseIcon code={course.code} className="size-4" />
												<span>{course.name}</span>
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errorMsg && (
								<p className="text-xs font-medium text-destructive">
									{errorMsg}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Field
				name="name"
				validators={{
					onBlur: ({ value }) => {
						const result = NewAssignmentInputSchema.shape.name.safeParse(value);
						return result.success ? undefined : result.error.issues[0]?.message;
					},
				}}
			>
				{(field) => {
					const errorMsg = getFieldError(field.state.meta.errors[0]);
					return (
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={field.name}>Tên bài tập</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={field.state.meta.errors.length > 0}
								placeholder="VD: Bài tập chương 1"
							/>
							{errorMsg && (
								<p className="text-xs font-medium text-destructive">
									{errorMsg}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Field name="deadline">
				{(field) => {
					const errorMsg = getFieldError(field.state.meta.errors[0]);
					return (
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={field.name}>Hạn nộp</Label>
							<Input
								id={field.name}
								name={field.name}
								type="datetime-local"
								value={toLocalInputValue(field.state.value)}
								onChange={(e) =>
									field.handleChange(fromLocalInputValue(e.target.value))
								}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							{errorMsg && (
								<p className="text-xs font-medium text-destructive">
									{errorMsg}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Field name="priority">
				{(field) => {
					const errorMsg = getFieldError(field.state.meta.errors[0]);
					return (
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={field.name}>Độ ưu tiên</Label>
							<Select
								value={field.state.value}
								onValueChange={(value) => field.handleChange(value as Priority)}
							>
								<SelectTrigger id={field.name} className="w-full">
									<SelectValue placeholder="Chọn độ ưu tiên">
										{PRIORITY_META[field.state.value].label}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{PRIORITIES.map((priority) => (
										<SelectItem key={priority} value={priority}>
											{PRIORITY_META[priority].label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errorMsg && (
								<p className="text-xs font-medium text-destructive">
									{errorMsg}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						className="mt-2 w-full"
						disabled={!canSubmit || isSubmitting}
					>
						{submitLabel}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
};
