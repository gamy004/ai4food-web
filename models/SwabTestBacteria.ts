import { Model } from "pinia-orm";
import { Uid } from "pinia-orm/dist/decorators";

export default class SwabTestBacteria extends Model {
  static entity = "swab_test_bacteria";

  static primaryKey = ["swabTestId", "bacteriaId"];

  @Uid()
  declare swabTestId: string;

  @Uid()
  declare bacteriaId: string;
}
