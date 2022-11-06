import { Model } from "pinia-orm";
import { Uid } from "pinia-orm/dist/decorators";
export default class SwabAreaHistoryEnvironment extends Model {
  static entity = "swab_area_history_environment";

  static primaryKey = ["swabAreaHistoryId", "swabEnvironmentId"];

    @Uid()
    declare swabAreaHistoryId: string;

    @Uid()
    declare swabEnvironmentId: string;
}
