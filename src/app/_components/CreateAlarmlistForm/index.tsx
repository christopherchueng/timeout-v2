import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button, Input } from "../UI";
import { zodResolver } from "@hookform/resolvers/zod";
import { alarmlistSchema } from "@/utils";
import { api } from "@/trpc/react";
import type { z } from "zod";

export type AlarmlistFormValues = z.infer<typeof alarmlistSchema>;

type CreateAlarmlistFormProps = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreateAlarmlistForm = ({ setIsModalOpen }: CreateAlarmlistFormProps) => {
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
    onSuccess: () => {
      void ctx.alarmlist.getAll.invalidate();
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
