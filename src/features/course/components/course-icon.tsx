import {
	IconBinaryTree,
	IconBook,
	IconCpu,
	IconDatabase,
	IconMath,
	IconNetwork,
	IconWorld,
} from "@tabler/icons-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface CourseIconProps extends ComponentProps<"svg"> {
	code?: string;
}

export const CourseIcon = ({ code, className, ...props }: CourseIconProps) => {
	const normalizedCode = code?.trim().toUpperCase();

	switch (normalizedCode) {
		case "MATH":
			return <IconMath className={cn("shrink-0", className)} {...props} />;
		case "DSA":
			return (
				<IconBinaryTree className={cn("shrink-0", className)} {...props} />
			);
		case "WEB":
			return <IconWorld className={cn("shrink-0", className)} {...props} />;
		case "DB":
			return <IconDatabase className={cn("shrink-0", className)} {...props} />;
		case "OS":
			return <IconCpu className={cn("shrink-0", className)} {...props} />;
		case "NET":
			return <IconNetwork className={cn("shrink-0", className)} {...props} />;
		default:
			return <IconBook className={cn("shrink-0", className)} {...props} />;
	}
};
