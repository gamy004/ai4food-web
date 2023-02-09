import SwabArea from "~~/models/SwabArea";
import SwabAreaHistory from "~~/models/SwabAreaHistory";

export const useSwabAreaHistoryStatus = () => {
  const isAllRelatedSwabAreaCompleted = (swabAreaHistory: SwabAreaHistory) => {
    const { getSwabAreaById, getSubSwabAreaHistories } = useSwab();

    let countComplete = 0;
    let countArea = 1;
    let isCompleted = swabAreaHistory.isCompleted;

    if (isCompleted) {
      countComplete += 1;
    }

    const swabArea = getSwabAreaById(swabAreaHistory.swabAreaId);

    if (swabArea.isMainArea) {
      // get related sub swab area history on the same swab period and shift
      const relatedSubSwabAreaHistories = getSubSwabAreaHistories(
        swabAreaHistory.id
      );

      isCompleted =
        isCompleted &&
        relatedSubSwabAreaHistories.every(
          (subSwabAreaHistory) => subSwabAreaHistory.isCompleted
        );

      relatedSubSwabAreaHistories.forEach((subSwabAreaHistory) => {
        countArea += 1;

        if (subSwabAreaHistory.isCompleted) {
          countComplete += 1;
        }
      });
    }

    return { isCompleted, countComplete, countArea };
  };

  return {
    isAllRelatedSwabAreaCompleted,
  };
};
