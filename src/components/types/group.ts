/**
 * Group Type Definitions
 *
 * Shared types for content grouping (Pro, Contra, Fragezeiten).
 * Consolidates group-related types used across components and utilities.
 *
 * @module components/types/group
 */

import { GROUPS } from "@/utils/types";

/**
 * Group type derived from GROUPS constant
 * Values: "pro" | "kontra" | "fragezeiten"
 */
export type Group = (typeof GROUPS)[number];

/**
 * Alternative group type notation used in some components
 * Maps to canonical GROUPS values:
 * - "pro" → "pro"
 * - "contra" → "kontra"
 * - "question-time" → "fragezeiten"
 */
export type GroupType = "pro" | "question-time" | "contra";

/**
 * Group configuration for UI display
 * Includes visual styling and labeling information
 */
export interface GroupConfig {
  /** Group type identifier */
  type: string;
  /** Icon name (from astro-icon or custom icons) */
  icon: string;
  /** Display label for the group */
  label: string;
  /** CSS gradient for visual styling */
  gradient: string;
  /** Optional slogan or description */
  slogan?: string;
  /** Optional title for the group */
  title?: string;
}

/**
 * Maps alternative group notation to canonical values
 */
export const GROUP_TYPE_MAP: Record<GroupType, Group> = {
  pro: "pro",
  contra: "kontra",
  "question-time": "fragezeiten",
} as const;

/**
 * Maps canonical group values to alternative notation
 */
export const GROUP_TO_TYPE_MAP: Record<Group, GroupType> = {
  pro: "pro",
  kontra: "contra",
  fragezeiten: "question-time",
} as const;

/**
 * Type guard to check if a value is a valid Group
 */
export function isGroup(value: unknown): value is Group {
  return typeof value === "string" && GROUPS.includes(value as Group);
}

/**
 * Type guard to check if a value is a valid GroupType
 */
export function isGroupType(value: unknown): value is GroupType {
  return (
    typeof value === "string" &&
    (value === "pro" || value === "question-time" || value === "contra")
  );
}

/**
 * Convert GroupType to canonical Group value
 */
export function groupTypeToGroup(groupType: GroupType): Group {
  return GROUP_TYPE_MAP[groupType];
}

/**
 * Convert canonical Group to GroupType
 */
export function groupToGroupType(group: Group): GroupType {
  return GROUP_TO_TYPE_MAP[group];
}
