import { Attr, Model, Uid, Str } from "pinia-orm";
import BacteriaSpecies from "./BacteriaSpecies";

export default class Bacteria extends Model {
    static entity = "bacteria";
  
    @Uid()
    id!: string | null;
  
    @Str("")
    bacteriaName!: string;
  
    @Attr([])
    bacteriaSpecies: BacteriaSpecies[];
  }