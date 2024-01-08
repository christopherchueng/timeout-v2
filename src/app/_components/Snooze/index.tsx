import Modal from "../Modal";
import { Alarm } from "@prisma/client";
import { Button } from "../UI";

type SnoozeProps = {
  alarm: Alarm;
  isAlarmRinging: boolean;
  handleClose: () => void;
  handleSnoozeClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
};

const Snooze = ({
  alarm,
  isAlarmRinging,
  handleClose,
  handleSnoozeClick,
}: SnoozeProps) => {
  return (
    <Modal isOpen={isAlarmRinging} handleClose={handleClose}>
      <div className="flex flex-col items-center gap-4">
        <span>{alarm.name}</span>
        <Button onClick={(e) => handleSnoozeClick(e)}>Snooze</Button>
        <Button>Stop</Button>
        <button className="text-2xs" onClick={(e) => handleSnoozeClick(e)}>
          Demo snooze
        </button>
      </div>
    </Modal>
  );
};

export default Snooze;
