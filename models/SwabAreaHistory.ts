import { Model, useRepo } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  BelongsTo,
  BelongsToMany,
  HasManyBy,
} from "pinia-orm/dist/decorators";
import { useDate, Shift } from "~~/composables/useDate";
import FacilityItem from "./FacilityItem";
import Product from "./Product";
import SwabArea from "./SwabArea";
import SwabAreaHistoryEnvironment from "./SwabAreaHistoryEnvironment";
import SwabAreaHistoryImage from "./SwabAreaHistoryImage";
import SwabEnvironment from "./SwabEnvironment";
import SwabPeriod from "./SwabPeriod";
import SwabTest from "./SwabTest";

const { formatThLocale, formatTimeThLocale } = useDate();

export default class SwabAreaHistory extends Model {
  static entity = "swab_area_history";

  @Uid()
  declare id: string;

  @Str("")
  declare swabAreaDate: string;

  @Attr(null)
  declare shift: Shift | null;

  @Attr(null)
  declare swabAreaSwabedAt: string | null;

  @Attr(null)
  declare swabAreaTemperature: string | null;

  @Attr(null)
  declare swabAreaHumidity: string | null;

  @Attr(null)
  declare swabAreaAtp: number | null;

  @Attr(null)
  declare swabAreaNote: string | null;

  @Attr(null)
  declare swabAreaId: string | null;

  @Attr(null)
  declare swabPeriodId: string | null;

  @Attr(null)
  declare swabTestId: string | null;

  @Attr(null)
  declare productId: string | null;

  @Attr(null)
  declare productDate: string | null;

  @Attr(null)
  declare productLot: string | null;

  @Attr(null)
  declare facilityItemId: string | null;

  @Attr([])
  declare swabAreaHistoryImageIds: string[];

  @BelongsTo(() => SwabArea, "swabAreaId")
  declare swabArea: SwabArea;

  @BelongsTo(() => SwabPeriod, "swabPeriodId")
  declare swabPeriod: SwabPeriod;

  @BelongsTo(() => SwabTest, "swabTestId")
  declare swabTest: SwabTest;

  @BelongsToMany(
    () => SwabEnvironment,
    () => SwabAreaHistoryEnvironment,
    "swabAreaHistoryId",
    "swabEnvironmentId"
  )
  declare swabEnvironments: SwabEnvironment[];

  @HasManyBy(
    () => SwabAreaHistoryImage,
    "swabAreaHistoryImageIds",
    "swabAreaHistoryId"
  )
  declare swabAreaHistoryImages: SwabAreaHistoryImage[];

  @BelongsTo(() => Product, "productId")
  declare product: Product;

  @BelongsTo(() => FacilityItem, "facilityItemId")
  declare facilityItem: FacilityItem;

  get readableSwabAreaDate() {
    return this.swabAreaDate ? formatThLocale(new Date(this.swabAreaDate)) : "";
  }

  get shortSwabAreaDate() {
    return this.swabAreaDate
      ? formatThLocale(new Date(this.swabAreaDate), "ddMMyy")
      : "";
  }

  get readableSwabAreaTime() {
    return this.swabAreaSwabedAt
      ? formatTimeThLocale(this.swabAreaSwabedAt)
      : "";
  }

  get swabTestCode() {
    const swapTestRepo = useRepo(SwabTest);

    const relatedSwabTest = swapTestRepo.find(this.swabTestId);

    return relatedSwabTest ? relatedSwabTest.swabTestCode : null;
  }

  get isCompleted() {
    let isCompleted = true;

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

    console.log(this.id, isCompleted);

    return isCompleted;
  }
}
