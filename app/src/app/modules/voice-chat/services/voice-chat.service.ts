import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HostPeer } from '../entities/host-peer';
import { GuestPeer } from '../entities/guest-peer';
import { Peer } from '../entities/peer';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { CreateRoomReqBody } from '../models/http-models-to-server';
import { CreateRoomRespBody } from '../models/http-models-from-server';

/**
 * Когда получаю сообщение CONNECT с контентом ConnectionDataToClient нужно:
 * 1. Добавить новый RTCPeerConnection в массив peerConnections
 * 2. Добавить подписки на получение localDescription и remoteDesriprition
 */

@Injectable()
export class VoiceChatService {
    private peerConnections: RTCPeerConnection[] = [];

    private peer: Peer | null = null;

    public username: string = '';

    public roomId: string = '';

    constructor(
        private readonly httpClient: HttpClient,
        private readonly sintolModalSrv: SintolLibDynamicComponentService
    ) {}

    public async createVoiceRoom(socketUrl: string): Promise<void> {
        this.username = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input your name.'
        });
        const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room name.'
        });

        const createRoomReqBody: CreateRoomReqBody = {
            host_name: this.username,
            max_peers: 10,
            room_name: roomName
        };
        const resp = await firstValueFrom(
            this.httpClient.post<CreateRoomRespBody>(`${ENVIRONMENT.apiBaseUrl}/voicechat/create`, createRoomReqBody)
        );
        this.roomId = resp.room_id;

        const peer = new HostPeer({
            me: true,
            userName: this.username,
            signalingClientParams: {
                onConnect: undefined,
                onMessage: undefined
            }
        });
        this.peer = peer;
        this.peer.connect(socketUrl, this.roomId, this.username);
    }

    public async connectToRoom(socketUrl: string): Promise<void> {
        this.username = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input your name.'
        });
        this.roomId = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room id.'
        });

        const peer = new GuestPeer({
            me: true,
            userName: this.username,
            signalingClientParams: {
                onConnect: undefined,
                onMessage: undefined
            }
        });
        this.peer = peer;
        this.peer.connect(socketUrl, this.roomId, this.username);
    }

    public leaveRoom(): void {
        this.peer?.disconnect();
        this.peer = null;
        this.peerConnections = [];
    }
}
