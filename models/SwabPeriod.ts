import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  HasManyBy
} from "pinia-orm/dist/decorators";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabProductHistory from "./SwabProductHistory";

export default class SwabPeriod extends Model {
  static entity = "swab_period";

  @Uid()
  declare id: string;

  @Str("")
  declare swabPeriodName: string;

  @Attr([])
  declare swabAreaHistoryIds: string[];

  @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "swabPeriodId")
  declare swabAreaHistories: SwabAreaHistory[];

  @Attr([])
  declare swabProductHistoryIds: string[];

  @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "swabPeriodId")
  declare swabProductHistories: SwabProductHistory[];
}
