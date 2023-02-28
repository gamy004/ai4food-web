import { Model } from "pinia-orm";
import { Attr, BelongsTo, Bool, Uid } from "pinia-orm/dist/decorators";
import CleaningHistory from "./CleaningHistory";
import CleaningValidation from "./CleaningValidation";

export default class CleaningHistoryValidation extends Model {
  static entity = "cleaning_history_validation";

  @Uid()
  declare id: string;

  @Attr(null)
  declare cleaningHistoryId: string;

  @BelongsTo(() => CleaningHistory, "cleaningHistoryId")
  declare cleaningHistory: CleaningHistory;

  @Attr(null)
  declare cleaningValidationId: string;

  @BelongsTo(() => CleaningValidation, "cleaningValidationId")
  declare cleaningValidation: CleaningValidation;

  @Bool(false)
  declare pass: boolean;
}
