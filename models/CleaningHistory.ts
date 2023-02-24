import { Model } from "pinia-orm";
import { Attr, Uid, BelongsTo, HasManyBy } from "pinia-orm/dist/decorators";
import CleaningHistoryValidation from "./CleaningHistoryValidation";
import CleaningProgram from "./CleaningProgram";
import SwabAreaHistory from "./SwabAreaHistory";

export enum CleaningType {
  DRY = "dry",
  WET = "wet",
}

export enum CleaningTypeMapper {
  dry = "แบบแห้ง",
  wet = "แบบเปียก",
}

export default class CleaningHistory extends Model {
  static entity = "cleaning_history";

  @Uid()
  declare id: string;

  @Attr(null)
  declare cleaningHistoryStartedAt: string;

  @Attr(null)
  declare cleaningHistoryEndedAt: string;

  @Attr(null)
  declare cleaningProgramId: string | null;

  @BelongsTo(() => CleaningProgram, "cleaningProgramId")
  declare cleaningProgram: CleaningProgram;

  @Attr(null)
  declare recordedUserId: string;

  @Attr(null)
  declare swabRoundId: string;

  @Attr(null)
  declare swabAreaHistoryId: string | null;

  @BelongsTo(() => SwabAreaHistory, "swabAreaHistoryId")
  declare swabAreaHistory: SwabAreaHistory;

  @Attr(null)
  declare cleaningType: CleaningType | null;

  @Attr([])
  declare cleaningValidationIds: string[];

  @HasManyBy(
    () => CleaningHistoryValidation,
    "cleaningValidationIds",
    "cleaningHistoryId"
  )
  declare cleaningHistoryValidations: CleaningHistoryValidation[];

  get isCompleted() {
    let isCompleted = true;

    return isCompleted;
  }
}
