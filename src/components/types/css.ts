// CSS Types
/** CSS class value type */
export type CSSClassValue = boolean | undefined;

/** CSS classes object structure */
export interface CSSClassesObject extends Record<string, string | undefined> {
  container?: string;
  title?: string;
  subtitle?: string;
  content?: string;
}

/** CSS classes type */
export type CSSClasses = CSSClassesObject;
