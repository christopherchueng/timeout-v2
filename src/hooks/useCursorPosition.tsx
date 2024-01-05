import { useCallback, useState } from "react";
import { useWindowDimensions } from ".";

const useCursorPosition = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const { width } = useWindowDimensions();

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setCursorPosition({
        x: width! >= 640 ? e.clientX - 5 : e.clientX - 80,
        y: e.clientY + 10,
      });
    },
    [width],
  );

  return {
    cursorPosition,
    onMouseMove,
  };
};

export default useCursorPosition;
