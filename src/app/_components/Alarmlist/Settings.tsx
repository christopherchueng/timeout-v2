"use client";

import { Alarmlist } from "@prisma/client";

import DeleteAlarmlistIcon from "../UI/DeleteAlarmlistIcon";
import { useCallback, useState } from "react";
import Modal from "../Modal";
import { Button } from "../UI";
import { api } from "@/trpc/react";

type SettingsProps = {
  alarmlist: Alarmlist;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Settings = ({ alarmlist, setIsSettingsOpen }: SettingsProps) => {
  const [isDeleteAlarmlistModalOpen, setIsDeleteAlarmlistModalOpen] =
    useState(false);

  const handleDeleteAlarmlistModal = useCallback(() => {
    setIsSettingsOpen(false);
    setIsDeleteAlarmlistModalOpen((prev) => !prev);
  }, []);

  const ctx = api.useUtils();

  const { mutate: deleteAlarmlist } = api.alarmlist.delete.useMutation({
    onSuccess: () => {
      void ctx.alarmlist.getAll.invalidate();
    },
  });

  return (
    <div className="absolute right-0 top-6 z-10 flex w-28 animate-dilate flex-col rounded border bg-white p-2 sm:left-0 ">
      {/* <div className="cursor-pointer rounded-md px-2 py-2 hover:bg-gray-200">
        <span>Edit</span>
      </div> */}
      <div
        onClick={handleDeleteAlarmlistModal}
        className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-2 hover:bg-gray-200"
      >
        <DeleteAlarmlistIcon />
        <span>Delete</span>
      </div>
      {isDeleteAlarmlistModalOpen && (
        <Modal
          isOpen={isDeleteAlarmlistModalOpen}
          handleClose={handleDeleteAlarmlistModal}
        >
          <div className="flex flex-col gap-4">
            <div className="text-xs leading-6">
              <p>{`Are you sure you want to delete '${alarmlist.name}'?`}</p>
              <p className="italic text-gray-400">{`All alarms under '${alarmlist.name}' will be deleted.`}</p>
            </div>
            <Button onClick={() => deleteAlarmlist({ id: alarmlist.id })}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Settings;
