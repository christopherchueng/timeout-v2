import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { api } from "@/trpc/react";
import { SelectItem, Select } from "@nextui-org/select";
import type {
  Alarmlist,
  UpdateAlarmFormValues,
  AlarmlistWithAlarms,
} from "@/types";
import { updateAlarmSchema, repeatDays, Meridiem } from "@/utils";
import { DAYS } from "@/utils/constants";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Switch } from "../UI";
import toast from "react-hot-toast";
import { RouterOutputs } from "@/trpc/shared";

type UpdateAlarmFormProps = {
  alarm: RouterOutputs["alarm"]["getAll"][number];
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const UpdateAlarmForm = ({ alarm, setIsModalOpen }: UpdateAlarmFormProps) => {
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

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateAlarmFormValues>({
    resolver: zodResolver(updateAlarmSchema),
    defaultValues: {
      id: alarm.id,
      name: alarm.name,
      hour: alarm.hour,
      minutes: alarm.minutes >= 10 ? alarm.minutes : `0${alarm.minutes}`,
      meridiem: alarm.meridiem as Meridiem,
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
      const {
        id,
        name,
        hour,
        minutes,
        meridiem,
        snooze,
        alarmlistId,
        sound,
        repeat,
      } = currentAlarm;
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
                    repeat,
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

  const handleUpdateAlarm: SubmitHandler<UpdateAlarmFormValues> = async (
    data,
  ) => {
    const updatedAlarm = await updateAlarm(data);

    if (updatedAlarm) {
      reset();
      setIsModalOpen(false);
    }
  };

  const handleInputCharCount = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "hour" | "minutes",
  ) => {
    const val = e.target.value;
    if (val.length <= 2) return;

    setValue(field, val.slice(0, 2));
  };

  return (
    <form
      onSubmit={handleSubmit(handleUpdateAlarm)}
      className="mx-auto my-4 flex h-full w-96 flex-col justify-center gap-4"
    >
      {errors.userId && (
        <p className="h-3.5 whitespace-break-spaces text-center text-2xs text-red-600">
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
              type="number"
              defaultValue={alarm.hour}
              maxLength={2}
              className="w-24 text-right text-7xl outline-none"
              onChange={(e) => handleInputCharCount(e, "hour")}
            />
          </label>
          <span className="h-full text-7xl">:</span>
          {/* ------------------------- MINUTES ------------------------- */}
          <label htmlFor="minutes">
            <input
              {...register("minutes", {
                setValueAs: (hourInput) => Number(hourInput),
              })}
              id="minutes"
              type="number"
              maxLength={2}
              className="w-24 text-7xl outline-none"
              onChange={(e) => handleInputCharCount(e, "minutes")}
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
                  defaultSelectedKeys={[alarm.meridiem]}
                  disableAnimation={false}
                  onChange={onChange}
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
                  selectorIcon={<></>}
                  disableSelectorIconRotation
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
        render={({ field: { value, onChange } }) => (
          <Select
            selectionMode="multiple"
            id="repeat"
            label="Repeat"
            radius="none"
            size="sm"
            variant="underlined"
            aria-labelledby="repeat"
            classNames={selectClassNames}
            renderValue={(days) => repeatDays(days)}
            defaultSelectedKeys={alarm.repeat?.split(",")}
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
