import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  HasManyBy,
  BelongsToMany,
} from "pinia-orm/dist/decorators";
import CleaningValidation from "./CleaningValidation";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabPeriodCleaningValidation from "./SwabPeriodCleaningValidation";
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

  @BelongsToMany(
    () => CleaningValidation,
    () => SwabPeriodCleaningValidation,
    "swabPeriodId",
    "cleaningValidationId"
  )
  declare CleaningValidations: CleaningValidation[];
}
