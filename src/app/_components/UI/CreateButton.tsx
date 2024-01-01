"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CreateAlarmlistIcon, Plus } from ".";
import Tooltip from "./Tooltip";
import Modal from "../Modal";
import CreateAlarmlistForm from "../CreateAlarmlistForm";

// Chevron is different from alarmlist chevron to avoid toggle logic.
// This chevron will never be grayed out whereas the alarmlist chevron could.
const Chevron = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    data-slot="icon"
    className={clsx(
      "h-3.5 w-3.5 -rotate-90 stroke-slate-900 transition duration-75",
      isOpen && "rotate-0",
    )}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const CreateAlarmIcon = () => (
  <svg
    fill="#000000"
    className="h-3.5 w-3.5"
    viewBox="0 0 32 32"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>alarm-plus</title>
    <path d="M16 2.75c-0.006 0-0.013 0-0.020 0-7.307 0-13.231 5.924-13.231 13.231 0 3.532 1.384 6.74 3.638 9.113l-0.005-0.006-3.353 4.124c-0.175 0.213-0.28 0.489-0.28 0.789 0 0.69 0.56 1.25 1.25 1.25 0.39 0 0.739-0.179 0.968-0.459l0.002-0.002 3.296-4.053c2.14 1.571 4.827 2.514 7.734 2.514 2.925 0 5.626-0.954 7.811-2.569l-0.036 0.025 3.249 4.073c0.231 0.285 0.581 0.466 0.974 0.466 0.69 0 1.249-0.559 1.249-1.249 0-0.294-0.102-0.565-0.272-0.778l0.002 0.003-3.326-4.17c2.229-2.363 3.6-5.557 3.6-9.071 0-7.307-5.923-13.23-13.23-13.23-0.007 0-0.014 0-0.021 0h0.001zM5.25 16c0-5.937 4.813-10.75 10.75-10.75s10.75 4.813 10.75 10.75c0 5.937-4.813 10.75-10.75 10.75v0c-5.934-0.007-10.743-4.816-10.75-10.749v-0.001zM3.552 8.878c0 0 0.001 0 0.001 0 0.69 0 1.25-0.56 1.25-1.25 0-0.469-0.258-0.878-0.64-1.092l-0.006-0.003c-0.544-0.304-0.906-0.876-0.906-1.533 0-0.967 0.784-1.75 1.75-1.75 0.657 0 1.229 0.362 1.529 0.897l0.005 0.009c0.217 0.388 0.625 0.645 1.094 0.645 0.69 0 1.25-0.559 1.25-1.25 0-0.222-0.058-0.43-0.159-0.611l0.003 0.006c-0.738-1.32-2.127-2.197-3.722-2.197-2.347 0-4.25 1.903-4.25 4.25 0 1.595 0.878 2.984 2.178 3.712l0.022 0.011c0.174 0.098 0.381 0.155 0.602 0.155 0 0 0 0 0 0v0zM27 0.75c-0 0-0 0-0 0-1.594 0-2.983 0.878-3.709 2.177l-0.011 0.022c-0.099 0.175-0.158 0.385-0.158 0.608 0 0.69 0.559 1.249 1.249 1.249 0.47 0 0.88-0.26 1.093-0.644l0.003-0.006c0.304-0.544 0.876-0.905 1.533-0.905 0.967 0 1.75 0.784 1.75 1.75 0 0.657-0.362 1.229-0.897 1.529l-0.009 0.005c-0.388 0.217-0.647 0.626-0.647 1.095 0 0.69 0.56 1.25 1.25 1.25 0.221 0 0.429-0.058 0.61-0.159l-0.006 0.003c1.321-0.738 2.199-2.128 2.199-3.723 0-2.347-1.903-4.25-4.25-4.25 0 0 0 0-0 0v0zM22 14.75h-4.75v-4.75c0-0.69-0.56-1.25-1.25-1.25s-1.25 0.56-1.25 1.25v0 4.75h-4.75c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h4.75v4.75c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-4.75h4.75c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0z"></path>
  </svg>
);

const CreateButton = () => {
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <button
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => {
          setIsTabOpen((prev) => !prev);
          setIsHovering(false);
        }}
        className="h-full rounded border border-slate-900 transition hover:border-slate-500 hover:bg-gray-100 active:bg-gray-200"
      >
        <div className="flex h-full items-center gap-0.5 px-1">
          <Plus />
          <Chevron isOpen={isTabOpen} />
        </div>
        {isTabOpen && (
          <div className="relative animate-dilate transition-all">
            <div className="absolute left-0 top-1.5 z-50 flex h-fit w-36 flex-col whitespace-nowrap rounded-md border bg-white p-2 shadow-lg">
              <div
                onClick={() => setIsModalOpen((prev) => !prev)}
                className="cursor-pointer rounded-md px-2 py-2 hover:z-50 hover:bg-gray-200"
              >
                <div className="flex items-center gap-1.5">
                  <CreateAlarmlistIcon />
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
      </button>
      {isHovering && !isTabOpen && (
        <div className="absolute mx-auto inline-flex justify-center">
          <Tooltip text="Create new" />
        </div>
      )}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          handleClose={() => setIsModalOpen((prev) => !prev)}
        >
          <CreateAlarmlistForm setIsModalOpen={setIsModalOpen} />
        </Modal>
      )}
    </div>
  );
};

export default CreateButton;
