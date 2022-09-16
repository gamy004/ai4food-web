import { Attr, Model, Uid, Str, HasManyBy } from "pinia-orm";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabProductHistory from "./SwabProductHistory";
import Bacteria from "./Bacteria";
export default class SwabTest extends Model {
  static entity = "swab_test";

  @Uid()
  id!: string | null;

  @Str("")
  swabTestCode!: string;

  @Attr([])
  bacteria!: Bacteria[];

  @Attr([])
  swabAreaHistoryIds!: string[];

  @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "swabTestId")
  swabAreaHistories!: SwabAreaHistory[];

  @Attr([])
  swabProductHistoryIds!: string[];

  @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "swabTestId")
  swabProductHistories!: SwabProductHistory[];
}
