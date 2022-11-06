import { Model } from "pinia-orm";
import {
  Attr,
  Uid,
  BelongsTo
} from "pinia-orm/dist/decorators";
import File from "./File";
import SwabAreaHistory from "./SwabAreaHistory";

export default class SwabAreaHistoryImage extends Model {
  static entity = "swab_area_history_image";

    @Uid()
    declare id: string;

    @Attr(null)
    declare swabAreaHistoryImageDescription: string | null;

    @Attr(null)
    declare swabAreaHistoryId: string | null;

    @BelongsTo(() => SwabAreaHistory, "swabAreaHistoryId")
    declare swabArea: SwabAreaHistory;

    @Attr(null)
    declare fileId: string | null;

    @BelongsTo(() => File, "fileId")
    declare file: File;
}
