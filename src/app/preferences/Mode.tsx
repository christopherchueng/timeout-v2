"use client";

import type { Session } from "next-auth";
import toast from "react-hot-toast";
import { api } from "@/trpc/react";
import { Switch } from "../_components/UI";

type ModeProps = {
  session: Session;
};

const Mode = ({ session }: ModeProps) => {
  const { data: preferences, isLoading: switchLoading } =
    api.preference.get.useQuery();
  const ctx = api.useUtils();

  const { mutate: toggle12HourSettings } = api.preference.toggle.useMutation({
    onSuccess: () => {
      toast.success("Changes saved.");
      void ctx.preference.get.invalidate();
    },
    onError: () => {
      toast.error("Could not switch time formats. Please try again.");
    },
  });

  if (switchLoading) return <div className="h-5 w-8 rounded-xl bg-gray-200" />;

  if (!preferences) return;

  return (
    <Switch
      id="12-hour"
      checked={preferences.use12Hour}
      onChange={(e) => {
        toggle12HourSettings({
          userId: session.user.id,
          isOn: e.target.checked,
        });
      }}
    />
  );
};

export default Mode;
