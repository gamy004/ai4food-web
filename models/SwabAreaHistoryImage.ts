import { Model, Str, Uid, Attr, BelongsTo } from "pinia-orm";
import File from "./File";
import SwabAreaHistory from "./SwabAreaHistory";

export default class SwabAreaHistoryImage extends Model {
  static entity = "swab_area_history_image";

    @Uid()
      id!: string | null;

    @Attr(null)
      swabAreaHistoryImageDescription?: string;

    @Attr(null)
      swabAreaHistoryId: string;

    @BelongsTo(() => SwabAreaHistory, "swabAreaHistoryId")
      swabArea!: SwabAreaHistory;

    @Attr(null)
      fileId: string;

    @BelongsTo(() => File, "fileId")
      file!: File;
}
