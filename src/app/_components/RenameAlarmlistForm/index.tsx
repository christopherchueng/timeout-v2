import React from "react";
import {
  useForm,
  type SubmitHandler,
  type SubmitErrorHandler,
} from "react-hook-form";
import type { z } from "zod";
import { renameAlarmlistSchema } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type AlarmlistFormValues = z.infer<typeof renameAlarmlistSchema>;
type Alarmlist = RouterOutputs["alarmlist"]["getAll"][number];

type RenameAlarmlistFormProps = {
  alarmlist: Alarmlist;
  handleCloseRename: (name: string) => void;
};

const RenameAlarmlistForm = ({
  alarmlist,
  handleCloseRename,
}: RenameAlarmlistFormProps) => {
  const { data: session } = useSession();

  if (!session) return;

  const { register, handleSubmit, watch, reset } = useForm<AlarmlistFormValues>(
    {
      resolver: zodResolver(renameAlarmlistSchema),
      defaultValues: {
        id: alarmlist.id,
        name: alarmlist.name,
      },
      mode: "all",
    },
  );

  const watchName = watch("name");

  const ctx = api.useUtils();

  const { mutate: updateAlarmlist } = api.alarmlist.update.useMutation({
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarmlist.getAll.cancel();

      // Snapshot the previous value
      const previousAlarmlists = ctx.alarmlist.getAll.getData();

      // Optimistically update to the new value
      ctx.alarmlist.getAll.setData(
        undefined,
        (oldAlarmlists: Alarmlist[] | undefined) => {
          if (!oldAlarmlists) return [];

          const newAlarmlists = oldAlarmlists.map((prevAlarmlist) => {
            if (prevAlarmlist.id === id) {
              return {
                ...prevAlarmlist,
                name,
              };
            }

            return prevAlarmlist;
          });

          return newAlarmlists;
        },
      );

      // Return a context object with the snapshotted value
      return { previousAlarmlists };
    },
    onSuccess: (data) => {
      void ctx.alarmlist.getAllWithAlarms.invalidate();
      reset();
      handleCloseRename(data.name.trim());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRenameAlarmlist: SubmitHandler<AlarmlistFormValues> = async (
    data,
  ) => {
    if (data.name.trim() === alarmlist.name) {
      handleCloseRename(data.name.trim());
      return;
    }

    updateAlarmlist(data);
  };

  const handleErrors: SubmitErrorHandler<AlarmlistFormValues> = (errors) => {
    !!errors.name?.message && toast.error(errors.name.message);
  };

  return (
    <form
      className="flex w-full md:mr-2"
      onSubmit={handleSubmit(handleRenameAlarmlist, handleErrors)}
      onKeyDown={(e) => {
        if (e.code === "Escape") {
          handleCloseRename("");
        }
      }}
      onBlur={handleSubmit(handleRenameAlarmlist, handleErrors)}
    >
      <input
        {...register("name")}
        type="text"
        value={watchName}
        placeholder={alarmlist.name}
        className="w-full bg-transparent outline-none"
        autoFocus
      />
    </form>
  );
};

export default RenameAlarmlistForm;
