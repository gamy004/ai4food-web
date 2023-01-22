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

  get isRecorded() {
    return this.swabTestRecordedAt !== null;
  }

  get hasBacteria() {
    const { getBacteriaBySwabTestId } = useLab();

    const bacteria = getBacteriaBySwabTestId(this.id);

    return bacteria && bacteria.length > 0;
  }

  get hasBacteriaSpecies() {
    const { getBacteriaSpecieBySwabTestId } = useLab();

    const bacteriaSpecies = getBacteriaSpecieBySwabTestId(this.id);

    return bacteriaSpecies && bacteriaSpecies.length > 0;
  }

  get status() {
    let status = BacteriaStatusMapper.pending;

    if (this.isRecorded) {
      status = this.hasBacteria
        ? BacteriaStatusMapper.detected
        : BacteriaStatusMapper.normal;
    }

    return status;
  }

  get bacteriaNames() {
    const { getBacteriaSpecieBySwabTestId } = useLab();

    const bacteriaSpecies = getBacteriaSpecieBySwabTestId(this.id);

    const hasBacteriaSpecies = bacteriaSpecies && bacteriaSpecies.length > 0;

    return this.hasBacteria && hasBacteriaSpecies
      ? bacteriaSpecies
          .map(({ bacteriaSpecieName }) => bacteriaSpecieName)
          .join(",")
      : "";
  }
  // @Attr([])
  // swabAreaHistoryIds!: string[];

  // @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "swabTestId")
  // swabAreaHistories!: SwabAreaHistory[];

  // @Attr([])
  // swabProductHistoryIds!: string[];

  // @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "swabTestId")
  // swabProductHistories!: SwabProductHistory[];
}
