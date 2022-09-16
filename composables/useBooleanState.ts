export type BooleanState<Keys extends string> = {
  [K in Keys]?: boolean;
};

export const useBooleanState = <T extends string>(state: BooleanState<T>) => {
  const hasState = (key: T) => {
    return state && state[key] !== undefined;
  };

  const isTrue = (key: T) => {
    return hasState(key) ? state[key] === true : false;
  };

  const isFalse = (key: T) => {
    return hasState(key) ? state[key] === false : false;
  };

  return {
    isTrue,
    isFalse,
    hasState,
  };
};
