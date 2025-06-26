/** Available button types */
export const BUTTON_TYPES = ["button", "submit", "reset"] as const;

/** Button type */
export type ButtonType = (typeof BUTTON_TYPES)[number];
