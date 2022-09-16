import { Model, Uid, Str } from "pinia-orm";

export default class BacteriaSpecies extends Model {
    static entity = "bacteria_species";
  
    @Uid()
    bacteriaId: string | null;
  
    @Str("")
    bacteriaName!: string;
  
    @Str("")
    bacteriaSpecieId: string;
  
    @Str("")
    bacteriaSpecieName!: string;
  }