import { Model } from "pinia-orm";
import { Attr, Uid, BelongsTo, HasManyBy } from "pinia-orm/dist/decorators";
import CleaningHistoryValidation from "./CleaningHistoryValidation";
import CleaningProgram from "./CleaningProgram";
import SwabAreaHistory from "./SwabAreaHistory";

const { formatThLocale } = useDate();

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
  declare cleaningHistoryRecordedAt: string;

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

  @HasManyBy(() => CleaningHistoryValidation, "cleaningValidationIds")
  declare cleaningHistoryValidations: CleaningHistoryValidation[];

  get readableCleaningHistoryRecordedAt() {
    return this.cleaningHistoryRecordedAt
      ? formatThLocale(this.cleaningHistoryRecordedAt, "PP HH:mm น.")
      : "";
  }

  get isCompleted() {
    const { loadCleaningHistoryValidationToCleaningHistory } = useCleaning();

    const {
      getSwabAreaHistoryById,
      getSwabPeriodById,
      loadCleaningValidationToSwabPeriod,
    } = useSwab();

    let isCompleted =
      this.cleaningHistoryStartedAt !== null &&
      this.cleaningHistoryEndedAt !== null &&
      this.cleaningProgramId !== null &&
      this.cleaningType !== null;

    const cleaingHistoryWithValidations =
      loadCleaningHistoryValidationToCleaningHistory(this);

    const { cleaningHistoryValidations = [] } = cleaingHistoryWithValidations;

    const swabAreaHistory = getSwabAreaHistoryById(this.swabAreaHistoryId);

    if (swabAreaHistory) {
      const swabPeriod = loadCleaningValidationToSwabPeriod(
        getSwabPeriodById(swabAreaHistory.swabPeriodId)
      );

      if (swabPeriod && swabPeriod.cleaningValidations) {
        const { cleaningValidations = [] } = swabPeriod;

        if (cleaningValidations.length) {
          isCompleted =
            isCompleted &&
            cleaningValidations.length === cleaningHistoryValidations.length; // cleaning valdiation must have the same record as cleaning history validation
        }
      }
    }

    return isCompleted;
  }
}
