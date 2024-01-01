import { createAlarmSchema } from "@/utils";
import type { z } from "zod";

type CreateAlarmFormProps = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type AlarmFormValues = z.infer<typeof createAlarmSchema>;

const CreateAlarmForm = ({ setIsModalOpen }: CreateAlarmFormProps) => {
  return <div>CreateAlarmForm</div>;
};

export default CreateAlarmForm;
