import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoiceChatRoomsService } from '../../services/voice-chat-rooms.service';
import { VoiceChatRoomService } from '../../services/voice-chat-room.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-voicechat-main-page',
    templateUrl: './voicechat-main-page.component.html',
    styleUrl: './voicechat-main-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoicechatMainPageComponent {
    public readonly rooms$ = this.roomsSrv.rooms$;

    constructor(
        private readonly roomsSrv: VoiceChatRoomsService,
        private readonly roomSrv: VoiceChatRoomService,
        private readonly router: Router
    ) {}

    protected async createRoom(): Promise<void> {
        const success = await this.roomSrv.createVoiceRoom();
        if (success) {
            this.router.navigateByUrl('/voicechat/room/' + this.roomSrv.roomId);
        }
    }
}
