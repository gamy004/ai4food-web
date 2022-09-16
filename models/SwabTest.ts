import { Attr, Model, Uid, Str, HasManyBy, BelongsToMany } from "pinia-orm";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabProductHistory from "./SwabProductHistory";
import Bacteria from "./Bacteria";
import BacteriaSpecie from "./BacteriaSpecie";
import SwabTestBacteria from "./SwabTestBacteria";
export default class SwabTest extends Model {
  static entity = "swab_test";

  @Attr(null)
  id!: string | null;

  @Str("")
  swabTestCode!: string;

  @Attr(null)
  swabTestRecordedAt?: string;

  @Attr(null)
  swabTestNote?: string;

  @BelongsToMany(
    () => Bacteria,
    () => SwabTestBacteria,
    "swabTestId",
    "bacteriaId"
  )
  bacteria: Bacteria[];

  // @Attr([])
  // bacteriaSpecies!: BacteriaSpecie[];

  // @Attr([])
  // swabAreaHistoryIds!: string[];

  // @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "swabTestId")
  // swabAreaHistories!: SwabAreaHistory[];

  // @Attr([])
  // swabProductHistoryIds!: string[];

  // @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "swabTestId")
  // swabProductHistories!: SwabProductHistory[];
}
