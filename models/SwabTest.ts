import { Model } from "pinia-orm";
import { Attr, Str, BelongsToMany, Uid } from "pinia-orm/dist/decorators";
import Bacteria from "./Bacteria";
import BacteriaSpecie from "./BacteriaSpecie";
import SwabTestBacteria from "./SwabTestBacteria";
import SwabTestBacteriaSpecie from "./SwabTestBacteriaSpecie";
export default class SwabTest extends Model {
  static entity = "swab_test";

  @Uid()
  declare id: string;

  @Str("")
  declare swabTestCode: string;

  @Attr(null)
  declare swabTestRecordedAt: string | null;

  @Attr(null)
  declare swabTestNote: string | null;

  @BelongsToMany(
    () => Bacteria,
    () => SwabTestBacteria,
    "swabTestId",
    "bacteriaId"
  )
  declare bacteria: Bacteria[];

  @BelongsToMany(
    () => BacteriaSpecie,
    () => SwabTestBacteriaSpecie,
    "swabTestId",
    "bacteriaSpecieId"
  )
  declare bacteriaSpecies: BacteriaSpecie[];

  // @Attr([])
  // swabAreaHistoryIds!: string[];

  // @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "swabTestId")
  // swabAreaHistories!: SwabAreaHistory[];

  // @Attr([])
  // swabProductHistoryIds!: string[];

  // @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "swabTestId")
  // swabProductHistories!: SwabProductHistory[];
}
