import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PlayerStepRespMsg, SocketRespMsg } from '../../models/sea-battle-socket-resp-types';
import { SOCKET_RESP_TYPE, STEP_RESULT } from '../../constants/socket-constants';

@Component({
    selector: 'app-sea-battle-chat-message',
    templateUrl: './sea-battle-chat-message.component.html',
    styleUrl: './sea-battle-chat-message.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleChatMessageComponent {
    @Input({ required: true }) message!: SocketRespMsg;

    public getIconPath(): string {
        switch (this.message.action_type) {
            case SOCKET_RESP_TYPE.CONNECT_PLAYER:
                return '../../../../../../../assets/seabattle-icons/connect.jpg';
            case SOCKET_RESP_TYPE.DISCONNECT_PLAYER:
                return '../../../../../../../assets/seabattle-icons/disconnect.webp';
            case SOCKET_RESP_TYPE.SET_PLAYER_POSITIONS:
                return '../../../../../../../assets/seabattle-icons/set-positions.png';
            case SOCKET_RESP_TYPE.WIN_GAME:
                return '../../../../../../../assets/seabattle-icons/cup.png';
            case SOCKET_RESP_TYPE.STEP:
                const stepMsg = this.message as PlayerStepRespMsg;
                if (stepMsg.data.step_result === STEP_RESULT.ALREADY_CHECKED) {
                    return '../../../../../../../assets/seabattle-icons/clown.png';
                } else if (stepMsg.data.step_result === STEP_RESULT.HIT) {
                    return '../../../../../../../assets/seabattle-icons/hit.png';
                } else if (stepMsg.data.step_result === STEP_RESULT.KILL) {
                    return '../../../../../../../assets/seabattle-icons/burst.png';
                } else {
                    return '../../../../../../../assets/seabattle-icons/puff.png';
                }
            case SOCKET_RESP_TYPE.READY:
                return '../../../../../../../assets/seabattle-icons/ready.png';
            case SOCKET_RESP_TYPE.START_GAME:
                return '../../../../../../../assets/seabattle-icons/ready.png';
            case SOCKET_RESP_TYPE.ERROR:
            default:
                return '../../../../../../../assets/seabattle-icons/error.png';
        }
    }
}
