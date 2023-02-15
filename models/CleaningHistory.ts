import { Model } from "pinia-orm";
import { Attr, Str, Uid, BelongsTo } from "pinia-orm/dist/decorators";
import CleaningProgram from "./CleaningProgram";

export default class CleaningHistory extends Model {
  static entity = "cleaning_history";

  @Uid()
  declare id: string;

  @Str("")
  declare cleaningDate: string;

  @Attr(null)
  declare cleaningHistoryStartedAt: string;

  @Attr(null)
  declare cleaningHistoryEndAt: string;

  @BelongsTo(() => CleaningProgram, "id")
  declare cleaningProgramId: string;

  @Attr(null)
  declare recordedUserId: string;

  @Attr(null)
  declare swabRoundId: string;
}
