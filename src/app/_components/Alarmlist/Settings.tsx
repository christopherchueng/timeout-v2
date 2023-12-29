"use client";

import DeleteAlarmlistIcon from "../UI/DeleteAlarmlistIcon";
import EditIcon from "../UI/EditIcon";

type SettingsProps = {
  handleRenameAction: () => void;
  handleDeleteAction: () => void;
};

const Settings = ({
  handleRenameAction,
  handleDeleteAction,
}: SettingsProps) => {
  return (
    <div className="flex flex-col justify-center text-sm">
      <button
        onClick={handleRenameAction}
        className="flex cursor-pointer items-center gap-1.5 px-2 py-2 transition hover:bg-gray-200"
      >
        <EditIcon />
        <span>Rename</span>
      </button>
      <button
        onClick={handleDeleteAction}
        className="flex cursor-pointer items-center gap-1.5 px-2 py-2 text-red-600 transition hover:bg-gray-200"
      >
        <DeleteAlarmlistIcon />
        <span>Delete</span>
      </button>
    </div>
  );
};

export default Settings;
