import Modal from "../Modal";
import type { Alarm } from "@prisma/client";
import { Button, InfoCircleIcon, Tooltip } from "../UI";
import { useState } from "react";

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
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  return (
    <Modal isOpen={isAlarmRinging} handleClose={handleClose}>
      <div className="flex h-full w-40 flex-col items-center gap-4">
        <audio
          src={alarm.sound ?? process.env.NEXT_PUBLIC_JINGLE_URL}
          hidden
          autoPlay
        />
        <h1 className="text-lg leading-none">{alarm.name}</h1>
        <div className="flex h-full flex-col items-center justify-center gap-3.5">
          {alarm.snooze ? (
            <>
              <div className="flex flex-row gap-2">
                <Button color="default" onClick={handleClose}>
                  Stop
                </Button>
                <Button onClick={(e) => handleSnoozeClick(e)}>Snooze</Button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="border-b border-b-transparent text-2xs transition hover:border-b-slate-900"
                  onClick={(e) => handleSnoozeClick(e)}
                >
                  Demo snooze
                </button>
                <button
                  onMouseEnter={() => setShowDemoInfo(true)}
                  onMouseLeave={() => setShowDemoInfo(false)}
                >
                  <Tooltip
                    text="Alarm will go off in 10 seconds."
                    isShowing={showDemoInfo}
                    color="default"
                    placement="right"
                  >
                    <InfoCircleIcon />
                  </Tooltip>
                </button>
              </div>
            </>
          ) : (
            <Button onClick={handleClose}>Stop</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Snooze;
