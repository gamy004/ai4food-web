import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  BelongsToMany,
  HasManyBy
} from "pinia-orm/dist/decorators";
import BacteriaSpecie from "./BacteriaSpecie";
import SwabTest from "./SwabTest";
import SwabTestBacteria from "./SwabTestBacteria";

export default class Bacteria extends Model {
  static entity = "bacteria";

  @Uid()
  declare id: string;

  @Str("")
  declare bacteriaName: string;

  @BelongsToMany(
    () => SwabTest,
    () => SwabTestBacteria,
    "bacteriaId",
    "swabTestId"
  )
  declare swabTests: SwabTest[];

  @Attr([])
  declare bacteriaSpecieIds: string[];

  @HasManyBy(() => BacteriaSpecie, "bacteriaSpecieIds", "bacteriaId")
  declare bacteriaSpecies: BacteriaSpecie[];
}
