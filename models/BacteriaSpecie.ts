import { Model, Attr, Str, BelongsTo, Uid } from "pinia-orm";
import Bacteria from "./Bacteria";

export default class BacteriaSpecie extends Model {
  static entity = "bacteria_species";

  @Uid()
  id!: string | null;

  @Str("")
  bacteriaSpecieName!: string;

  @Attr(null)
  bacteriaId!: string | null;

  @BelongsTo(() => Bacteria, "bacteriaId")
  bacteria!: Bacteria;
}
