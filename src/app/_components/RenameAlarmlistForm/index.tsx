import React from "react";
import type { AlarmlistWithAlarms } from "@/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { z } from "zod";
import { renameAlarmlistSchema } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useSession } from "next-auth/react";
import { Input } from "../UI";

export type AlarmlistFormValues = z.infer<typeof renameAlarmlistSchema>;
type Alarmlist = RouterOutputs["alarmlist"]["getAll"][number];

const RenameAlarmlistForm = ({ alarmlist }: AlarmlistWithAlarms) => {
  const { data: session } = useSession();

  if (!session) return;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<AlarmlistFormValues>({
    resolver: zodResolver(renameAlarmlistSchema),
  });

  const watchName = watch("name", alarmlist.name);

  const ctx = api.useUtils();

  const {
    mutate: updateAlarmlist,
    isLoading,
    isError,
  } = api.alarmlist.update.useMutation({
    onMutate: async (newAlarmlist) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await ctx.alarmlist.getAll.cancel();

      // Snapshot the previous value
      const previousAlarmlists = ctx.alarmlist.getAll.getData();

      // Optimistically update to the new value
      ctx.alarmlist.getAll.setData(
        undefined,
        (oldAlarmlists: Alarmlist[] | undefined) => {
          const optimisticAlarmlist = {
            id: newAlarmlist.id,
            name: newAlarmlist.name,
            isOn: alarmlist.isOn,
            userId: session?.user.id,
            createdAt: alarmlist.createdAt,
            updatedAt: new Date(),
          };

          if (!oldAlarmlists) return [optimisticAlarmlist];

          return [...oldAlarmlists, optimisticAlarmlist];
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
      setError("name", { type: "server", message: error.message });
    },
  });

  const handleRenameAlarmlist: SubmitHandler<AlarmlistFormValues> = async (
    data,
  ) => {
    updateAlarmlist(data);

    if (!isError && !errors.name) {
      reset();
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleRenameAlarmlist)}
    >
      <div className="w-min">
        <Input
          {...register("name")}
          label="name"
          type="text"
          value={watchName}
          placeholder="Enter Alarmlist name"
          autoFocus
        />
        {errors && (
          <p className="whitespace-break-spaces pt-2 text-2xs text-red-600">
            {errors.name?.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default RenameAlarmlistForm;
