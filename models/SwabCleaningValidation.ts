import { Model } from "pinia-orm";
import { BelongsTo, Uid } from "pinia-orm/dist/decorators";
import CleaningValidation from "./CleaningValidation";
import SwabArea from "./SwabArea";
import SwabPeriod from "./SwabPeriod";

export default class SwabCleaningValidation extends Model {
  static entity = "swab_cleaning_validation";

  static primaryKey = ["swabPeriodId", "cleaningValidationId", "swabAreaId"];

  @Uid()
  declare swabPeriodId: string;

  @BelongsTo(() => SwabPeriod, "swabPeriodId")
  declare swabPeriod: SwabPeriod;

  @Uid()
  declare swabAreaId: string;

  @BelongsTo(() => SwabArea, "swabAreaId")
  declare swabArea: SwabArea;

  @Uid()
  declare cleaningValidationId: string;

  @BelongsTo(() => CleaningValidation, "cleaningValidationId")
  declare cleaningValidation: CleaningValidation;
}
