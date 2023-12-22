import DeleteAlarmlistIcon from "../UI/DeleteAlarmlistIcon";

const Settings = () => {
  return (
    <div className="absolute right-0 top-6 z-10 flex w-28 animate-dilate flex-col rounded border bg-white p-2 md:left-0 ">
      {/* <div className="cursor-pointer rounded-md px-2 py-2 hover:bg-gray-200">
        <span>Edit</span>
      </div> */}
      <div className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-2 hover:bg-gray-200">
        <DeleteAlarmlistIcon />
        <span>Delete</span>
      </div>
    </div>
  );
};

export default Settings;
