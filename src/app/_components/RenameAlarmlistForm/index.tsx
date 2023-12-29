import React from "react";
import {
  useForm,
  type SubmitHandler,
  SubmitErrorHandler,
} from "react-hook-form";
import type { z } from "zod";
import { renameAlarmlistSchema } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export type AlarmlistFormValues = z.infer<typeof renameAlarmlistSchema>;
type Alarmlist = RouterOutputs["alarmlist"]["getAll"][number];

type RenameAlarmlistFormProps = {
  alarmlist: Alarmlist;
  handleSuccessfulRename: () => void;
};

const RenameAlarmlistForm = ({
  alarmlist,
  handleSuccessfulRename,
}: RenameAlarmlistFormProps) => {
  const { data: session } = useSession();

  if (!session) return;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AlarmlistFormValues>({
    resolver: zodResolver(renameAlarmlistSchema),
    defaultValues: {
      id: alarmlist.id,
      name: alarmlist.name,
    },
  });

  const watchName = watch("name");

  const ctx = api.useUtils();

  const {
    mutate: updateAlarmlist,
    isLoading,
    isError,
  } = api.alarmlist.update.useMutation({
    onMutate: async (newAlarmlist: AlarmlistFormValues) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarmlist.getAll.cancel();

      // Snapshot the previous value
      const previousAlarmlists = ctx.alarmlist.getAll.getData();

      // Optimistically update to the new value
      ctx.alarmlist.getAll.setData(
        undefined,
        (oldAlarmlists: Alarmlist[] | undefined) => {
          if (!oldAlarmlists) return [];

          oldAlarmlists.forEach((prevAlarmlist) => {
            if (prevAlarmlist.id === newAlarmlist.id) {
              prevAlarmlist = {
                ...prevAlarmlist,
                name: newAlarmlist.name,
              };
            }
          });

          return oldAlarmlists;
        },
      );

      // Clear input
      reset();

      // Return a context object with the snapshotted value
      return previousAlarmlists;
    },
    onSuccess: () => {
      void ctx.alarmlist.getAllWithAlarms.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRenameAlarmlist: SubmitHandler<AlarmlistFormValues> = (data) => {
    updateAlarmlist(data);

    if (!isError && !errors.name) {
      reset();
      handleSuccessfulRename();
    }
  };

  const handleErrors: SubmitErrorHandler<AlarmlistFormValues> = (errors) => {
    if (errors.name && errors.name.message) {
      toast.error(errors.name.message);
    }
  };

  return (
    <form
      className="flex"
      onSubmit={handleSubmit(handleRenameAlarmlist, handleErrors)}
    >
      <input
        {...register("name")}
        type="text"
        value={watchName}
        placeholder={alarmlist.name}
        className="bg-transparent outline-none"
        autoFocus
      />
    </form>
  );
};

export default RenameAlarmlistForm;
