import { Model } from "pinia-orm";
import { Attr, Str, Uid, BelongsTo } from "pinia-orm/dist/decorators";
import CleaningProgram from "./CleaningProgram";
import SwabAreaHistory from "./SwabAreaHistory";

export default class CleaningHistory extends Model {
  static entity = "cleaning_history";

  @Uid()
  declare id: string;

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

  @Attr(null)
  declare swabAreaHistoryId: string | null;

  @BelongsTo(() => SwabAreaHistory, "swabAreaHistoryId")
  declare swabAreaHistory: SwabAreaHistory;

  get isCompleted() {
    let isCompleted = true;

    return isCompleted;
  }
}
