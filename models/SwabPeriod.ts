import { Attr, HasManyBy, Model, Str, Uid } from "pinia-orm";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabProductHistory from "./SwabProductHistory";

export default class SwabPeriod extends Model {
  static entity = "swab_period";

  @Uid()
  id!: string | null;

  @Str("")
  swabPeriodName!: string;

  @Attr([])
  swabAreaHistoryIds!: string[];

  @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "swabPeriodId")
  swabAreaHistories!: SwabAreaHistory[];

  @Attr([])
  swabProductHistoryIds!: string[];

  @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "swabPeriodId")
  swabProductHistories!: SwabProductHistory[];
}
