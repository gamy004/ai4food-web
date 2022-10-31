import { BooleanState, useBooleanState } from "./useBooleanState";

export const useHiddenState = <T extends string>(state: BooleanState<T>) => {
  const booleanState = useBooleanState(state);

  return {
    isHidden(key: T, defaultState?: boolean) {
      let isHidden = false;

      if (defaultState !== undefined) {
        isHidden = defaultState;
      }

      if (booleanState.hasState(key)) {
        isHidden = booleanState.isTrue(key);
      }

      return isHidden;
    },
  };
};
