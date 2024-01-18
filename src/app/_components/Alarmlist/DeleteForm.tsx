"use client";

import toast from "react-hot-toast";
import type { Alarmlist } from "@prisma/client";
import { api } from "@/trpc/react";
import Modal from "../Modal";
import { Button, DeleteAlarmlistIcon } from "../UI";

type DeleteAlarmlistFormProps = {
  alarmlist: Alarmlist;
  isDeleteAlarmlistModalOpen: boolean;
  handleCloseModal: () => void;
};

const DeleteAlarmlistForm = ({
  alarmlist,
  isDeleteAlarmlistModalOpen,
  handleCloseModal,
}: DeleteAlarmlistFormProps) => {
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
    <Modal isOpen={isDeleteAlarmlistModalOpen} handleClose={handleCloseModal}>
      <div className="flex flex-col items-center gap-2.5">
        <DeleteAlarmlistIcon size={40} />
        <div className="text-center text-xs leading-6">
          <p className="font-bold dark:text-white/80">{`Delete '${alarmlist.name}'?`}</p>
          <p className="italic text-gray-400">{`All alarms under '${alarmlist.name}' will be deleted.`}</p>
        </div>
        <Button
          disabled={isLoading}
          onClick={() => {
            deleteAlarmlist({ id: alarmlist.id });
            handleCloseModal();
          }}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteAlarmlistForm;
