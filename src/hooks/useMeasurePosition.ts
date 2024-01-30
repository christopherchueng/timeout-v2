import { HTMLMotionProps } from "framer-motion";
import { useEffect, useRef } from "react";

export function useMeasurePosition(
  update: (pos: { height: number; top: number }) => void,
) {
  const ref = useRef<HTMLMotionProps<"div">>(null);

  useEffect(() => {
    if (ref.current) {
      console.log(ref.current);
      update({
        height: ref.current.offsetHeight,
        top: ref.current.offsetTop,
      });
    }
  });

  return ref;
}
