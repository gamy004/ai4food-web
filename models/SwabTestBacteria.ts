import { Model, Uid } from "pinia-orm";

export default class SwabTestBacteria extends Model {
  static entity = "swab_test_bacteria";

  static primaryKey = ["swabTestId", "bacteriaId"];

  @Uid()
  swabTestId!: string;

  @Uid()
  bacteriaId!: string;
}
