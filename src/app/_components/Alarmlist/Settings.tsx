"use client";

import DeleteAlarmlistIcon from "../UI/DeleteAlarmlistIcon";
import EditIcon from "../UI/EditIcon";

type SettingsProps = {
  handleSettingsClick: () => void;
};

const Settings = ({ handleSettingsClick }: SettingsProps) => {
  return (
    <div className="flex flex-col justify-center text-sm">
      <button className="flex cursor-pointer items-center gap-1.5 px-2 py-2 transition hover:bg-gray-200">
        <EditIcon />
        <span>Rename</span>
      </button>
      <button
        onClick={handleSettingsClick}
        className="flex cursor-pointer items-center gap-1.5 px-2 py-2 transition hover:bg-gray-200"
      >
        <DeleteAlarmlistIcon />
        <span>Delete</span>
      </button>
    </div>
  );
};

export default Settings;
