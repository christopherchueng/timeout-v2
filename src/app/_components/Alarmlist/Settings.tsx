"use client";

import type { Alarmlist } from "@prisma/client";
import { api } from "@/trpc/react";
import DeleteAlarmlistIcon from "../UI/DeleteAlarmlistIcon";
import Modal from "../Modal";
import { Button } from "../UI";
import toast from "react-hot-toast";

type SettingsProps = {
  alarmlist: Alarmlist;
  isDeleteAlarmlistModalOpen: boolean;
  handleDeleteAlarmlistModal: () => void;
};

const Settings = ({
  alarmlist,
  handleDeleteAlarmlistModal,
  isDeleteAlarmlistModalOpen,
}: SettingsProps) => {
  const ctx = api.useUtils();

  const { mutate: deleteAlarmlist, isLoading } =
    api.alarmlist.delete.useMutation({
      onMutate: async ({ id }) => {
        // Cancel any outgoing refetches so they don't overwrite our optimistic update
        await ctx.alarmlist.getAll.cancel();

        // Snapshot the previous value
        const previousAlarmlists = ctx.alarmlist.getAll.getData();

        // Optimistically update to the new value
        ctx.alarmlist.getAll.setData(undefined, (prev) => {
          if (!prev) return previousAlarmlists;
          return prev.filter((prevAlarmlist) => prevAlarmlist.id !== id);
        });

        // Return a context object with the snapshotted value
        return { previousAlarmlists };
      },
      onSuccess: () => {
        toast.success(`'${alarmlist.name}' has been deleted!`);
        void ctx.alarmlist.getAllWithAlarms.invalidate();
      },
      // If the mutation fails,
      // use the context returned from onMutate to roll back
      onError: (_err, _deletedAlarmlist, context) => {
        toast.error(`An error occurred while deleting '${alarmlist.name}'.`);

        if (!context) return;

        ctx.alarmlist.getAll.setData(
          undefined,
          () => context.previousAlarmlists,
        );
      },
    });

  return (
    <div className="absolute right-0 top-6 z-10 flex w-28 animate-dilate flex-col rounded border bg-white p-2 sm:left-0 ">
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
          <div className="flex flex-col items-center gap-2.5">
            <DeleteAlarmlistIcon size={40} />
            <div className="text-center text-xs leading-6">
              <p className="font-bold">{`Delete '${alarmlist.name}'?`}</p>
              <p className="italic text-gray-400">{`All alarms under '${alarmlist.name}' will be deleted.`}</p>
            </div>
            <Button
              disabled={isLoading}
              onClick={() => {
                handleDeleteAlarmlistModal();
                deleteAlarmlist({ id: alarmlist.id });
              }}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Settings;
