import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { GetRoomsListRespBody, RoomFromServer } from '../models/http-models-from-server';
import { Event, NavigationEnd, Router } from '@angular/router';
import { WsGlobalMsgFromServer } from '../models/ws-models-from-server';
import { HttpApiService } from 'src/app/core/api/http-api.service';

@Injectable()
export class VoiceChatRoomsService implements OnDestroy {
    private readonly _rooms$ = new BehaviorSubject<RoomFromServer[]>([]);

    public readonly rooms$ = this._rooms$.asObservable();

    private _socket: WebSocket | null = null;

    public get socket(): WebSocket | null {
        return this.socket;
    }

    constructor(
        private readonly httpApi: HttpApiService,
        private router: Router
    ) {
        this.router.events
            .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.urlAfterRedirects === '/voicechat') {
                    this.init();
                } else {
                    this.shutdown();
                }
            });
    }

    ngOnDestroy(): void {
        console.log('[VoiceChatRoomsService] DESTROYED!');
    }

    ngOnInit(): void {
        console.log('[VoiceChatRoomsService] INIT!');
    }

    private setRooms(rooms: RoomFromServer[]): void {
        this._rooms$.next(rooms);
    }

    private async init(): Promise<void> {
        this._socket = new WebSocket(`${ENVIRONMENT.apiSocketUrl}/voicechat/ws/rooms`);
        this.handleSocketMsg();
        const resp = await this.httpApi
            .get<GetRoomsListRespBody>(`${ENVIRONMENT.apiBaseUrl}/voicechat/rooms`)
            .catch(() => ({ rooms: [] }) as GetRoomsListRespBody);
        this.setRooms(resp.rooms);
    }

    private shutdown(): void {
        console.log('!shutdown');
        this._socket?.close();
        this._socket = null;
    }

    private handleSocketMsg(): void {
        if (!this._socket) return;
        this._socket.onmessage = (e) => {
            const msg: WsGlobalMsgFromServer = JSON.parse(e.data);
            switch (msg.action) {
                case 'ROOM_CREATED':
                    this.setRooms([...this._rooms$.value, msg.data.room]);
                    break;
                case 'ROOM_REMOVED':
                    const filteredRooms = this._rooms$.value.filter((room) => room.id !== msg.data.room.id);
                    this.setRooms(filteredRooms);
                    break;
                case 'USER_JOINED':
                    break;
                case 'USER_LEFT':
                    break;
                default:
                    console.log('[VoiceChatRoomsService_handleSocketMsg] unknown msg ', msg);
            }
        };
    }
}
