import { Model } from "pinia-orm";
import { Attr, Str, Uid, BelongsTo } from "pinia-orm/dist/decorators";
import Room from "./Room";

export default class CleaningRoomHistory extends Model {
    static entity = "cleaning_room_history";

    @Uid()
    declare id: string;

    @BelongsTo(() => Room, 'id')
    declare roomId: Room;

    @Str("")
    declare cleaningDate: string;

    @Attr(null)
    declare cleaningStartedAt: string;
  
    @Attr(null)
    declare cleaningEndAt: string;

    @Attr(null)
    declare importTransactionId: string;
}