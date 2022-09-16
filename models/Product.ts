import { Attr, HasManyBy, Model, Str, Uid } from "pinia-orm";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabProductHistory from "./SwabProductHistory";

export default class Product extends Model {
  static entity = "product";

  @Uid()
  id!: string | null;

  @Str("")
  productCode!: string;

  @Str("")
  alternateProductCode!: string;

  @Str("")
  productName!: string;

  @Attr([])
  swabAreaHistoryIds!: string[];

  @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "productId")
  swabAreaHistories!: SwabAreaHistory[];

  @Attr([])
  swabProductHistoryIds!: string[];

  @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "productId")
  swabProductHistories!: SwabProductHistory[];
}
