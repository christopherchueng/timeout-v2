"use client";

import { api } from "@/trpc/react";

import Alarmlist from "../Alarmlist";
import { Accordion } from "../Accordian";
import Loading from "./loading";
import { useEffect, useRef, useState } from "react";

const Alarmlists = ({ width }: { width?: number }) => {
  const { data: alarmlists, isLoading } =
    api.alarmlist.getAllWithAlarms.useQuery();

  if (isLoading) return <Loading width={width} />;

  if (!alarmlists?.length) {
    return (
      <p className="flex h-full justify-center pt-10 text-xs italic text-gray-400">
        No Alarmlists!
      </p>
    );
  }

  return (
    <Accordion>
      {alarmlists.map((alarmlist) => (
        <Alarmlist key={alarmlist.id} alarmlist={alarmlist} />
      ))}
    </Accordion>
  );
};

const [minWidth, maxWidth, defaultWidth] = [300, 400, 350];

const Sidebar = () => {
  const [width, setWidth] = useState(
    Number(localStorage.getItem("sidebarWidth")) || defaultWidth,
  );
  const isResized = useRef(false);

  useEffect(() => {
    const handleResizeWidth = (e: MouseEvent) => {
      if (!isResized.current) {
        return;
      }

      setWidth((previousWidth) => {
        const newWidth = previousWidth + e.movementX / 2;

        const isWidthInRange = newWidth >= minWidth && newWidth <= maxWidth;

        return isWidthInRange ? newWidth : previousWidth;
      });
    };

    window.addEventListener("mousemove", handleResizeWidth);

    const handleMouseUpEvent = (): void => {
      isResized.current = false;
    };

    window.addEventListener("mouseup", handleMouseUpEvent);

    return () => {
      window.removeEventListener("mousemove", handleResizeWidth);
      window.removeEventListener("mouseup", handleMouseUpEvent);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarWidth", width.toString());
  }, [width]);

  return (
    <aside className="flex h-full w-full overflow-x-auto overflow-y-scroll pt-18 sm:w-auto sm:flex-none">
      <div
        className="hidden w-full sm:block sm:w-auto"
        style={{ width: `${width / 16}rem` }}
      >
        <Alarmlists width={width / 16} />
      </div>
      <div className="w-full sm:hidden">
        <Alarmlists />
      </div>
      {/* Handle */}
      <div
        className="hidden w-1 cursor-col-resize transition-all dark:bg-zinc-600 dark:hover:bg-zinc-600/70 sm:block"
        onMouseDown={() => {
          isResized.current = true;
        }}
      />
    </aside>
  );
};

export default Sidebar;
