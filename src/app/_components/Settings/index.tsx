import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useRef,
} from "react";
import SettingsDropdown from "./SettingsDropdown";
import SettingsWrapper from "./SettingsWrapper";
import { DeleteAlarmlistIcon, EditIcon, Ellipsis } from "../UI";
import DeleteAlarmIcon from "../UI/DeleteAlarmIcon";

interface SettingsProps extends ComponentPropsWithoutRef<"div"> {
  handleEditAction: () => void;
  handleDeleteAction: () => void;
  closeSettings: () => void;
  isOpen: boolean;
  isHovering: boolean;
  action: "Alarm" | "Alarmlist";
  cursorPosition: {
    x: number;
    y: number;
  };
  handleAlarmlistModal?: () => void;
}

const Settings = forwardRef<HTMLDivElement, SettingsProps>(
  (
    {
      action,
      handleEditAction,
      handleDeleteAction,
      closeSettings,
      isOpen,
      isHovering,
      cursorPosition,
      handleAlarmlistModal,
    }: SettingsProps,
    ref,
  ) => {
    const settingsRef = useRef<HTMLDivElement>(null);

    const handleSettingsAction = useCallback((e: MouseEvent) => {
      // Clicking on "Delete" closes settings tab and opens delete modal
      if (
        settingsRef?.current &&
        settingsRef.current?.contains(e.target as Node)
      ) {
        closeSettings();
      } else if (
        // Close settings outside modal
        settingsRef?.current &&
        !settingsRef.current?.contains(e.target as Node)
      ) {
        closeSettings();
        if (action === "Alarmlist" && handleAlarmlistModal) {
          handleAlarmlistModal();
        }
      }
    }, []);

    return (
      <div className="relative" ref={ref}>
        {isHovering && <Ellipsis isSettingsTabOpen={isOpen} />}
        {isOpen && (
          <SettingsWrapper
            ref={settingsRef}
            isOpen={isOpen}
            cursorPosition={cursorPosition}
            handleClose={(e) => handleSettingsAction(e)}
          >
            <SettingsDropdown
              editIcon={<EditIcon />}
              editText={action === "Alarmlist" ? "Rename" : "Edit"}
              deleteIcon={
                action === "Alarmlist" ? (
                  <DeleteAlarmlistIcon />
                ) : (
                  <DeleteAlarmIcon />
                )
              }
              deleteText="Delete"
              handleEditAction={handleEditAction}
              handleDeleteAction={handleDeleteAction}
            />
          </SettingsWrapper>
        )}
      </div>
    );
  },
);

export { Settings, SettingsDropdown, SettingsWrapper };
