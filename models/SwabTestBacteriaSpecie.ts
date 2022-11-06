import { Model } from "pinia-orm";
import { Uid } from "pinia-orm/dist/decorators";

export default class SwabTestBacteriaSpecie extends Model {
  static entity = "swab_test_bacteria_specie";

  static primaryKey = ["swabTestId", "bacteriaSpecieId"];

  @Uid()
  declare swabTestId: string;

  @Uid()
  declare bacteriaSpecieId: string;
}
