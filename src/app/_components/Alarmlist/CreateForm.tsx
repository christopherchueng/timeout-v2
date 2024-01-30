import { useForm, type SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Alarmlist, CreateAlarmlistFormValues } from "@/types";
import { createAlarmlistSchema } from "@/utils";
import { Button, Input } from "../UI";

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
  } = useForm<CreateAlarmlistFormValues>({
    resolver: zodResolver(createAlarmlistSchema),
  });

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
            order: 1,
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
      void ctx.user.get.invalidate();
      // void ctx.alarmlist.getAllWithAlarms.invalidate();
    },
    onError: (error) => {
      const nameError = error.data?.zodError?.fieldErrors.name;

      nameError &&
        setError("name", {
          type: "server",
          message: nameError[0],
        });
    },
  });

  const handleCreateAlarmlist: SubmitHandler<
    CreateAlarmlistFormValues
  > = async (data) => {
    createAlarmlist(data);

    if (!isError && !errors.name) {
      reset();
      setIsModalOpen(false);
    }
  };

  return (
    <form
      className="mx-4 my-6 flex flex-col justify-center gap-4"
      onSubmit={handleSubmit(handleCreateAlarmlist)}
    >
      <div className="w-48">
        <Input
          {...register("name")}
          label="name"
          type="text"
          value={watchName}
          title="Enter Alarmlist name"
          autoFocus
        />
        {errors && (
          <p className="h-3.5 whitespace-break-spaces pt-2 text-2xs text-red-600">
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
