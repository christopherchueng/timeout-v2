import { useForm, type SubmitHandler } from "react-hook-form";
import { RouterOutputs } from "@/trpc/shared";
import { api } from "@/trpc/react";
import { Select, SelectItem } from "@nextui-org/select";
import { createAlarmSchema, repeatDays } from "@/utils";
import { useSession } from "next-auth/react";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTimeContext } from "@/context/Time";
import { Button, Input, Switch } from "../UI";
import { DAYS } from "@/utils/constants";

type AlarmFormValues = z.infer<typeof createAlarmSchema>;
type Alarm = RouterOutputs["alarm"]["getAllByAlarmlistId"][number];
type Alarmlist = RouterOutputs["alarmlist"]["getAll"][number];

type CreateAlarmFormProps = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreateAlarmForm = ({ setIsModalOpen }: CreateAlarmFormProps) => {
  const { data: session } = useSession();

  if (!session) return;

  const {
    parts: { hour, minute, meridiem },
  } = useTimeContext();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<AlarmFormValues>({
    resolver: zodResolver(createAlarmSchema),
  });

  const watchName = watch("name");

  const ctx = api.useUtils();

  const {
    mutate: createAlarm,
    isLoading,
    isError,
  } = api.alarm.create.useMutation({
    onMutate: async (newAlarm) => {
      const {
        name,
        hour,
        minutes,
        meridiem,
        snooze,
        alarmlistId,
        sound,
        repeat,
      } = newAlarm;
      await ctx.alarm.getAll.cancel();

      const previousAlarms = ctx.alarm.getAll.getData();

      ctx.alarm.getAll.setData(undefined, (oldAlarms: Alarm[] | undefined) => {
        const optimisticAlarm = {
          id: "optimistic-alarm-id",
          name: name ?? "Alarm",
          hour,
          minutes,
          meridiem,
          snooze,
          alarmlistId,
          sound: sound ?? null,
          repeat: repeat ?? null,
          isOn: true,
          userId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (!oldAlarms) return [optimisticAlarm];

        return [...oldAlarms, optimisticAlarm];
      });
      reset();

      return previousAlarms;
    },
    onSuccess: () => {
      void ctx.alarm.getAll.invalidate();
    },
    onError: (error) => {
      console.log("errors", error.message);
      return;
    },
  });

  const { data: alarmlists } = api.alarmlist.getAll.useQuery();

  if (!alarmlists) return;

  return (
    <form className="mx-auto my-10 flex h-full w-96 flex-col justify-center gap-4">
      <div className="mb-6 flex w-full flex-row gap-4 md:mb-0 md:flex-nowrap">
        {/* ------------------------- HOUR ------------------------- */}
        <label htmlFor="hour" className="w-full">
          <Select
            id="hour"
            label="hour"
            className="w-full"
            radius="none"
            placeholder={hour.toString()}
            variant="underlined"
            size="sm"
            isRequired
            classNames={{ listboxWrapper: ["bg-white"] }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
              <SelectItem
                textValue={`${hour}`}
                className="w-fit"
                key={hour}
                value={hour}
              >
                {hour}
              </SelectItem>
            ))}
          </Select>
        </label>
        {/* ------------------------- MINUTES ------------------------- */}
        <label htmlFor="minute" className="w-full">
          <Select
            id="minute"
            label="minute"
            className="w-full"
            radius="none"
            placeholder={minute.toString()}
            size="sm"
            isRequired
            classNames={{ listboxWrapper: ["bg-white"] }}
          >
            {Array.from({ length: 59 }, (_, i) => i + 1).map((minute) => (
              <SelectItem
                className="w-full"
                textValue={`${minute}`}
                key={minute}
                value={minute}
              >
                {minute >= 10 ? minute : `0${minute}`}
              </SelectItem>
            ))}
          </Select>
        </label>
        {/* ------------------------- MERIDIEM ------------------------- */}
        <label htmlFor="meridiem" className="w-full">
          <Select
            id="meridiem"
            label="meridiem"
            className="w-full"
            radius="none"
            placeholder={meridiem.toString()}
            size="sm"
            isRequired
            classNames={{ listboxWrapper: ["bg-white"] }}
          >
            {["AM", "PM"].map((value) => (
              <SelectItem key={value} textValue={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </Select>
        </label>
      </div>
      {/* ------------------------- NAME ------------------------- */}
      <div>
        <Input
          {...register("name")}
          label="name"
          type="text"
          value={watchName ?? "Alarm"}
          placeholder="Alarm"
          title="Name"
          autoComplete="off"
        />
        {errors && (
          <p className="whitespace-break-spaces pt-2 text-2xs text-red-600">
            {errors.name?.message}
          </p>
        )}
      </div>
      {/* ------------------------- ALARMLIST ------------------------- */}
      <div>
        <Select
          classNames={{ listboxWrapper: ["bg-white"] }}
          id="alarmlist"
          label="Alarmlist"
          radius="none"
        >
          {alarmlists.map((alarmlist: Alarmlist) => (
            <SelectItem
              key={alarmlist.id}
              textValue={alarmlist.name}
              value={alarmlist.name}
            >
              {alarmlist.name}
            </SelectItem>
          ))}
        </Select>
      </div>
      {/* ------------------------- REPEAT ------------------------- */}
      <div>
        <Select
          selectionMode="multiple"
          id="repeat"
          label="Repeat"
          radius="none"
          classNames={{ listboxWrapper: ["bg-white"] }}
          renderValue={(days) => {
            return repeatDays(days);
          }}
        >
          {DAYS.map((DAY, index) => (
            <SelectItem key={DAY} textValue={DAY} value={index + 1}>
              {DAY}
            </SelectItem>
          ))}
        </Select>
      </div>
      {/* ------------------------- SNOOZE ------------------------- */}
      <div className="flex items-center justify-between">
        <span className="text-sm">Snooze</span>
        <Switch id="snooze-alarm" checked={true} onChange={() => {}} />
      </div>
      <Button type="submit" disabled={!!errors.name || isLoading}>
        Create
      </Button>
    </form>
  );
};

export default CreateAlarmForm;
