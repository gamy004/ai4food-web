import { Model } from "pinia-orm";
import { Attr, Str, Uid, HasManyBy } from "pinia-orm/dist/decorators";
import SwabArea from "./SwabArea";

export default class ContactZone extends Model {
  static entity = "contact_zone";

  @Uid()
  declare id: string;

  @Str("")
  declare contactZoneName: string;

  @Attr(null)
  declare contactZoneDescription: string;

  @Attr([])
  declare swabAreaIds: string[];

  @HasManyBy(() => SwabArea, "swabAreaIds", "contactZoneId")
  declare swabAreas: SwabArea[];
}
