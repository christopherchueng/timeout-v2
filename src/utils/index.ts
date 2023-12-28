import { type MutableRefObject, type RefCallback } from "react";
import { z } from "zod";

export const createAlarmlistSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please enter a name." })
    .max(20, { message: "Name must contain at most 20 character(s)." }),
});

export const renameAlarmlistSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, { message: "Please enter a name." })
    .max(20, { message: "Name must contain at most 20 character(s)." }),
});

type MutableRefList<T> = Array<
  RefCallback<T> | MutableRefObject<T> | undefined | null
>;

export function mergeRefs<T>(...refs: MutableRefList<T>): RefCallback<T> {
  return (val: T) => {
    setRef(val, ...refs);
  };
}

export function setRef<T>(val: T, ...refs: MutableRefList<T>): void {
  refs.forEach((ref) => {
    if (typeof ref === "function") {
      ref(val);
    } else if (ref) {
      ref.current = val;
    }
  });
}
