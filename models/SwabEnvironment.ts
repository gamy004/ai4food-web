import { BelongsToMany, Model, Str, Uid } from "pinia-orm";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabAreaHistoryEnvironment from "./SwabAreaHistoryEnvironment";

export default class SwabEnvironment extends Model {
  static entity = "swab_environment";

    @Uid()
      id!: string | null;

    @Str("")
      swabEnvironmentName!: string;

    @BelongsToMany(() => SwabAreaHistory, () => SwabAreaHistoryEnvironment, "swabEnvironmentId", "swabAreaHistoryId")
      swabAreaHistories!: SwabAreaHistory[];
}
