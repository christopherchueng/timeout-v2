"use client";

import DeleteAlarmlistIcon from "../UI/DeleteAlarmlistIcon";

type SettingsProps = {
  handleSettingsClick: () => void;
};

const Settings = ({ handleSettingsClick }: SettingsProps) => {
  return (
    <div className="flex justify-center text-sm">
      <button
        onClick={handleSettingsClick}
        className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-2 hover:bg-gray-200"
      >
        <DeleteAlarmlistIcon />
        <span>Delete</span>
      </button>
    </div>
  );
};

export default Settings;
