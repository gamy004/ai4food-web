import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  BelongsTo
} from "pinia-orm/dist/decorators";
import Bacteria from "./Bacteria";

export default class BacteriaSpecie extends Model {
  static entity = "bacteria_species";

  @Uid()
  declare id: string;

  @Str("")
  declare bacteriaSpecieName: string;

  @Attr(null)
  declare bacteriaId: string | null;

  @BelongsTo(() => Bacteria, "bacteriaId")
  declare bacteria: Bacteria;
}
