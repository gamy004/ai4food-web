import { Model } from "pinia-orm";
import {
  Str,
  Uid,
  BelongsToMany
} from "pinia-orm/dist/decorators";
import SwabAreaHistory from "./SwabAreaHistory";
import SwabAreaHistoryEnvironment from "./SwabAreaHistoryEnvironment";

export default class SwabEnvironment extends Model {
  static entity = "swab_environment";

    @Uid()
    declare id: string;

    @Str("")
    declare swabEnvironmentName: string;

    @BelongsToMany(() => SwabAreaHistory, () => SwabAreaHistoryEnvironment, "swabEnvironmentId", "swabAreaHistoryId")
    declare swabAreaHistories: SwabAreaHistory[];
}
