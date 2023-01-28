import { Model, useRepo } from "pinia-orm";
import { Attr, Str, Uid, BelongsTo } from "pinia-orm/dist/decorators";
import { useDate, Shift } from "~~/composables/useDate";
import { SwabStatus, SwabStatusMapper } from "~~/composables/useSwab";
import FacilityItem from "./FacilityItem";
import Product from "./Product";
import SwabPeriod from "./SwabPeriod";
import SwabTest from "./SwabTest";

const { formatThLocale, formatTimeThLocale } = useDate();

export default class SwabProductHistory extends Model {
  static entity = "swab_product_history";

  @Uid()
  declare id: string;

  @Str("")
  declare swabProductDate: string;

  @Attr(null)
  declare shift: Shift | null;

  @Attr(null)
  declare swabProductSwabedAt: string | null;

  @Attr(null)
  declare swabProductNote: string | null;

  @Attr(null)
  declare productDate: string | null;

  @Attr(null)
  declare productLot: string | null;

  @Attr(null)
  declare productId: string | null;

  @BelongsTo(() => Product, "productId")
  declare product: Product;

  @Attr(null)
  declare swabPeriodId: string | null;

  @BelongsTo(() => SwabPeriod, "swabPeriodId")
  declare swabPeriod: SwabPeriod;

  @Attr(null)
  declare swabTestId: string | null;

  @BelongsTo(() => SwabTest, "swabTestId")
  declare swabTest: SwabTest;

  @Attr(null)
  declare facilityItemId: string | null;

  @BelongsTo(() => FacilityItem, "facilityItemId")
  declare facilityItem: FacilityItem;

  get readableSwabProductDate() {
    return this.swabProductDate
      ? formatThLocale(new Date(this.swabProductDate))
      : "";
  }

  get readableSwabProductTime() {
    return this.swabProductSwabedAt
      ? formatTimeThLocale(this.swabProductSwabedAt)
      : "";
  }

  get shortProductDate() {
    return this.productDate
      ? formatThLocale(new Date(this.productDate), "ddMMyy")
      : "";
  }

  get readableProductDate() {
    return this.productDate ? formatThLocale(new Date(this.productDate)) : "";
  }

  get swabStatus(): SwabStatus {
    let status = SwabStatus.NOT_RECORDED;

    if (this.isRecorded) {
      const swapTestRepo = useRepo(SwabTest);

      const relatedSwabTest = swapTestRepo.find(this.swabTestId);

      status = relatedSwabTest.swabStatus;
    }

    return status;
  }

  get status(): SwabStatusMapper {
    return SwabStatusMapper[this.swabStatus];
  }

  get isRecorded() {
    return this.swabProductSwabedAt !== null;
  }

  get isCompleted() {
    return (
      this.swabProductDate !== null &&
      this.swabProductSwabedAt !== null &&
      this.facilityItemId !== null &&
      this.productDate !== null &&
      this.productId !== null &&
      this.productLot !== null
    );
  }
}
