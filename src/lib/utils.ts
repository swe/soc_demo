import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The type-scale utilities in globals.css (`text-callout`, `text-title-3`, …)
// are font sizes. Without registering them, tailwind-merge treats them as text
// colours and drops a sibling colour such as `text-white`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "caption",
            "footnote",
            "callout",
            "body",
            "headline",
            "title-1",
            "title-2",
            "title-3",
            "large-title",
            "metric",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
