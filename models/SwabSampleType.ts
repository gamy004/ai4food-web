import { Model } from "pinia-orm";
import { Attr, Uid, Str, HasManyBy } from "pinia-orm/dist/decorators";
import SwabTest from "./SwabTest";


export default class SwabSampleType extends Model {
  static entity = "swab_sample_type";

  @Uid()
  declare id: string;

  @Str("")
  declare swabSampleTypeName: string;

  @Attr([])
  declare swabTestIds: string[];

  @HasManyBy(() => SwabTest, "swabTestIds", "swabSampleTypeId")
  declare swabProductHistories: SwabTest[];
}
