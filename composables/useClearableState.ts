import { BooleanState, useBooleanState } from "./useBooleanState";

export const useClearableState = <T extends string>(state: BooleanState<T>) => {
  const booleanState = useBooleanState(state);

  return {
    isClearable(key: T) {
      return booleanState.isTrue(key);
    },
  };
};
