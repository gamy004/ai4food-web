import { Model, Str, Uid, Attr, HasManyBy } from "pinia-orm";
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
      id!: string | null;

    @Str("")
      facilityName!: string;

    @Str("")
      facilityType!: FacilityType;

    @Attr([])
      swabAreaIds!: string[];

    @HasManyBy(() => SwabArea, "swabAreaIds", "facilityId")
      swabAreas!: SwabArea[];

    @Attr([])
      facilityItemIds!: string[];

    @HasManyBy(() => FacilityItem, "FacilityItemIds", "facilityId")
      facilityItems!: FacilityItem[];
}
