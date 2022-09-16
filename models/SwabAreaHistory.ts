import {
  Attr,
  BelongsTo,
  BelongsToMany,
  HasManyBy,
  Model,
  Str,
  Uid,
  useRepo,
} from "pinia-orm";
import { Shift } from "~~/composables/useDate";
import FacilityItem from "./FacilityItem";
import Product from "./Product";
import SwabArea from "./SwabArea";
import SwabAreaHistoryEnvironment from "./SwabAreaHistoryEnvironment";
import SwabAreaHistoryImage from "./SwabAreaHistoryImage";
import SwabEnvironment from "./SwabEnvironment";
import SwabPeriod from "./SwabPeriod";
import SwabTest from "./SwabTest";

export default class SwabAreaHistory extends Model {
  static entity = "swab_area_history";

  @Uid()
  id!: string | null;

  @Str("")
  swabAreaDate!: string;

  @Attr(null)
  shift!: Shift;

  @Attr(null)
  swabAreaSwabedAt!: string;

  @Attr(null)
  swabAreaTemperature!: string;

  @Attr(null)
  swabAreaHumidity!: string;

  @Attr(null)
  swabAreaAtp!: number;

  @Attr(null)
  swabAreaNote!: string;

  @Attr(null)
  swabAreaId!: string;

  @Attr(null)
  swabPeriodId!: string;

  @Attr(null)
  swabTestId!: string;

  @Attr(null)
  productId!: string;

  @Attr(null)
  productDate!: string;

  @Attr(null)
  productLot!: string;

  @Attr(null)
  facilityItemId!: string;

  @Attr([])
  swabAreaHistoryImageIds!: string[];

  @BelongsTo(() => SwabArea, "swabAreaId")
  swabArea!: SwabArea;

  @BelongsTo(() => SwabPeriod, "swabPeriodId")
  swabPeriod!: SwabPeriod;

  @BelongsTo(() => SwabTest, "swabTestId")
  swabTest: SwabTest;

  @BelongsToMany(
    () => SwabEnvironment,
    () => SwabAreaHistoryEnvironment,
    "swabAreaHistoryId",
    "swabEnvironmentId"
  )
  swabEnvironments!: SwabEnvironment[];

  @HasManyBy(
    () => SwabAreaHistoryImage,
    "swabAreaHistoryImageIds",
    "swabAreaHistoryId"
  )
  swabAreaHistoryImages!: SwabAreaHistoryImage[];

  @BelongsTo(() => Product, "productId")
  product!: Product;

  @BelongsTo(() => FacilityItem, "facilityItemId")
  facilityItem!: FacilityItem;

  get isCompleted() {
    let isCompleted = false;

    const swapAreaRepo = useRepo(SwabArea);

    const relatedSwabArea = swapAreaRepo.find(this.swabAreaId);

    if (relatedSwabArea.isMainArea) {
      isCompleted =
        this.swabAreaSwabedAt !== null &&
        this.facilityItemId !== null &&
        this.productDate !== null &&
        this.productId !== null &&
        this.productLot !== null &&
        this.swabAreaHistoryImageIds.length > 0;
    }

    if (relatedSwabArea.isSubArea) {
      isCompleted =
        this.swabAreaSwabedAt !== null && this.facilityItemId !== null;
    }

    if (relatedSwabArea.shouldRecordEnvironment) {
      const swabAreaHistoryEnvironmentRepo = useRepo(
        SwabAreaHistoryEnvironment
      );

      const relatedSwabEnvironments = swabAreaHistoryEnvironmentRepo
        .query()
        .where("swabAreaHistoryId", this.id)
        .get();

      isCompleted =
        isCompleted &&
        this.swabAreaTemperature !== null &&
        this.swabAreaHumidity !== null &&
        relatedSwabEnvironments.length > 0;
    }

    return isCompleted;
  }
}
