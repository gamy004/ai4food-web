import { Model } from "pinia-orm";
import { Attr, Str, Uid, HasManyBy } from "pinia-orm/dist/decorators";
import CleaningHistory from "./CleaningHistory";

export default class CleaningProgram extends Model {
  static entity = "cleaning_program";

  @Uid()
  declare id: string;

  @Str("")
  declare cleaningProgramName: string;

  @Attr(null)
  declare cleaningProgramDescription: string;

  @Attr([])
  declare cleaningHistoryIds: string[];

  @HasManyBy(() => CleaningHistory, "cleaningHistoryIds", "cleaningProgramId")
  declare cleaningHistories: CleaningHistory[];
}
