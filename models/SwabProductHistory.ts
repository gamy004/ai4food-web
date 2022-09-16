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
import SwabPeriod from "./SwabPeriod";
import SwabTest from "./SwabTest";

const { formatThLocale, formatTimeThLocale } = useDate();

export default class SwabProductHistory extends Model {
  static entity = "swab_product_history";

  @Uid()
  id!: string | null;

  @Str("")
  swabProductDate!: string;

  @Attr(null)
  shift!: Shift;

  @Attr(null)
  swabProductSwabedAt!: string;

  @Attr(null)
  swabProductNote!: string;

  @Attr(null)
  productDate!: string;

  @Attr(null)
  productLot!: string;

  @Attr(null)
  productId!: string;

  @BelongsTo(() => Product, "productId")
  product!: Product;

  @Attr(null)
  swabPeriodId!: string;

  @BelongsTo(() => SwabPeriod, "swabPeriodId")
  swabPeriod!: SwabPeriod;

  @Attr(null)
  swabTestId!: string;

  @BelongsTo(() => SwabTest, "swabTestId")
  swabTest!: SwabTest;

  @Attr(null)
  facilityItemId!: string;

  @BelongsTo(() => FacilityItem, "facilityItemId")
  facilityItem!: FacilityItem;

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

  get readableProductDate() {
    return this.productDate ? formatThLocale(new Date(this.productDate)) : "";
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
