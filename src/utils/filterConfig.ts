/**
 * Filter Configuration
 * Constants and types for blog filtering
 */

import type { GroupType } from "@/utils/ui/BlogFilterEngine";

// Constants for group types to ensure consistency and type safety
export const GROUP_TYPES = {
  PRO: "pro",
  QUESTION_TIME: "question-time",
  CONTRA: "contra",
} as const;

// Define all available groups
export const allGroups: GroupType[] = [
  GROUP_TYPES.PRO,
  GROUP_TYPES.QUESTION_TIME,
  GROUP_TYPES.CONTRA,
];

export type GroupConfig = {
  icon: string;
  gradient: string;
  title: string;
  slogan: string;
};
