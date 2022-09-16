import FacilityItem from "./FacilityItem";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabArea from "./SwabArea";
import SwabPeriod from "./SwabPeriod";

export default class SwabPlan {
  facilityItems!: FacilityItem;

  swabAreaHistories!: SwabAreaHistory[];

  swabAreas!: SwabArea;

  swabPeriods!: SwabPeriod;
}
