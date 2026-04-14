import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomFromServer } from '../../models/http-models-from-server';
import { BehaviorSubject, combineLatest, filter, map, Observable, startWith, switchMap, tap } from 'rxjs';
import { VoiceChatRoomService } from '../../services/voice-chat-room.service';
import { VoicechatRooom } from '../../models/client-room';
import { serverRoomToUiRoom } from '../../utils/converters';

@Component({
    selector: 'app-voice-room-page',
    templateUrl: './voice-room-page.component.html',
    styleUrl: './voice-room-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoiceRoomPageComponent implements OnInit, OnDestroy {
    private readonly _initialRoomInfo$ = new BehaviorSubject<RoomFromServer | null>(null);

    public readonly roomInfo$: Observable<VoicechatRooom> = this._initialRoomInfo$.pipe(
        filter((roomInfo) => !!roomInfo),
        switchMap((roomInfo) =>
            combineLatest([this.voicechatRoomSrv.users$, this.voicechatRoomSrv.me$]).pipe(
                tap((r) => console.log('ROOM_INFO$', r)),
                filter(([_, me]) => !!me),
                map(([users, me]) => {
                    const uiRoom = serverRoomToUiRoom(roomInfo, me!, users);
                    return uiRoom;
                })
            )
        ),
        startWith({
            host_name: '',
            id: '',
            max_users: 1,
            name: '',
            users: [],
            me: { id: '228', is_host: false, name: 'sintol' }
        } as VoicechatRooom)
    );

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly voicechatRoomSrv: VoiceChatRoomService,
        private readonly router: Router
    ) {}

    ngOnInit() {
        const resolved = this.activatedRoute.snapshot.data as { roomInfo: RoomFromServer };
        this._initialRoomInfo$.next(resolved.roomInfo);
    }

    ngOnDestroy(): void {
        this.disconnect();
    }

    public disconnect(): void {
        this.voicechatRoomSrv.disconnect();
        this.router.navigate(['/voicechat']);
    }

    public muteMyself(): void {
        console.log('[muteMyself] called');
    }

    public muteParticipant(): void {
        console.log('[muteParticipant] called');
    }
}
