import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { RoomFromServer } from '../../models/http-models-from-server';
import { VoiceChatRoomService } from '../../services/voice-chat-room.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-voice-rooms-list',
    templateUrl: './voice-rooms-list.component.html',
    styleUrl: './voice-rooms-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoiceRoomsListComponent {
    @Input() set rooms(value: RoomFromServer[] | null) {
        this._rooms = value ?? [];
    }
    get rooms(): RoomFromServer[] {
        return this._rooms;
    }
    private _rooms: RoomFromServer[] = [];

    protected copiedRoomId: string | null = null;

    private copyTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(
        private readonly cdr: ChangeDetectorRef,
        private readonly roomSrv: VoiceChatRoomService,
        private readonly router: Router
    ) {}

    protected copyRoomId(roomId: string, event: Event): void {
        event.stopPropagation();
        navigator.clipboard.writeText(roomId).then(() => {
            this.copiedRoomId = roomId;
            this.cdr.markForCheck();

            if (this.copyTimeout) {
                clearTimeout(this.copyTimeout);
            }

            this.copyTimeout = setTimeout(() => {
                this.copiedRoomId = null;
                this.copyTimeout = null;
                this.cdr.markForCheck();
            }, 500);
        });
    }

    protected trackByRoomId(_index: number, room: RoomFromServer): string {
        return room.id;
    }

    public async connectToRoom(roomId: string): Promise<void> {
        await this.roomSrv.connectToVoiceRoom(roomId);
        this.router.navigateByUrl('/voicechat/room/' + roomId);
        console.log('[connectToRoom] connected to room:', this.roomSrv.roomId);
    }
}
