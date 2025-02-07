import { DELAY_BEFORE_STEP } from '../constants/seabattle-consts';
import { ROOM_STATUS, RoomStatus } from '../constants/socket-constants';
import { SeabattleRoom } from './room';

export class SeabattleRoomUtils {
    constructor(private readonly room: SeabattleRoom) {}

    public getUiTextByRoomStatus(roomStatus: RoomStatus, secs?: number): string {
        switch (roomStatus) {
            case ROOM_STATUS.PROCESSING:
                return 'Processing...';
            case ROOM_STATUS.IDLE:
                return 'Waiting for players.';
            case ROOM_STATUS.READY_ENEMY_NEXT_STEP:
            case ROOM_STATUS.READY_YOUR_NEXT_STEP:
                const nextSteppingPlayerEmail = this.room.data.steppingPlayer?.playerEmail;
                return `Waiting for step of ${nextSteppingPlayerEmail}.`;
            case ROOM_STATUS.END:
                return 'Game finished!';
            case ROOM_STATUS.DELAY_BEFORE_NEXT_STEP:
                const delay = (DELAY_BEFORE_STEP - Number(secs) * 1_000) / 1_000;
                return `Waiting for ${delay}...`;
            case ROOM_STATUS.READY_TO_START:
                return `Players ready to start!`;
            default:
                console.log('Unknown_Status ==> ', roomStatus);
                return 'Unknown state!!!';
        }
    }
}
