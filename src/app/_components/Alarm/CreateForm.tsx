import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import dayjs from "dayjs";
import { api } from "@/trpc/react";
import { SelectItem, Select } from "@nextui-org/select";
import type {
  Alarmlist,
  CreateAlarmFormValues,
  AlarmlistWithAlarms,
} from "@/types";
import {
  createAlarmSchema,
  parseHour,
  parseMinutes,
  verifyNumericalInput,
  formatRepeatDays,
} from "@/utils";
import { weekdaysData } from "@/utils/constants";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Switch } from "../UI";
import { useMemo } from "react";
import toast from "react-hot-toast";

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
    contentWrapper: "p-0",
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
    setValue,
    getValues,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAlarmFormValues>({
    resolver: zodResolver(createAlarmSchema),
    defaultValues: {
      name: "",
      hour: Number(hour),
      minutes: minute,
      snooze: true,
      repeat: "",
      userId: session.user.id,
    },
    criteriaMode: "all",
  });

  const ctx = api.useUtils();

  const { mutateAsync: createAlarm, isLoading } = api.alarm.create.useMutation({
    onMutate: async (newAlarm) => {
      const { name, hour, minutes, meridiem, snooze, alarmlistId, repeat } =
        newAlarm;

      await ctx.alarmlist.getAllWithAlarms.cancel();

      const previousAlarmlists = ctx.alarmlist.getAllWithAlarms.getData();

      ctx.alarmlist.getAllWithAlarms.setData(
        undefined,
        (oldAlarmlists: AlarmlistWithAlarms[] | undefined) => {
          if (!oldAlarmlists) return [];

          const alarmlistsWithNewAlarm = oldAlarmlists.map((prevAlarmlist) => {
            if (prevAlarmlist.id === alarmlistId) {
              const optimisticAlarm = {
                id: "optimistic-alarm-id",
                name: name || "Alarm", // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
                hour: parseHour(hour),
                minutes: parseMinutes(minutes),
                meridiem,
                snooze,
                alarmlistId,
                sound: process.env.NEXT_PUBLIC_SOUND_URL ?? null,
                repeat: repeat ?? null,
                isOn: true,
                snoozeEndTime: null,
                userId: session.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              return {
                ...prevAlarmlist,
                isOn: true,
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
    onSuccess: (_data, { name }) => {
      toast.success(`'${name || "Alarm"}' successfully created!`); // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing

      /*
        When creating a new alarm, the alarm is turned on.
        When turning it off immediately after creation, the newly created alarm cannot be toggled
        even after running void ctx.alarm.getAllByAlarmlistId.invalidate({ alarmlistId }).
        This is because the alarm id is still "optimistic-alarm-id" and not the cuid generated in the backend.
        Thus, we must invalidate all alarmlists in order to interact with the real alarm id.
      */
      void ctx.alarmlist.getAllWithAlarms.invalidate();
    },
    onError: (error) => {
      if (error.message) {
        setError("alarmlistId", {
          type: "server",
          message: error.message,
        });
      }

      const alarmlistIdErrorMessage =
        error?.data?.zodError?.fieldErrors?.alarmlistId;
      const hourErrorMessage = error?.data?.zodError?.fieldErrors?.hour;
      const minutesErrorMessage = error?.data?.zodError?.fieldErrors?.minutes;
      const meridiemErrorMessage = error?.data?.zodError?.fieldErrors?.meridiem;
      const snoozeErrorMessage = error?.data?.zodError?.fieldErrors?.snooze;
      const userErrorMessage = error?.data?.zodError?.fieldErrors?.userId;

      alarmlistIdErrorMessage &&
        setError("alarmlistId", {
          type: "zod",
          message: alarmlistIdErrorMessage[0],
        });

      hourErrorMessage &&
        setError("hour", { type: "zod", message: hourErrorMessage[0] });

      minutesErrorMessage &&
        setError("minutes", {
          type: "zod",
          message: minutesErrorMessage[0],
        });

      meridiemErrorMessage &&
        setError("meridiem", {
          type: "zod",
          message: meridiemErrorMessage[0],
        });

      snoozeErrorMessage &&
        setError("snooze", {
          type: "zod",
          message: snoozeErrorMessage[0],
        });

      userErrorMessage &&
        setError("userId", {
          type: "zod",
          message: userErrorMessage[0],
        });
    },
  });

  const { data: alarmlists } = api.alarmlist.getAll.useQuery();

  const watchName = watch("name");

  const handleCreateAlarm: SubmitHandler<CreateAlarmFormValues> = async (
    data,
  ) => {
    const newAlarm = await createAlarm(data);

    if (newAlarm) {
      reset();
      setIsModalOpen(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleCreateAlarm)}
      className="mx-auto my-4 flex h-full w-96 flex-col justify-center gap-4"
    >
      {errors.userId && (
        <p className="h-3.5 whitespace-break-spaces text-2xs text-red-600">
          {errors.userId?.message}
        </p>
      )}
      <div className="flex w-full flex-col items-center justify-center md:mb-0">
        <div className="flex flex-row gap-4">
          {/* ------------------------- HOUR ------------------------- */}
          <label htmlFor="hour">
            <input
              {...register("hour", {
                setValueAs: (hourInput) => Number(hourInput),
              })}
              id="hour"
              type="text"
              maxLength={2}
              autoComplete="off"
              className="w-24 text-right text-7xl outline-none"
              onKeyDown={(
                e: React.KeyboardEvent<HTMLInputElement> & { type: "keydown" },
              ) => verifyNumericalInput(e, "hour")}
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
                !/^\d+$/.test(e.clipboardData.getData("text")) &&
                e.preventDefault()
              }
            />
          </label>
          <span className="h-full select-none text-7xl">:</span>
          {/* ------------------------- MINUTES ------------------------- */}
          <label htmlFor="minutes">
            <input
              {...register("minutes", {
                setValueAs: (minutesInput) => Number(minutesInput),
              })}
              id="minutes"
              type="text"
              maxLength={2}
              autoComplete="off"
              className="w-24 text-7xl outline-none"
              onKeyDown={(
                e: React.KeyboardEvent<HTMLInputElement> & { type: "keydown" },
              ) => verifyNumericalInput(e, "minutes")}
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
                !/^\d+$/.test(e.clipboardData.getData("text")) &&
                e.preventDefault()
              }
            />
          </label>
          {/* ------------------------- MERIDIEM ------------------------- */}
          <div className="flex h-full flex-row items-end">
            <Controller
              name="meridiem"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select
                  {...register("meridiem")}
                  id="meridiem"
                  variant="underlined"
                  size="sm"
                  radius="none"
                  aria-labelledby="meridiem"
                  defaultSelectedKeys={[meridiem]}
                  disableAnimation={false}
                  onChange={onChange}
                  selectorIcon={<></>}
                  disableSelectorIconRotation
                  classNames={{
                    base: "w-14 mb-1",
                    label:
                      "text-xs text-slate-900 group-data-[filled=true]:text-xs group-data-[filled=true]:text-slate-900",
                    value: "text-xs",
                    listbox: "p-0",
                    popoverContent:
                      "border absolute p-0 -top-2.5 w-20 bg-white rounded-small",
                    trigger:
                      "transition shadow-none border-b-0 after:h-[0px] data-[open=true]:border-b-0 data-[open=false]:border-b-0",
                  }}
                >
                  {["AM", "PM"].map((timeOfDay) => (
                    <SelectItem
                      key={timeOfDay}
                      textValue={timeOfDay}
                      value={value}
                    >
                      {timeOfDay}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </div>
        {errors.hour && (
          <p className="h-3.5 whitespace-break-spaces text-2xs text-red-600">
            {errors.hour?.message}
          </p>
        )}
        {errors.minutes && (
          <p className="h-3.5 whitespace-break-spaces text-2xs text-red-600">
            {errors.minutes?.message}
          </p>
        )}
        {errors.meridiem && (
          <p className="h-3.5 whitespace-break-spaces text-2xs text-red-600">
            {errors.meridiem?.message}
          </p>
        )}
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
        <Controller
          name="alarmlistId"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              {...register("alarmlistId")}
              id="alarmlist"
              label="Alarmlist"
              variant="underlined"
              size="sm"
              radius="none"
              aria-labelledby="alarmlistId"
              disableAnimation={false}
              isDisabled={!alarmlists}
              classNames={selectClassNames}
              selectorIcon={<></>}
              disableSelectorIconRotation
              onChange={onChange}
            >
              {alarmlists ? (
                alarmlists.map((alarmlist: Alarmlist) => (
                  <SelectItem
                    key={alarmlist.id}
                    textValue={alarmlist.name}
                    value={value}
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
          )}
        />
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
        render={({ field: { onChange } }) => (
          <Select
            selectionMode="multiple"
            id="repeat"
            label="Repeat"
            radius="none"
            size="sm"
            variant="underlined"
            aria-labelledby="repeat"
            classNames={selectClassNames}
            renderValue={(days) => formatRepeatDays(days)}
            onChange={(e) => {
              const days = new Set(e.target.value.split(","));
              const numberedDays: number[] = [];

              Object.values(weekdaysData).forEach((dayObj) => {
                if (days.has(dayObj.abbr)) numberedDays.push(dayObj.value);
              });

              return onChange(numberedDays.toString());
            }}
            selectorIcon={<></>}
            disableSelectorIconRotation
          >
            {Object.entries(weekdaysData).map(([_, { abbr, value }]) => (
              <SelectItem
                key={abbr}
                textValue={abbr}
                value={value}
                className="rounded-small transition hover:bg-gray-200"
              >
                {abbr}
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
            <Switch
              id="snooze-alarm"
              checked={value}
              onChange={onChange}
              aria-labelledby="snooze-alarm"
            />
          )}
        />
        {errors.snooze && (
          <p className="h-3.5 whitespace-break-spaces pt-2 text-2xs text-red-600">
            {errors.snooze?.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={!!errors.name || isLoading}>
        Create
      </Button>
    </form>
  );
};

export default CreateAlarmForm;
