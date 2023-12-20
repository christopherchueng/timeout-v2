"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Chevron, CreateAlarmlist, Plus } from ".";
import Tooltip from "./Tooltip";

const CreateAlarmIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <g clipPath="url(#clip0_0_1)">
      <path
        d="M11.9999 1.57384H11.9845C6.23479 1.57384 1.57369 6.23493 1.57369 11.9847C1.57369 14.7636 2.66244 17.2882 4.43666 19.1552L4.43248 19.1507L1.79419 22.3955C1.65678 22.5633 1.57349 22.7801 1.57349 23.0164C1.57349 23.5597 2.0139 24.0001 2.55724 24.0001C2.86428 24.0001 3.13848 23.8595 3.3189 23.639L3.32027 23.6373L5.91354 20.4479C7.59796 21.6842 9.71214 22.4262 11.9996 22.4262C14.301 22.4262 16.4269 21.6752 18.1457 20.4047L18.1175 20.4247L20.674 23.6296C20.8557 23.8542 21.1313 23.9966 21.4401 23.9966C21.983 23.9966 22.4232 23.5565 22.4232 23.0135C22.4232 22.782 22.3432 22.5692 22.2093 22.4012L22.2109 22.4032L19.5935 19.122C21.3478 17.263 22.4261 14.7494 22.4261 11.9841C22.4261 6.23469 17.7652 1.57389 12.0158 1.57389H11.999H11.9998L11.9999 1.57384ZM3.5409 12C3.5409 7.32826 7.32811 3.54104 11.9999 3.54104C16.6716 3.54104 20.4589 7.32826 20.4589 12C20.4589 16.6718 16.6716 20.459 11.9999 20.459C7.33027 20.4536 3.54626 16.6696 3.5409 12.0005V12ZM2.20457 6.39585H2.20556C2.74875 6.39585 3.18916 5.95544 3.18916 5.41225C3.18916 5.04315 2.9859 4.72161 2.68521 4.55332L2.68024 4.55076C2.2523 4.31155 1.9677 3.86125 1.9677 3.34454C1.9677 2.5839 2.58429 1.96725 3.34494 1.96725C3.86192 1.96725 4.31231 2.25211 4.54788 2.67338L4.55147 2.68037C4.72242 2.98533 5.04359 3.18805 5.41212 3.18805C5.95522 3.18805 6.39548 2.74779 6.39548 2.2047C6.39548 2.03011 6.34999 1.86619 6.27022 1.72408L6.27278 1.72905C5.69171 0.690538 4.59869 0 3.34435 0C1.49731 0 0 1.49734 0 3.34437C0 4.59928 0.691178 5.69277 1.71361 6.26493L1.7305 6.27361C1.86715 6.35053 2.0305 6.39583 2.20435 6.39583H2.2046L2.20457 6.39585ZM20.6556 7.37766e-05H20.6552C19.401 7.37766e-05 18.3082 0.690956 17.7365 1.71292L17.7279 1.72984C17.6497 1.86764 17.6036 2.03254 17.6036 2.20819C17.6036 2.75109 18.0437 3.19118 18.5866 3.19118C18.9566 3.19118 19.2789 2.98673 19.4466 2.68462L19.4491 2.67963C19.6884 2.25166 20.1386 1.96708 20.6554 1.96708C21.416 1.96708 22.0326 2.58368 22.0326 3.34432C22.0326 3.8613 21.7478 4.3117 21.3265 4.54727L21.3196 4.55086C21.014 4.72176 20.8108 5.04327 20.8108 5.41225C20.8108 5.95554 21.2512 6.39592 21.7945 6.39592C21.9687 6.39592 22.1324 6.35058 22.2743 6.27111L22.2694 6.27366C23.3088 5.69285 24 4.59933 24 3.3444C23.9999 1.49736 22.5026 7.37766e-05 20.6556 7.37766e-05ZM16.7212 11.0164H12.9835V7.27873C12.9835 6.73554 12.5431 6.29513 11.9999 6.29513C11.4567 6.29513 11.0163 6.73554 11.0163 7.27873V11.0164H7.27858C6.73539 11.0164 6.29498 11.4568 6.29498 12C6.29498 12.5432 6.73539 12.9836 7.27858 12.9836H11.0163V16.7213C11.0163 17.2645 11.4567 17.7049 11.9999 17.7049C12.5431 17.7049 12.9835 17.2645 12.9835 16.7213V12.9836H16.7212C17.2644 12.9836 17.7048 12.5432 17.7048 12C17.7048 11.4568 17.2644 11.0164 16.7212 11.0164Z"
        fill="black"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_1">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const CreateButton = () => {
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTabOpen) return;

    const closeTab = () => {
      setIsTabOpen(false);
      setIsHovering(false);
    };

    document.addEventListener("click", closeTab);

    return () => {
      document.removeEventListener("click", closeTab);
    };
  }, [isTabOpen]);

  return (
    <div className="relative flex flex-col">
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="h-full rounded border border-slate-900 transition hover:border-slate-500 hover:bg-gray-100 active:bg-gray-200"
      >
        <button
          onClick={() => setIsTabOpen((prev) => !prev)}
          className="flex h-full items-center gap-0.5 px-1"
        >
          <Plus />
          <Chevron />
        </button>
        {isTabOpen && (
          <div ref={tabRef} className="animate-dilate relative transition-all">
            <div className="absolute right-0 top-1.5 z-10 flex h-fit w-36 flex-col whitespace-nowrap rounded-md border bg-white p-2 shadow-lg">
              <div className="cursor-pointer rounded-md px-2 py-2 hover:bg-gray-200">
                <div className="flex items-center gap-1.5">
                  <CreateAlarmlist />
                  <span>New alarmlist</span>
                </div>
              </div>
              <Link
                className="flex items-center gap-1.5 rounded-md px-2 py-2 hover:bg-gray-200"
                href="/create"
              >
                <CreateAlarmIcon />
                <span>New alarm</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      {isHovering && !isTabOpen && (
        <div className="absolute mx-auto inline-flex justify-center">
          <Tooltip text="Create" />
        </div>
      )}
    </div>
  );
};

export default CreateButton;
