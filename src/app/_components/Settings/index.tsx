"use client";

import DeleteAlarmlistIcon from "../UI/DeleteAlarmlistIcon";
import EditIcon from "../UI/EditIcon";

type SettingsProps = {
  editIcon: JSX.Element;
  editText: string;
  deleteIcon: JSX.Element;
  deleteText: string;
  handleRenameAction: () => void;
  handleDeleteAction: () => void;
};

const Settings = ({
  editIcon,
  editText,
  deleteIcon,
  deleteText,
  handleRenameAction,
  handleDeleteAction,
}: SettingsProps) => {
  return (
    <div className="flex flex-col justify-center text-sm">
      <button
        onClick={handleRenameAction}
        className="flex cursor-pointer items-center gap-1.5 px-2 py-2 transition hover:bg-gray-200"
      >
        {editIcon}
        <span>{editText}</span>
      </button>
      <button
        onClick={handleDeleteAction}
        className="flex cursor-pointer items-center gap-1.5 px-2 py-2 text-red-600 transition hover:bg-gray-200"
      >
        {deleteIcon}
        <span>{deleteText}</span>
      </button>
    </div>
  );
};

export default Settings;
