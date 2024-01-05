"use client";

type SettingsProps = {
  editIcon: JSX.Element;
  editText: string;
  deleteIcon: JSX.Element;
  deleteText: string;
  handleEditAction: () => void;
  handleDeleteAction: () => void;
};

const SettingsDropdown = ({
  editIcon,
  editText,
  deleteIcon,
  deleteText,
  handleEditAction,
  handleDeleteAction,
}: SettingsProps) => {
  return (
    <div className="flex flex-col justify-center text-sm">
      <button
        onClick={handleEditAction}
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

export default SettingsDropdown;