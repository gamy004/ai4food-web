import { Model } from "pinia-orm";
import {
  Attr,
  Str,
  Uid,
} from "pinia-orm/dist/decorators";
import SwabTest from "./SwabTest";
import SwabArea from "./SwabArea";
import SwabPeriod from "./SwabPeriod";

export default class LabTest extends Model {
  static entity = "lab_test";

  @Uid()
  declare id: string;

  @Str("")
  declare swabAreaDate: string;

  @Str("")
  declare swabAreaSwabedAt: string;

  @Attr(null)
  declare swabTestId: number | null;

  @Attr(null)
  declare swabTest: SwabTest | null;

  @Attr(null)
  declare swabArea: SwabArea | null;

  @Attr(null)
  declare swabPeriod: SwabPeriod | null;
}
