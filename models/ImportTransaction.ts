import { Model } from "pinia-orm";
import { Attr, Str, Uid, BelongsTo } from "pinia-orm/dist/decorators";
import User from "./User";
import File from "./File";

const { formatThLocale } = useDate();

export enum ImportSource {
  WEB = "web",
  OPERATOR = "operator",
}

export enum ImportType {
  PRODUCT_SCHEDULE = "product_schedule",
  CLEANING_PLAN = "cleaning_plan",
  CLEANING_ROOM_HISTORY = "cleaning_room_history",
  SWAB_TEST = "swab_test",
}

export enum ImportStatus {
  Pending = "pending",
  Success = "success",
  Cancel = "cancel",
}

export default class ImportTransaction extends Model {
  static entity = "import_transaction";

  @Uid()
  declare id: string;

  @Str(ImportSource.WEB)
  declare importSource: ImportSource;

  @Str("")
  declare importType: ImportType;

  @Str(ImportStatus.Pending)
  declare importStatus: ImportStatus;

  @Attr(null)
  declare importedFileId: string | null;

  @BelongsTo(() => File, "importedFileId")
  declare importedFile: File;

  @Attr(null)
  declare importedUserId: string | null;

  @BelongsTo(() => User, "importedUserId")
  declare importedUser: User;

  @Attr(null)
  declare createdAt: string | null;

  @Attr(null)
  declare updatedAt: string | null;

  get readableCreatedAtTime() {
    return this.createdAt ? formatThLocale(this.createdAt, "PP HH:mm น.") : "";
  }

  get readableUpdatedAtTime() {
    return this.updatedAt ? formatThLocale(this.updatedAt, "PP HH:mm น.") : "";
  }

  get isCompleted() {
    return this.importStatus === ImportStatus.Success;
  }
}
