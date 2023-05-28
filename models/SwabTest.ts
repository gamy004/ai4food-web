import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  BelongsToMany,
  Uid,
  HasManyBy,
  BelongsTo,
  Bool,
} from "pinia-orm/dist/decorators";
import Bacteria from "./Bacteria";
import BacteriaSpecie from "./BacteriaSpecie";
import SwabTestBacteria from "./SwabTestBacteria";
import SwabTestBacteriaSpecie from "./SwabTestBacteriaSpecie";
import { SwabStatusMapper } from "@/composables/useSwab";
import User from "./User";
import SwabSampleType from "./SwabSampleType";

const { formatThLocale } = useDate();

export default class SwabTest extends Model {
  static entity = "swab_test";

  @Uid()
  declare id: string;

  @Str("")
  declare swabTestCode: string;

  @Attr(null)
  declare swabTestRecordedAt: string | null;

  @Attr(null)
  declare bacteriaRecordedAt: string | null;

  @Attr(null)
  declare swabTestNote: string | null;

  @Bool(false)
  declare isReported: boolean;

  @Attr(null)
  declare reportReason: string | null;

  @Attr(null)
  declare reportDetail: string | null;

  @Attr(null)
  declare reportedUserId: string | null;

  @BelongsTo(() => User, "reportedUserId")
  declare reportedUser: User;

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

  @Attr(null)
  declare swabSampleTypeId: string | null;

  @BelongsTo(() => SwabSampleType, "swabSampleTypeId")
  declare swabSampleType: SwabSampleType;

  get isRecorded() {
    return this.swabTestRecordedAt !== null;
  }

  get isBacteriaRecorded() {
    return this.bacteriaRecordedAt !== null;
  }

  get readableBacteriaRecordedAt() {
    return this.bacteriaRecordedAt
      ? formatThLocale(this.bacteriaRecordedAt, "PP HH:mm น.")
      : "";
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

  get swabStatus() {
    let swabStatus = SwabStatus.PENDING;

    if (this.swabTestRecordedAt) {
      swabStatus = this.hasBacteria ? SwabStatus.DETECTED : SwabStatus.NORMAL;
    }

    return swabStatus;
  }

  get status() {
    return SwabStatusMapper[this.swabStatus];
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
