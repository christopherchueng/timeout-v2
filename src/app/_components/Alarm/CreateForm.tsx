import { useForm, type SubmitHandler } from "react-hook-form";
import { RouterOutputs } from "@/trpc/shared";
import { api } from "@/trpc/react";
import { SelectItem, Select } from "@nextui-org/select";
import { createAlarmSchema, repeatDays } from "@/utils";
import { useSession } from "next-auth/react";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTimeContext } from "@/context/Time";
import { Button, Input, Switch } from "../UI";
import { DAYS } from "@/utils/constants";
import dayjs from "dayjs";

type AlarmFormValues = z.infer<typeof createAlarmSchema>;
type Alarm = RouterOutputs["alarm"]["getAllByAlarmlistId"][number];
type Alarmlist = RouterOutputs["alarmlist"]["getAll"][number];

type CreateAlarmFormProps = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreateAlarmForm = ({ setIsModalOpen }: CreateAlarmFormProps) => {
  const { data: session } = useSession();

  if (!session) return;

  const todaysDate = new Date();

  const hour = dayjs(todaysDate).format("h");
  const minute = dayjs(todaysDate).format("mm");
  const meridiem = dayjs(todaysDate).format("A");

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
      <div className="flex w-full flex-row items-center justify-center gap-2 md:mb-0">
        {/* ------------------------- HOUR ------------------------- */}
        <label htmlFor="hour" className="">
          {/* <Select
            id="hour"
            label="hour"
            className="w-full"
            radius="none"
            placeholder={hour.toString()}
            variant="underlined"
            size="sm"
            isRequired
            classNames={{ listboxWrapper: ["bg-white"] }}
          > */}
          <input
            id="hour"
            value={hour}
            type="number"
            min={1}
            max={12}
            className="flex w-fit pr-2 text-end text-7xl outline-none"
          />
          {/* {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
              <option className="w-fit text-center" key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </input> */}
          {/* </Select> */}
        </label>
        <span className="h-full text-7xl">:</span>
        {/* ------------------------- MINUTES ------------------------- */}
        <label htmlFor="minute" className="">
          <input
            id="minute"
            type="number"
            value={minute}
            min={0}
            max={59}
            className="flex text-center text-7xl outline-none"
          />
          {/* <Select
            id="minute"
            label="minute"
            className="w-full"
            radius="none"
            placeholder={minute.toString()}
            variant="underlined"
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
          </Select> */}
        </label>
        {/* ------------------------- MERIDIEM ------------------------- */}
        <div className="flex h-full flex-row items-end">
          <label htmlFor="meridiem" className="">
            <input
              id="meridiem"
              type="text"
              value={meridiem}
              className="mb-3 w-10"
            />
            {/* <Select
            id="meridiem"
            label="meridiem"
            className="w-full"
            radius="none"
            placeholder={meridiem.toString()}
            variant="underlined"
            size="sm"
            isRequired
            classNames={{ listboxWrapper: ["bg-white"] }}
          >
            {["AM", "PM"].map((value) => (
              <SelectItem key={value} textValue={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </Select> */}
          </label>
        </div>
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
          classNames={{
            listboxWrapper: ["bg-white", "rounded-small"],
            // listbox: ["bg-red-400", "hover:bg-yellow-400"],
            popoverContent: "border-1.5 border-slate-900 p-0 rounded-small",
          }}
          id="alarmlist"
          label="Alarmlist"
          variant="underlined"
          size="sm"
          radius="none"
          disableAnimation={false}
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
          size="sm"
          variant="underlined"
          classNames={{ listboxWrapper: ["bg-white"] }}
          renderValue={(days) => repeatDays(days)}
        >
          {DAYS.map((DAY, index) => (
            <SelectItem key={DAY} textValue={DAY} value={index + 1}>
              {DAY}
            </SelectItem>
          ))}
        </Select>
      </div>
      {/* ------------------------- SNOOZE ------------------------- */}
      <div className="flex items-center justify-between py-4">
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
