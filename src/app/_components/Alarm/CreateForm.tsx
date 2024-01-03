import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import dayjs from "dayjs";
import { api } from "@/trpc/react";
import { SelectItem, Select } from "@nextui-org/select";
import type { Alarmlist, AlarmFormValues, AlarmlistWithAlarms } from "@/types";
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
      "transition border-b border-b-gray-400 after:h-[0px] data-[open=true]:border-b-slate-900 data-[open=false]:border-b-gray-400",
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
  } = useForm<AlarmFormValues>({
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

  const handleCreateAlarm: SubmitHandler<AlarmFormValues> = async (data) => {
    createAlarm(data);

    if (!isError && !errors.alarmlistId) {
      reset();
      setIsModalOpen(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleCreateAlarm)}
      className="mx-auto my-10 flex h-full w-96 flex-col justify-center gap-4"
    >
      <div className="flex w-full flex-row items-center justify-center gap-2 md:mb-0">
        {/* ------------------------- HOUR ------------------------- */}
        <label htmlFor="hour" className="">
          <input
            {...register("hour")}
            id="hour"
            value={hour}
            type="number"
            min={1}
            max={12}
            className="flex w-fit pr-2 text-end text-7xl outline-none"
          />
        </label>
        <span className="h-full text-7xl">:</span>
        {/* ------------------------- MINUTES ------------------------- */}
        <label htmlFor="minutes" className="">
          <input
            {...register("minutes")}
            id="minutes"
            type="number"
            value={minute}
            min={0}
            max={59}
            className="flex text-center text-7xl outline-none"
          />
        </label>
        {/* ------------------------- MERIDIEM ------------------------- */}
        <div className="flex h-full flex-row items-end">
          <label htmlFor="meridiem" className="">
            <input
              {...register("meridiem")}
              id="meridiem"
              type="text"
              value={meridiem}
              className="mb-3.5 w-10 outline-none"
            />
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
        {errors && (
          <p className="h-3.5 whitespace-break-spaces pt-2 text-2xs text-red-600">
            {errors.alarmlistId?.message}
          </p>
        )}
      </div>
      {/* ------------------------- REPEAT ------------------------- */}
      <div>
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
      </div>
      {/* ------------------------- SNOOZE ------------------------- */}
      <div className="flex items-center justify-between py-4">
        <span className="text-sm">Snooze</span>
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
