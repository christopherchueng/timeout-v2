import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import dayjs from "dayjs";
import { api } from "@/trpc/react";
import { SelectItem, Select } from "@nextui-org/select";
import type {
  Alarmlist,
  CreateAlarmFormValues,
  AlarmlistWithAlarms,
} from "@/types";
import { createAlarmSchema, repeatDays } from "@/utils";
import { DAYS } from "@/utils/constants";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Switch } from "../UI";
import { useMemo } from "react";

type CreateAlarmFormProps = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreateAlarmForm = ({ setIsModalOpen }: CreateAlarmFormProps) => {
  const { data: session } = useSession();

  if (!session) return;

  const selectClassNames = {
    label:
      "text-xs text-slate-900 group-data-[filled=true]:text-xs group-data-[filled=true]:text-slate-900",
    value: "text-xs",
    popoverContent: "border bg-white rounded-small",
    trigger:
      "transition border-b h-10 border-b-gray-400 after:h-[0px] data-[open=true]:border-b-slate-900 data-[open=false]:border-b-gray-400",
  };

  const { hour, minute, meridiem } = useMemo(() => {
    const todaysDate = new Date();

    const hour = dayjs(todaysDate).format("h");
    const minute = dayjs(todaysDate).format("mm");
    const meridiem = dayjs(todaysDate).format("A");

    return { hour, minute, meridiem };
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAlarmFormValues>({
    resolver: zodResolver(createAlarmSchema),
    defaultValues: {
      name: "",
      snooze: true,
      repeat: "",
      userId: session.user.id,
    },
  });

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
      await ctx.alarmlist.getAllWithAlarms.cancel();

      const previousAlarmlists = ctx.alarmlist.getAllWithAlarms.getData();

      ctx.alarmlist.getAllWithAlarms.setData(
        undefined,
        (oldAlarmlists: AlarmlistWithAlarms[] | undefined) => {
          if (!oldAlarmlists) return [];

          const updatedHour = typeof hour === "string" ? Number(hour) : hour;
          const updatedMinutes =
            typeof minutes === "string" ? Number(minutes) : minutes;

          const alarmlistsWithNewAlarm = oldAlarmlists.map((prevAlarmlist) => {
            if (prevAlarmlist.id === alarmlistId) {
              const optimisticAlarm = {
                id: "optimistic-alarm-id",
                name: name ?? "Alarm",
                hour: updatedHour,
                minutes: updatedMinutes,
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

              return {
                ...prevAlarmlist,
                alarms: [...prevAlarmlist.alarms, optimisticAlarm],
              };
            }

            return prevAlarmlist;
          });

          return alarmlistsWithNewAlarm;
        },
      );

      return { previousAlarmlists };
    },
    onSuccess: (_data, { alarmlistId }) => {
      void ctx.alarm.getAllByAlarmlistId.invalidate({ alarmlistId });
    },
    onError: (error) => {
      setError("alarmlistId", { type: "server", message: error.message });
      return;
    },
  });

  const { data: alarmlists } = api.alarmlist.getAll.useQuery();

  const watchName = watch("name");

  const handleCreateAlarm: SubmitHandler<CreateAlarmFormValues> = async (
    data,
  ) => {
    createAlarm(data);

    if (!isError && !errors.alarmlistId) {
      reset();
      setIsModalOpen(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleCreateAlarm)}
      className="mx-auto my-4 flex h-full w-96 flex-col justify-center gap-4"
    >
      <div className="flex w-full flex-row items-center justify-center gap-2 md:mb-0">
        <div className="flex gap-4">
          {/* ------------------------- HOUR ------------------------- */}
          <label htmlFor="hour">
            <input
              {...register("hour")}
              id="hour"
              defaultValue={hour}
              type="text"
              min={1}
              max={12}
              maxLength={2}
              className="w-24 text-right text-7xl outline-none"
            />
          </label>
          <span className="h-full text-7xl">:</span>
          {/* ------------------------- MINUTES ------------------------- */}
          <label htmlFor="minutes">
            <input
              {...register("minutes")}
              id="minutes"
              type="text"
              defaultValue={minute}
              min={0}
              max={59}
              maxLength={2}
              className="w-24 text-7xl outline-none"
            />
          </label>
        </div>
        {/* ------------------------- MERIDIEM ------------------------- */}
        <div className="flex h-full flex-row items-end">
          <Select
            {...register("meridiem")}
            id="meridiem"
            variant="underlined"
            size="sm"
            radius="none"
            defaultSelectedKeys={[meridiem]}
            disableAnimation={false}
            classNames={{
              base: "w-14 mb-1",
              label:
                "text-xs text-slate-900 group-data-[filled=true]:text-xs group-data-[filled=true]:text-slate-900",
              value: "text-xs",
              popoverContent:
                "border absolute -top-2.5 w-20 bg-white rounded-small",
              trigger:
                "transition shadow-none border-b-0 after:h-[0px] data-[open=true]:border-b-0 data-[open=false]:border-b-0",
            }}
            selectorIcon={<></>}
            disableSelectorIconRotation
          >
            {["AM", "PM"].map((timeOfDay) => (
              <SelectItem
                key={timeOfDay}
                textValue={timeOfDay}
                value={meridiem}
              >
                {timeOfDay}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      {/* ------------------------- NAME ------------------------- */}
      <Input
        {...register("name")}
        label="name"
        type="text"
        value={watchName ?? "Alarm"}
        placeholder="Alarm"
        title="Name"
        autoComplete="off"
      />
      {/* ------------------------- ALARMLIST ------------------------- */}
      <div>
        <Select
          {...register("alarmlistId")}
          id="alarmlist"
          label="Alarmlist"
          variant="underlined"
          size="sm"
          radius="none"
          disableAnimation={false}
          isDisabled={!alarmlists}
          classNames={selectClassNames}
          selectorIcon={<></>}
          disableSelectorIconRotation
        >
          {alarmlists ? (
            alarmlists.map((alarmlist: Alarmlist) => (
              <SelectItem
                key={alarmlist.id}
                textValue={alarmlist.name}
                value={alarmlist.name}
                className="rounded-small transition hover:bg-gray-200"
              >
                {alarmlist.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no alarmlists" className="fit text-xs italic">
              No alarmlists.
            </SelectItem>
          )}
        </Select>
        {errors.alarmlistId && (
          <p className="h-3.5 whitespace-break-spaces pt-2 text-2xs text-red-600">
            {errors.alarmlistId?.message}
          </p>
        )}
      </div>
      {/* ------------------------- REPEAT ------------------------- */}
      <Controller
        name="repeat"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Select
            selectionMode="multiple"
            id="repeat"
            label="Repeat"
            radius="none"
            size="sm"
            variant="underlined"
            classNames={selectClassNames}
            renderValue={(days) => repeatDays(days)}
            onChange={onChange}
            selectorIcon={<></>}
            disableSelectorIconRotation
          >
            {DAYS.map((DAY) => (
              <SelectItem
                key={DAY}
                textValue={DAY}
                value={value}
                className="rounded-small transition hover:bg-gray-200"
              >
                {DAY}
              </SelectItem>
            ))}
          </Select>
        )}
      />
      {/* ------------------------- SNOOZE ------------------------- */}
      <div className="flex items-center justify-between py-4">
        <span className="pl-1 text-xs">Snooze</span>
        <Controller
          name="snooze"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Switch id="snooze-alarm" checked={value} onChange={onChange} />
          )}
        />
      </div>
      <Button type="submit" disabled={!!errors.name || isLoading}>
        Create
      </Button>
    </form>
  );
};

export default CreateAlarmForm;
