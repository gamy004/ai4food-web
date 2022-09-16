import { Model, Attr, Str } from "pinia-orm";

export default class BacteriaSpecie extends Model {
  static entity = "bacteria_species";

  @Attr(null)
  bacteriaId: string | null;

  @Str("")
  bacteriaName!: string;

  @Attr(null)
  bacteriaSpecieId: string;

  @Str("")
  bacteriaSpecieName!: string;
}
