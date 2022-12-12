import { Model } from "pinia-orm";
import { Attr, Uid } from "pinia-orm/dist/decorators";

export default class Room extends Model {
    static entity = "room";

    @Uid()
    declare id: string;

    @Attr(null)
    declare roomName: string;

    @Attr(null)
    declare zoneId: string;
}