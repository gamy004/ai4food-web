import { Model, useRepo } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  BelongsTo,
  HasManyBy,
} from "pinia-orm/dist/decorators";
import Facility from "./Facility";
import ContactZone from "./ContactZone";

export default class SwabArea extends Model {
  static entity = "swab_area";

  @Uid()
  declare id: string;

  @Str("")
  declare swabAreaName: string;

  @Attr(null)
  declare mainSwabAreaId: string | null;

  @Attr(null)
  declare facilityId: string | null;

  @Attr(null)
  declare contactZoneId: string | null;

  @Attr([])
  declare subSwabAreaIds: string[];

  @HasManyBy(() => SwabArea, "subSwabAreaIds", "mainSwabAreaId")
  declare subSwabAreas: SwabArea[];

  @BelongsTo(() => SwabArea, "mainSwabAreaId")
  declare mainSwabArea: SwabArea;

  @BelongsTo(() => Facility, "facilityId")
  declare facility: Facility;

  @BelongsTo(() => ContactZone, "contactZoneId")
  declare contactZone: ContactZone;

  get isMainArea(): boolean {
    return this.mainSwabAreaId === null;
  }

  get isSubArea(): boolean {
    return this.mainSwabAreaId !== null;
  }

  get hasSubArea(): boolean {
    const swapAreaRepo = useRepo(SwabArea);

    const subSwabArea = swapAreaRepo
      .query()
      .where("mainSwabAreaId", this.id)
      .get();

    return subSwabArea.length > 0;
  }

  get shouldRecordTime(): boolean {
    return this.isMainArea;
  }

  get shouldRecordFacility(): boolean {
    return this.isMainArea;
  }

  get shouldRecordEnvironment(): boolean {
    return this.isSubArea || (this.isMainArea && !this.hasSubArea);
  }

  get shouldRecordProduct(): boolean {
    return this.isMainArea;
  }

  get shouldRecordImage(): boolean {
    return this.isMainArea;
  }

  get subSwabAreasData(): SwabArea[] {
    const swapAreaRepo = useRepo(SwabArea);

    const subSwabArea = swapAreaRepo
      .query()
      .where("mainSwabAreaId", this.id)
      .get();

    return subSwabArea;
  }
}
