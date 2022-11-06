export type ColState<Keys extends string> = {
  [K in Keys]?: number | string;
};

export const useColState = <T extends string>(state: ColState<T>) => {
  return {
    colClass(key: T, defaultCol?: number | string): string {
      let colValue = state && state[key] ? state[key] : "auto";

      if (defaultCol && colValue === "auto") {
        colValue = defaultCol;
      }

      return colValue !== "auto"
        ? `${colValue}`
            .split(" ")
            .map((v) => `col-${v}`)
            .join(" ")
        : "col";
    },
  };
};
