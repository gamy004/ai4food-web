import { Model, Uid } from "pinia-orm";

export default class SwabTestBacteriaSpecie extends Model {
  static entity = "swab_test_bacteria_specie";

  static primaryKey = ["swabTestId", "bacteriaSpecieId"];

  @Uid()
  swabTestId!: string;

  @Uid()
  bacteriaSpecieId!: string;
}
