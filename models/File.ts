import { Model, Str, Uid, Attr, BelongsTo, Num } from "pinia-orm";
import User from "./User";

export default class File extends Model {
  static entity = "file";

    @Uid()
      id!: string | null;

    @Str("")
      fileKey!: string;

    @Str("")
      fileName!: string;

    @Str("")
      fileSource!: string;

    @Str("")
      fileContentType!: string;

    @Num(0)
      fileSize!: number;

    @Attr(null)
      userId: string;

    @BelongsTo(() => User, "userId")
      user: User;
}
