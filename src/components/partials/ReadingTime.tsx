import { LOCALE } from "@/config";
import { Icon } from "astro-icon/components";

interface Props {
  readingTime?: number;
  size?: "sm" | "lg";
  className?: string;
}

const localeStrings =
  LOCALE.lang.toString() === "en"
    ? {
        readingTime: "Reading time: ",
      }
    : {
        readingTime: "Lesezeit: ",
      };

export default function ReadingTime({
  readingTime,
  size = "sm",
  className = "",
}: Props) {
  return (
    <>
      {readingTime && (
        <div
          className={`flex items-center space-x-1 opacity-80 ${className}`.trim()}
        >
          <Icon
            name="tabler:clock"
            class:list={{
              "inline-block fill-skin-base": true,
              "h-5 w-5": size === "sm",
            }}
          />
          <span
            className={`sr-only italic ${size === "sm" ? "text-sm" : "text-base"}`}
          >
            {localeStrings.readingTime}
          </span>
          <span className={`italic ${size === "sm" ? "text-sm" : "text-base"}`}>
            {readingTime} Minuten
          </span>
        </div>
      )}
    </>
  );
}
