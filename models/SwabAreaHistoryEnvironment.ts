import { Model, Uid } from "pinia-orm";

export default class SwabAreaHistoryEnvironment extends Model {
  static entity = "swab_area_history_environment";

  static primaryKey = ["swabAreaHistoryId", "swabEnvironmentId"];

    @Uid()
      swabAreaHistoryId!: string;

    @Uid()
      swabEnvironmentId!: string;
}
