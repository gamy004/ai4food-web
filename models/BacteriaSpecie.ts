import { Model, Attr, Str, BelongsTo } from "pinia-orm";
import Bacteria from "./Bacteria";

export default class BacteriaSpecie extends Model {
  static entity = "bacteria_species";

  @Attr(null)
  bacteriaId!: string | null;

  @BelongsTo(() => Bacteria, "bacteriaId")
  bacteria!: Bacteria;

  @Str("")
  bacteriaSpecieName!: string;
}
