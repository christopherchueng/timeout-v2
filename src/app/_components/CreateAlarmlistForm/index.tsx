import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Input } from "../UI";
import { zodResolver } from "@hookform/resolvers/zod";
import { alarmlistSchema } from "@/utils";
import { api } from "@/trpc/react";
import { z } from "zod";

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
    formState: { errors, isSubmitting },
  } = useForm<AlarmlistFormValues>({ resolver: zodResolver(alarmlistSchema) });

  const watchName = watch("name");

  const ctx = api.useUtils();
  const { mutate: createAlarmlist } = api.alarmlist.create.useMutation({
    onSuccess: () => {
      void ctx.alarmlist.getAll.invalidate();
    },
    onError: (error, name, context) => {
      setError("name", { type: "custom", message: error.message });
    },
  });

  const handleCreateAlarmlist: SubmitHandler<AlarmlistFormValues> = async (
    data,
  ) => {
    createAlarmlist(data);
    reset();
    setIsModalOpen(false);
  };
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleCreateAlarmlist)}
    >
      <Input
        register={register}
        name="name"
        label="name"
        type="text"
        value={watchName}
        placeholder="Enter Alarmlist name"
      />
      {errors && <p>{errors.name?.message}</p>}
      <Button disabled={isSubmitting}>Create</Button>
    </form>
  );
};

export default CreateAlarmlistForm;
