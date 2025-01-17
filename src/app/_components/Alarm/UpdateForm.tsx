import { useMemo } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { api } from "@/trpc/react";
import { SelectItem, Select } from "@nextui-org/select";
import type {
  Alarmlist,
  AlarmlistWithAlarms,
  Meridiem,
  UpdateAlarmFormValues,
  Value,
} from "@/types";
import {
  updateAlarmSchema,
  formatRepeatDays,
  verifyNumericalInput,
  formatMinutes,
} from "@/utils";
import { weekdaysData } from "@/utils/constants";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RouterOutputs } from "@/trpc/shared";
import { Button, Input, Switch } from "../UI";
import dayjs from "dayjs";

type UpdateAlarmFormProps = {
  alarm: RouterOutputs["alarm"]["getAll"][number];
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const UpdateAlarmForm = ({ alarm, setIsModalOpen }: UpdateAlarmFormProps) => {
  const { data: session } = useSession({ required: true });

  if (!session) return;

  const { data: preferences } = api.preference.get.useQuery();
  if (!preferences) return;

  const selectClassNames = {
    label:
      "text-xs text-slate-900 group-data-[filled=true]:text-xs group-data-[filled=true]:text-slate-900 dark:text-white/70 dark:group-data-[filled=true]:text-white/70",
    value: "text-xs dark:group-data-[filled=true]:text-white/70",
    contentWrapper: "p-0",
    popoverContent:
      "border bg-white rounded-small dark:bg-zinc-900 dark:border-zinc-600",
    trigger:
      "transition border-b h-10 border-b-gray-400 after:h-[0px] data-[open=true]:border-b-slate-900 data-[open=false]:border-b-gray-400 dark:border-b-zinc-600 dark:data-[open=false]:border-b-zinc-600 dark:data-[open=true]:border-b-white/70",
  };

  const { hour, minutes, meridiem } = useMemo(() => {
    let hour;
    if (!preferences.use12Hour) {
      hour = dayjs().set("hour", alarm.hour).format("HH");
    } else hour = dayjs().set("hour", alarm.hour).format("h");

    const minutes = formatMinutes(alarm.minutes);
    const meridiem = alarm.hour >= 12 ? "PM" : "AM";

    return { hour, minutes, meridiem };
  }, [preferences.use12Hour, alarm.hour, alarm.minutes]);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateAlarmFormValues>({
    resolver: zodResolver(updateAlarmSchema),
    defaultValues: {
      id: alarm.id,
      name: alarm.name,
      hour,
      minutes,
      meridiem: meridiem as Meridiem,
      snooze: alarm.snooze,
      alarmlistId: alarm.alarmlistId,
      repeat: alarm.repeat ?? undefined,
      userId: session.user.id,
    },
    criteriaMode: "all",
  });

  const ctx = api.useUtils();

  const { mutateAsync: updateAlarm, isLoading } = api.alarm.update.useMutation({
    onMutate: async (currentAlarm) => {
      const { id, name, hour, minutes, meridiem, snooze, alarmlistId, repeat } =
        currentAlarm;
      await ctx.alarmlist.getAllWithAlarms.cancel();

      const previousAlarmlists = ctx.alarmlist.getAllWithAlarms.getData();

      ctx.alarmlist.getAllWithAlarms.setData(
        undefined,
        (oldAlarmlists: AlarmlistWithAlarms[] | undefined) => {
          if (!oldAlarmlists) return [];

          //   Iterate through alarmlists and find the alarm that needs to be updated.
          // Once found, update alarm with changed values
          // Turn on alarm and alarmlist once updated.
          return oldAlarmlists.map((prevAlarmlist) => {
            if (prevAlarmlist.id === alarmlistId) {
              prevAlarmlist.alarms.map((prevAlarm) => {
                if (prevAlarm.id === id) {
                  return {
                    ...prevAlarm,
                    name,
                    hour,
                    minutes,
                    meridiem,
                    snooze,
                    repeat: repeat?.split(","),
                    alarmlistId,
                    isOn: true,
                  };
                }
                return prevAlarm;
              });

              //   Updated alarm should also turn on the alarmlist it's under.
              return {
                ...prevAlarmlist,
                isOn: true,
              };
            }

            // If alarm has been moved to a new alarmlist, check to see if alarms under old alarmlists are still on.
            // If not, old alarmlist should be turned off.
            if (alarm.alarmlistId === prevAlarmlist.id) {
              const activeAlarms = prevAlarmlist.alarms.filter(
                (prevAlarm) => prevAlarm.isOn && prevAlarm.id !== alarm.id,
              );

              return {
                ...prevAlarmlist,
                isOn: activeAlarms.length > 0,
              };
            }

            return prevAlarmlist;
          });
        },
      );

      return { previousAlarmlists };
    },
    onSuccess: (_data, { name }) => {
      toast.success(`'${name || "Alarm"}' has been updated!`); // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing

      /*
        When creating a new alarm, the alarm is turned on.
        When turning it off immediately after creation, the newly created alarm cannot be toggled
        even after running void ctx.alarm.getAllByAlarmlistId.invalidate({ alarmlistId }).
        This is because the alarm id is still "optimistic-alarm-id" and not the cuid generated in the backend.
        Thus, we must invalidate all alarmlists in order to interact with the real alarm id.
      */
      void ctx.user.get.invalidate();
      // void ctx.alarmlist.getAllWithAlarms.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "BAD_REQUEST") {
        setError("hour", {
          type: "server",
          message: error.message,
        });
      } else if (error.message) {
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

  const handleUpdateAlarm: SubmitHandler<UpdateAlarmFormValues> = async (
    data,
  ) => {
    const updatedAlarm = await updateAlarm(data);

    if (updatedAlarm) {
      reset();
      setIsModalOpen(false);
    }
  };

  const handleSelectedKeys = useMemo((): string[] | undefined => {
    const repeatDays = alarm.repeat?.split(",");

    if (!repeatDays || (repeatDays && !repeatDays[0])) return undefined;

    return repeatDays.map((value) => {
      return weekdaysData[value as Value]!.abbr;
    });
  }, [alarm.repeat]);

  return (
    <form
      onSubmit={handleSubmit(handleUpdateAlarm)}
      className="mx-auto my-4 flex h-full w-96 flex-col justify-center gap-4 dark:bg-zinc-900"
    >
      {errors.userId && (
        <p className="h-3.5 whitespace-break-spaces text-center text-2xs text-red-600">
          {errors.userId?.message}
        </p>
      )}
      <div className="flex w-full flex-col items-center justify-center md:mb-0">
        <div className="flex flex-row gap-6">
          {/* ------------------------- HOUR ------------------------- */}
          <input
            {...register("hour", {
              setValueAs: (hourInput) => Number(hourInput),
            })}
            id="hour"
            type="text"
            maxLength={2}
            autoComplete="off"
            className="w-24 text-center text-7xl caret-transparent outline-none transition selection:bg-transparent hover:bg-gray-100 focus:bg-gray-200 dark:bg-zinc-900 dark:text-white/70 dark:hover:bg-zinc-700 dark:focus:bg-zinc-700/70"
            onKeyDown={(
              e: React.KeyboardEvent<HTMLInputElement> & { type: "keydown" },
            ) => verifyNumericalInput(e, "hour", preferences.use12Hour)}
            onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
              !/^\d+$/.test(e.clipboardData.getData("text")) &&
              e.preventDefault()
            }
          />
          {/* ------------------------- MINUTES ------------------------- */}
          <input
            {...register("minutes", {
              setValueAs: (minutesInput) => Number(minutesInput),
            })}
            id="minutes"
            type="text"
            maxLength={2}
            autoComplete="off"
            className="w-24 text-center text-7xl caret-transparent outline-none transition selection:bg-transparent hover:bg-gray-100 focus:bg-gray-200 dark:bg-zinc-900 dark:text-white/70 dark:hover:bg-zinc-700 dark:focus:bg-zinc-700/70"
            onKeyDown={(
              e: React.KeyboardEvent<HTMLInputElement> & { type: "keydown" },
            ) => verifyNumericalInput(e, "minutes", preferences.use12Hour)}
            onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
              !/^\d+$/.test(e.clipboardData.getData("text")) &&
              e.preventDefault()
            }
          />
          {/* ------------------------- MERIDIEM ------------------------- */}
          {preferences.use12Hour && (
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
                    defaultSelectedKeys={[alarm.hour >= 12 ? "PM" : "AM"]}
                    disableAnimation={false}
                    onChange={onChange}
                    selectorIcon={<></>}
                    disableSelectorIconRotation
                    classNames={{
                      base: "w-14 mb-1",
                      label:
                        "text-xs text-slate-900 group-data-[filled=true]:text-xs group-data-[filled=true]:text-slate-900",
                      value:
                        "text-xs dark:group-data-[filled=true]:text-white/70",
                      popoverContent:
                        "border absolute p-0 -top-2.5 w-20 bg-white rounded-small dark:bg-zinc-900 dark:border-zinc-600",
                      trigger:
                        "transition shadow-none border-b-0 after:h-[0px] data-[open=true]:border-b-0 data-[open=false]:border-b-0",
                    }}
                  >
                    {["AM", "PM"].map((timeOfDay) => (
                      <SelectItem
                        key={timeOfDay}
                        textValue={timeOfDay}
                        value={value}
                        className="rounded-md transition hover:bg-gray-200 dark:hover:bg-zinc-700"
                      >
                        {timeOfDay}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
          )}
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
              defaultSelectedKeys={[alarm.alarmlistId]}
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
                    className="rounded-small transition hover:bg-gray-200 dark:hover:bg-zinc-700"
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
            defaultSelectedKeys={handleSelectedKeys}
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
            {Object.entries(weekdaysData).map(([_, { value, abbr, long }]) => (
              <SelectItem
                key={abbr}
                textValue={abbr}
                value={value}
                className="rounded-small transition hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                {long}
              </SelectItem>
            ))}
          </Select>
        )}
      />
      {/* ------------------------- SNOOZE ------------------------- */}
      <div className="flex items-center justify-between py-4">
        <span className="pl-1 text-xs dark:text-white/70">Snooze</span>
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
        Update
      </Button>
    </form>
  );
};

export default UpdateAlarmForm;
