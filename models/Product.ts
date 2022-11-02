import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
  HasManyBy
} from "pinia-orm/dist/decorators";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabProductHistory from "./SwabProductHistory";

export default class Product extends Model {
  static entity = "product";

  @Uid()
  declare id: string;

  @Str("")
  declare productCode: string;

  @Str("")
  declare alternateProductCode: string;

  @Str("")
  declare productName: string;

  @Attr([])
  declare swabAreaHistoryIds: string[];

  @HasManyBy(() => SwabAreaHistory, "swabAreaHistoryIds", "productId")
  declare swabAreaHistories: SwabAreaHistory[];

  @Attr([])
  declare swabProductHistoryIds: string[];

  @HasManyBy(() => SwabProductHistory, "swabProductHistoryIds", "productId")
  declare swabProductHistories: SwabProductHistory[];
}
