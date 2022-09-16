import { Model, Attr, Uid, BelongsTo, Str } from "pinia-orm";
import SwabTest from "./SwabTest";
import SwabArea from "./SwabArea";
import SwabPeriod from "./SwabPeriod";

export default class LabTest extends Model {
  static entity = "lab_test";

  @Uid()
  id!: string | null;

  @Str("")
  swabAreaDate!: string;

  @Str("")
  swabAreaSwabedAt!: string;

  @Attr(null)
  swabTestId!: number;

  @Attr(null)
  swabTest!: SwabTest;

  @Attr(null)
  swabArea!: SwabArea;

  @Attr(null)
  swabPeriod!: SwabPeriod;
}
