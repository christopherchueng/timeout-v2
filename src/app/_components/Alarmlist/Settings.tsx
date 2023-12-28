"use client";

import { forwardRef, useEffect } from "react";
import DeleteAlarmlistIcon from "../UI/DeleteAlarmlistIcon";
import EditIcon from "../UI/EditIcon";

type SettingsProps = {
  handleClick: ({ target }: MouseEvent) => void;
  handleSettingsClick: () => void;
  handleRenameAlarmlist: () => void;
  ref: {
    renameRef: React.RefObject<HTMLButtonElement>;
    deleteRef: React.RefObject<HTMLButtonElement>;
  };
};

const Settings = ({
  handleClick,
  handleSettingsClick,
  handleRenameAlarmlist,
  ref,
}: SettingsProps) => {
  console.log("what is ref", ref);
  useEffect(() => {
    const handleClickedOutside = (e: MouseEvent) => {
      handleClick(e);
    };

    document.addEventListener("click", handleClickedOutside);

    return () => {
      document.removeEventListener("click", handleClickedOutside);
    };
  }, [handleClick]);

  return (
    <div className="flex flex-col justify-center text-sm">
      <div>
        <button
          // ref={ref.renameRef}
          onClick={handleRenameAlarmlist}
          className="flex cursor-pointer items-center gap-1.5 px-2 py-2 transition hover:bg-gray-200"
        >
          <EditIcon />
          <span>Rename</span>
        </button>
      </div>
      <div>
        <button
          // ref={ref.deleteRef}
          onClick={handleSettingsClick}
          className="flex cursor-pointer items-center gap-1.5 px-2 py-2 transition hover:bg-gray-200"
        >
          <DeleteAlarmlistIcon />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
