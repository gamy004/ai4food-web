export type HiddenState<Keys extends string> = {
    [K in Keys]?: boolean;
}

export const useHiddenState = <T extends string>(state: HiddenState<T>) => {
    return {
        isHidden(key: T) {
            return state && state[key] === true;
        }
    };
}