import { useStore } from "../stores/fractal-store";
import { debounce } from "../lib/utils/debounce";

export const debounceResolutionUpdate = debounce(
  (data: Partial<{ width: number; height: number }>) => {
    if (data.width! <= 0 || data.height! <= 0) {
      return;
    }

    useStore.getState().setResolution("partial", data);
  },
  400,
);
