export const useMath = () => {
  return {
    percentOf(value: number, total: number) {
      let percent = 0;

      if (value > 0 && total > 0) {
        percent = parseFloat(((value * 100) / total).toFixed(2));
      }

      return percent;
    },
  };
};
