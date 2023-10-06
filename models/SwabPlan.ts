import { Model } from "pinia-orm";
import { Str, Uid, Attr } from "pinia-orm/dist/decorators";
// import FacilityItem from "./FacilityItem";
// import SwabAreaHistory from "./SwabAreaHistory";
// import SwabArea from "./SwabArea";
// import SwabPeriod from "./SwabPeriod";
// import SwabProductHistory from "./SwabProductHistory";
// import Facility from "./Facility";
import { Shift } from "~~/composables/useDate";

export default class SwabPlan extends Model {
  static entity = "swab_plan";

  @Uid()
  declare id: string;

  @Str("")
  declare swabPeriodId: string;

  @Str("")
  declare swabPlanCode: string;

  @Str("")
  declare swabPlanDate: string;

  @Str("")
  declare swabPlanNote: string;

  @Attr(null)
  declare shift: Shift | null;

  @Attr(null)
  declare publish: Shift | null;

  @Attr(null)
  declare totalItems: Shift | null;

  // facilities!: Facility[];

  // facilityItems!: FacilityItem[];

  // swabAreaHistories!: SwabAreaHistory[];

  // swabAreas!: SwabArea[];

  // swabPeriods!: SwabPeriod[];

  // swabProductHistories!: SwabProductHistory[];
}
