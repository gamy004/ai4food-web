import { Attr, Model, Uid, Str, BelongsToMany, HasManyBy } from "pinia-orm";
import BacteriaSpecie from "./BacteriaSpecie";
import SwabTest from "./SwabTest";
import SwabTestBacteria from "./SwabTestBacteria";

export default class Bacteria extends Model {
  static entity = "bacteria";

  @Uid()
  id!: string | null;

  @Str("")
  bacteriaName!: string;

  @BelongsToMany(
    () => SwabTest,
    () => SwabTestBacteria,
    "bacteriaId",
    "swabTestId"
  )
  swabTests: SwabTest[];

  @Attr([])
  bacteriaSpecieIds: string[];

  @HasManyBy(() => BacteriaSpecie, "bacteriaSpecieIds", "bacteriaId")
  bacteriaSpecies: BacteriaSpecie[];
}
