import { Model } from "pinia-orm";
import {
  Attr,
  Bool,
  Str,
  Uid,
  HasManyBy,
  BelongsToMany,
} from "pinia-orm/dist/decorators";
import SwabPeriod from "./SwabPeriod";
import SwabPeriodCleaningValidation from "./SwabPeriodCleaningValidation";

export default class CleaningValidation extends Model {
  static entity = "cleaning_validation";

  @Uid()
  declare id: string;

  @Str("")
  declare cleaningValidationName: string;

  @Attr(null)
  declare cleaningValidationDescription: string;

  @Bool(true)
  declare active: boolean;

  @BelongsToMany(
    () => SwabPeriod,
    () => SwabPeriodCleaningValidation,
    "cleaningValidationId",
    "swabPeriodId"
  )
  declare swabPeriods: SwabPeriod[];
}
