import { useCallback, useState } from "react";

type SettingStatus = {
  isOpen: boolean;
  isHovering: boolean;
};

const useSettingsActions = () => {
  const [settingsTab, setSettingsTab] = useState<SettingStatus>({
    isHovering: false,
    isOpen: false,
  });

  const closeSettings = useCallback(() => {
    setSettingsTab({
      isHovering: false,
      isOpen: false,
    });
  }, []);

  const openSettings = useCallback(() => {
    setSettingsTab((prev) => ({
      ...prev,
      isOpen: true,
    }));
  }, []);

  return {
    settingsTab,
    closeSettings,
    openSettings,
    setSettingsTab,
  };
};

export default useSettingsActions;
