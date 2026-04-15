import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, firstValueFrom, forkJoin, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
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
    me: { id: '228', is_host: false, name: 'sintol' }
};

@Component({
    selector: 'app-voice-room-page',
    templateUrl: './voice-room-page.component.html',
    styleUrl: './voice-room-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoiceRoomPageComponent implements OnInit, OnDestroy {
    private readonly _updateState$ = new BehaviorSubject(true);

    private updateState(): void {
        this._updateState$.next(true);
    }

    public readonly roomInfo$: Observable<VoicechatRooom> = this._updateState$.pipe(
        switchMap(() => this.voiceChatRoomsSrv.rooms$),
        switchMap((rooms) => forkJoin([of(rooms), firstValueFrom(this.activatedRoute.paramMap)])),
        map(([rooms, paramMap]) => rooms.find((room) => room.id === paramMap.get('id'))),
        filter((roomInfo) => !!roomInfo),
        switchMap((roomInfo) =>
            combineLatest([this.voicechatRoomSrv.users$, this.voicechatRoomSrv.me$]).pipe(
                tap((users_me) => console.log('ROOM_INFO$', { users_me, roomInfo })),
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

    private readonly _audioEnabled$ = new BehaviorSubject(true);

    public readonly audioEnabled$ = this._audioEnabled$.asObservable();

    private setAudioEnabled(enabled: boolean): void {
        this._audioEnabled$.next(enabled);
    }

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

    ngOnInit() {
        // const resolved = this.activatedRoute.snapshot.data as { roomInfo: RoomFromServer };
        // this._initialRoomInfo$.next(resolved.roomInfo);
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
        console.log('[VoiceRoomPageComponent_toggleVoice] called');
        const enabled = this._audioEnabled$.value;
        this.voicechatRoomSrv.mediaStreamManager.toggleYourVoice(!enabled);
        this.setAudioEnabled(!enabled);
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

        user.toggleUserVoice(user.muted);
        this.updateState();
    }
}
