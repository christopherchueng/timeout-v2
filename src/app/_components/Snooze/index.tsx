import { useState } from "react";
import clsx from "clsx";
import type { Alarm } from "@prisma/client";
import Modal from "../Modal";
import { Button, InfoCircleIcon, Tooltip } from "../UI";

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
      <div
        className={clsx(
          "flex h-full w-40 flex-col items-center gap-4",
          alarm.snooze ? "py-4" : "py-6",
        )}
      >
        <audio
          src={alarm.sound ?? process.env.NEXT_PUBLIC_SOUND_URL}
          hidden
          autoPlay
          loop
        />
        <h1 className="text-lg leading-none">{alarm.name}</h1>
        <div className="flex h-full flex-col items-center justify-center gap-3.5">
          {alarm.snooze ? (
            <>
              <div className="flex flex-row gap-4">
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
