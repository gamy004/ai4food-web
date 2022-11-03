import SwabArea from "~~/models/SwabArea";
import SwabAreaHistory from "~~/models/SwabAreaHistory";

export const useSwabAreaHistoryStatus = () => {
  const isAllRelatedSwabAreaCompleted = (swabAreaHistory: SwabAreaHistory) => {
    const { getSwabAreaById, getSubSwabAreaHistoriesOfSamePeriodById } =
      useSwab();

    let isCompleted = swabAreaHistory.isCompleted;

    const swabArea = getSwabAreaById(swabAreaHistory.swabAreaId);

    if (swabArea.isMainArea) {
      // get related sub swab area history
      const relatedSubSwabAreaHistories =
        getSubSwabAreaHistoriesOfSamePeriodById(swabAreaHistory.id);

      isCompleted =
        isCompleted &&
        relatedSubSwabAreaHistories.every(
          (subSwabAreaHistory) => subSwabAreaHistory.isCompleted
        );
    }

    return isCompleted;
  };

  return {
    isAllRelatedSwabAreaCompleted,
  };
};
