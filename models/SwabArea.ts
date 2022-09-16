import { Attr, BelongsTo, HasManyBy, Model, Str, Uid, useRepo } from "pinia-orm";
import Facility from "./Facility";
import FacilityItem from "./FacilityItem";

export default class SwabArea extends Model {
  static entity = "swab_area";

    @Uid()
      id!: string | null;

    @Str("")
      swabAreaName!: string;

    @Attr(null)
      mainSwabAreaId!: string;

    @Attr(null)
      facilityId!: string;

    @HasManyBy(() => SwabArea, "subSwabAreaIds", "mainSwabAreaId")
      subSwabAreas!: SwabArea[];

    @BelongsTo(() => SwabArea, "mainSwabAreaId")
      mainSwabArea!: SwabArea;

    @BelongsTo(() => Facility, "facilityId")
      facility!: Facility;

    get isMainArea (): boolean {
      return this.mainSwabAreaId === null;
    }

    get isSubArea (): boolean {
      return this.mainSwabAreaId !== null;
    }

    get hasSubArea (): boolean {
      const swapAreaRepo = useRepo(SwabArea);

      const subSwabArea = swapAreaRepo.query()
        .where("mainSwabAreaId", this.id)
        .get();

      return subSwabArea.length > 0;
    }

    get shouldRecordEnvironment (): boolean {
      return this.isSubArea || (this.isMainArea && !this.hasSubArea);
    }

    get shouldRecordProduct (): boolean {
      return this.isMainArea;
    }

    get shouldRecordImage (): boolean {
      return this.isMainArea;
    }
}
