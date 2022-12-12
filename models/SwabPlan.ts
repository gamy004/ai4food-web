import FacilityItem from "./FacilityItem";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabArea from "./SwabArea";
import SwabPeriod from "./SwabPeriod";
import SwabProductHistory from "./SwabProductHistory";
import Facility from "./Facility";

export default class SwabPlan {
  facilities!: Facility[];

  facilityItems!: FacilityItem[];

  swabAreaHistories!: SwabAreaHistory[];

  swabAreas!: SwabArea[];

  swabPeriods!: SwabPeriod[];

  swabProductHistories!: SwabProductHistory[];
}
