import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, firstValueFrom, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';
import { VoiceChatRoomService } from '../../services/voice-chat-room.service';
import { VoicechatRooom } from '../../models/client-room';
import { serverRoomToUiRoom } from '../../utils/converters';
import { VoiceChatRoomsService } from '../../services/voice-chat-rooms.service';

const defaultRoomInfo: VoicechatRooom = {
    host_name: '',
    id: '',
    max_users: 1,
    name: '',
    users: [],
    me: { id: '228', is_host: false, name: 'sintol', muted: true }
};

@Component({
    selector: 'app-voice-room-page',
    templateUrl: './voice-room-page.component.html',
    styleUrl: './voice-room-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoiceRoomPageComponent implements OnInit, OnDestroy {
    private readonly updateUI$ = this.voicechatRoomSrv.updateUI$;

    public readonly roomInfo$: Observable<VoicechatRooom> = this.updateUI$.pipe(
        switchMap(() => this.voiceChatRoomsSrv.rooms$),
        switchMap((rooms) => forkJoin([of(rooms), firstValueFrom(this.activatedRoute.paramMap)])),
        map(([rooms, paramMap]) => rooms.find((room) => room.id === paramMap.get('id'))),
        filter((roomInfo) => !!roomInfo),
        switchMap((roomInfo) =>
            combineLatest([this.voicechatRoomSrv.users$, this.voicechatRoomSrv.me$]).pipe(
                filter(([_, me]) => !!me),
                map(([users, me]) => {
                    const uiRoom = serverRoomToUiRoom(roomInfo, me!, users);
                    console.log('uiRoom$', uiRoom);
                    return uiRoom;
                })
            )
        ),
        startWith(defaultRoomInfo)
    );

    private readonly _videoEnabled$ = new BehaviorSubject(true);

    public readonly videoEnabled$ = this._videoEnabled$.asObservable();

    private setVideoEnabled(enabled: boolean): void {
        this._videoEnabled$.next(enabled);
    }

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly voicechatRoomSrv: VoiceChatRoomService,
        private readonly voiceChatRoomsSrv: VoiceChatRoomsService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        if (!this.voicechatRoomSrv.me) {
            this.router.navigate(['/voicechat']);
        }
    }

    ngOnDestroy(): void {
        if (this.voicechatRoomSrv.connected) {
            this.disconnect();
        }
    }

    public disconnect(): void {
        this.voicechatRoomSrv.disconnect();
        this.router.navigate(['/voicechat']);
    }

    public toggleMyVoice(): void {
        if (!this.voicechatRoomSrv.me) return;
        console.log('[VoiceRoomPageComponent_toggleVoice] called');
        const newEnabled = this.voicechatRoomSrv.me.muted;
        this.voicechatRoomSrv.toggleMyMic(newEnabled);
    }

    public toggleMyVideo(): void {
        console.log('[VoiceRoomPageComponent_toggleVideo] called');
        const enabled = this._videoEnabled$.value;
        this.voicechatRoomSrv.mediaStreamManager.toggleYourVideo(!enabled);
        this.setVideoEnabled(!enabled);
    }

    public toggleUserVoice(userId: string): void {
        console.log('[toggleUserVoice] called');
        const user = this.voicechatRoomSrv.users.find((user) => user.userId === userId);
        if (!user) return;

        user.toggleUserMicLocally(user.mutedLocally);
    }
}
