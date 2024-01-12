import type { Session } from "next-auth";
import toast from "react-hot-toast";
import { api } from "@/trpc/react";
import { Switch } from "../UI";
import { usePreferencesContext } from "@/context/Preferences";

type PreferencesProps = {
  session: Session;
};

const Preferences = ({ session }: PreferencesProps) => {
  const { preferences } = usePreferencesContext();

  const ctx = api.useUtils();

  const { mutate: toggle12HourSettings } = api.preference.toggle.useMutation({
    onSuccess: () => {
      void ctx.preference.get.invalidate();
    },
    onError: () => {
      toast.error("Could not switch time mode. Please try again.");
    },
  });

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

export default Preferences;
