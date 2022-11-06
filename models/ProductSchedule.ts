import { Model } from "pinia-orm";
import { Attr, Str, Uid, BelongsTo, Num } from "pinia-orm/dist/decorators";
import Product from "./Product";

export default class ProductSchedule extends Model {
  static entity = "product_schedule";

  @Uid()
  declare id: string | null;

  @Num(0)
  declare productScheduleAmount: number;

  @Str("")
  declare productScheduleDate: string;

  @Attr(null)
  declare productScheduleStartedAt: string | null;

  @Attr(null)
  declare productScheduleEndedAt: string | null;

  @Attr(null)
  declare productId: string | null;

  @BelongsTo(() => Product, "productId")
  declare product: Product;

  @Attr(null)
  declare importTransactionId: string | null;

  @Attr(null)
  declare createdAt: string | null;

  @Attr(null)
  declare updatedAt: string | null;

  // @BelongsTo(() => Product, "importTransactionId")
  // declare importTransaction: ImportTransaction;
}
