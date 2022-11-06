import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  HasManyBy
} from "pinia-orm/dist/decorators";
import FacilityItem from "./FacilityItem";
import SwabArea from "./SwabArea";

export enum FacilityType {
    MACHINE = "machine",
    VERHICAL = "vehical",
    TOOL = "tool"
}

export default class Facility extends Model {
  static entity = "facility";

    @Uid()
    declare id: string;

    @Str("")
    declare facilityName: string;

    @Str("")
    declare facilityType: FacilityType;

    @Attr([])
    declare swabAreaIds: string[];

    @HasManyBy(() => SwabArea, "swabAreaIds", "facilityId")
    declare swabAreas: SwabArea[];

    @Attr([])
    declare facilityItemIds: string[];

    @HasManyBy(() => FacilityItem, "FacilityItemIds", "facilityId")
    declare facilityItems: FacilityItem[];
}
