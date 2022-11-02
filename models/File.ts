import { Model } from "pinia-orm";
import {
  Attr,
  Num,
  Str,
  Uid,
  BelongsTo
} from "pinia-orm/dist/decorators";
import User from "./User";

export default class File extends Model {
  static entity = "file";

    @Uid()
    declare id: string;

    @Str("")
    declare fileKey: string;

    @Str("")
    declare fileName: string;

    @Str("")
    declare fileSource: string;

    @Str("")
    declare fileContentType: string;

    @Num(0)
    declare fileSize: number;

    @Attr(null)
    declare userId: string | null;

    @BelongsTo(() => User, "userId")
    declare user: User;
}
