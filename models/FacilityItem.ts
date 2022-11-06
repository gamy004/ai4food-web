import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  BelongsTo,
  HasManyBy
} from "pinia-orm/dist/decorators";
import Facility from "./Facility";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabProductHistory from "./SwabProductHistory";

export default class FacilityItem extends Model {
  static entity = "facility_item";

  @Uid()
  declare id: string;

  @Str("")
  declare facilityItemName: string;

  @Attr(null)
  declare roomId: string | null;

  @Attr(null)
  declare zoneId: string | null;

  @Attr(null)
  declare facilityId: string | null;

  @BelongsTo(() => Facility, "facilityId")
  declare facility: Facility;

  @Attr([])
  declare swabAreaHistoryIds: string[];

  @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "facilityItemId")
  declare swabAreaHistories: SwabAreaHistory[];

  @Attr([])
  declare swabProductHistoryIds: string[];

  @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "facilityItemId")
  declare swabProductHistories: SwabProductHistory[];
}
