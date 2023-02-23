import { Model } from "pinia-orm";
import { Uid } from "pinia-orm/dist/decorators";

export default class SwabPeriodCleaningValidation extends Model {
  static entity = "swab_period_cleaning_validation";

  static primaryKey = ["swabPeriodId", "cleaningValidationId"];

  @Uid()
  declare swabPeriodId: string;

  @Uid()
  declare cleaningValidationId: string;
}
