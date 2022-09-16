import { Model, Str, Uid, Attr, HasManyBy, BelongsTo } from "pinia-orm";
import Facility from "./Facility";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabProductHistory from "./SwabProductHistory";

export default class FacilityItem extends Model {
  static entity = "facility_item";

  @Uid()
  id!: string | null;

  @Str("")
  facilityItemName!: string;


  @Attr(null)
  roomId!: string;

  @Attr(null)
  zoneId!: string;

  @Attr(null)
  facilityId!: string;

  @BelongsTo(() => Facility, "facilityId")
  facility!: Facility;

  @Attr([])
  swabAreaHistoryIds!: string[];

  @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "facilityItemId")
  swabAreaHistories!: SwabAreaHistory[];

  @Attr([])
  swabProductHistoryIds!: string[];

  @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "facilityItemId")
  swabProductHistories!: SwabProductHistory[];
}
