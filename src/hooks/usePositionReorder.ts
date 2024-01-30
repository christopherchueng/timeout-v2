import { useRef } from "react";
import { clamp, distance } from "@popmotion/popcorn";
import { arrayMoveImmutable } from "array-move";
import { AlarmlistWithAlarms } from "@/types";
import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";

type User = RouterOutputs["user"]["get"];

export function usePositionReorder(order: AlarmlistWithAlarms[] | undefined) {
  // const [order, setOrder] = useState(initialState);

  const ctx = api.useUtils();

  const { mutate: reorderAlarmlists } =
    api.user.rearrangeAlarmlists.useMutation({
      onMutate: async ({ newOrder }) => {
        await ctx.alarmlist.getAllWithAlarms.cancel();

        const previousUserData = ctx.user.get.getData();

        ctx.user.get.setData(undefined, (user: User | undefined) => {
          if (!user) return;

          return {
            ...user,
            alarmlists: newOrder,
          };
        });

        return { previousUserData };
      },
      onSuccess: () => {
        void ctx.user.get.invalidate();
        // void ctx.alarmlist.getAllWithAlarms.invalidate();
      },
      onError: () => {
        console.log("Error happened");
      },
    });

  // Update the type for positions
  const positions = useRef<{ height: number; top: number }[]>([]).current;
  const updatePosition = (i: number, offset: { height: number; top: number }) =>
    (positions[i] = offset);

  const updateOrder = (i: number, dragOffset: number) => {
    const targetIndex = findIndex(i, dragOffset, positions);
    if (order && order.length) {
      if (targetIndex !== i)
        reorderAlarmlists({
          newOrder: arrayMoveImmutable(order, i, targetIndex),
        });
    }
  };

  return [order, updatePosition, updateOrder] as const;
}

const buffer = 30;

export const findIndex = (
  i: number,
  yOffset: number,
  positions: { height: number; top: number }[],
) => {
  let target = i;
  const currentItem = positions[i];

  if (currentItem) {
    const { top, height } = currentItem;
    const bottom = top + height;

    if (yOffset > 0) {
      const nextItem = positions[i + 1];
      if (nextItem === undefined) return i;

      const swapOffset =
        distance(bottom, nextItem.top + nextItem.height / 2) + buffer;
      if (yOffset > swapOffset) target = i + 1;
    } else if (yOffset < 0) {
      const prevItem = positions[i - 1];
      if (prevItem === undefined) return i;

      const prevBottom = prevItem.top + prevItem.height;
      const swapOffset =
        distance(top, prevBottom - prevItem.height / 2) + buffer;
      if (yOffset < -swapOffset) target = i - 1;
    }
  }

  return clamp(0, positions.length, target);
};
