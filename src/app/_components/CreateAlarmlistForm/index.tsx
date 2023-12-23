import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import type { z } from "zod";
import { RouterOutputs } from "@/trpc/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { alarmlistSchema } from "@/utils";
import { Button, Input } from "../UI";

export type AlarmlistFormValues = z.infer<typeof alarmlistSchema>;
type Alarmlist = RouterOutputs["alarmlist"]["getAll"][number];

type CreateAlarmlistFormProps = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreateAlarmlistForm = ({ setIsModalOpen }: CreateAlarmlistFormProps) => {
  const { data: session } = useSession();

  if (!session) return;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<AlarmlistFormValues>({ resolver: zodResolver(alarmlistSchema) });

  const watchName = watch("name");

  const ctx = api.useUtils();
  const {
    mutate: createAlarmlist,
    isLoading,
    isError,
  } = api.alarmlist.create.useMutation({
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
            id: "optimistic-alarmlist-id",
            name: newAlarmlist.name,
            isOn: true,
            userId: session?.user.id,
            createdAt: new Date(),
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

  const handleCreateAlarmlist: SubmitHandler<AlarmlistFormValues> = async (
    data,
  ) => {
    createAlarmlist(data);

    if (!isError && !errors.name) {
      reset();
      setIsModalOpen(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleCreateAlarmlist)}
    >
      <div className="w-min">
        <Input
          {...register("name")}
          label="name"
          type="text"
          value={watchName}
          placeholder="Enter Alarmlist name"
        />
        {errors && (
          <p className="whitespace-break-spaces pt-2 text-2xs text-red-600">
            {errors.name?.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={!!errors.name || isLoading}>
        Create
      </Button>
    </form>
  );
};

export default CreateAlarmlistForm;
