import { Injectable } from '@angular/core';
import { SignalingClient } from '../entities/signaling-client';
import { VoicechatUser } from '../entities/voicechat-user';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { UserFromServer } from '../models/http-models-from-server';
import { ENVIRONMENT } from 'src/environments/environment';
import { CreateRoomReqBody } from '../models/http-models-to-server';
import { BehaviorSubject } from 'rxjs';
import {
    WsAnswerMsgFromServer,
    WsMsgFromServer,
    WsOfferMsgFromServer,
    WsUserConnectedMsgFromServer,
    WsUserDisconnectedMsgFromServer,
    WsYouConnectedMsgFromServer
} from '../models/ws-models-from-server';
import { WsConnectMsgToServer, WsDisconnectMsgToServer, WsOfferMsgToServer } from '../models/ws-models-to-server';
import { RTC_CONFIG } from '../constants/ice-servers';
import { VoiceChatApiService } from './voice-chat-api.service';
import { MediaStreamManager } from '../entities/media-stream-manager';
import { AlertsService } from 'src/app/shared/services/alerts.service';

/**
 * 1. CONNECT:
 * - на клиенте-отправителе отправляем ивент CONNECT c user_name
 * - на сервере создаем NewUser(username, isHost, room_id) и
 *    а) подключившемуся юзеру отправляем ивент YOU_CONNECTED c models.VoiceRoom
 *    б) остальным юзерам отправляем ивент USER_CONNECTED с connected_user(уже содержит uer_id)
 *       и создаем новый инстэнс User в списке users(lля каждого пользователя будет свой RTCPeerConnection и RTCChannel)
 * - на клиенте-получател:
 *    а) если получаем ON_CONNECTION(текущий юзер) - то рассылаем оферы
 *    б) на клиенте USER_CONNECTED(остальные) - добавляем пользователя в массив users
 *
 * 2. DISCONNECT:
 * - на клиенте отправляем DISCONNECT с user_name, user_id и дисконнектим локально signalingClient
 *   и очищаем всех юзеров, удаляем все подписки и покидаем комнату
 * - на сервере удаляем по user_id из слайса users
 *   и отправляем всем клиентам ивент USER_DISCONNECTED с user_name, user_id
 *
 * 3. OFFER:
 * - на клиенте-отправителе, который отправил ивент CONNECT после получения обратного сообщения от сервера с models.VoiceRoom,
 *   создаем new RTCPeerConnection(), делаем createOffer, создаем RTCChannel, выставляем setLocalDescription,
 *   отправляем для каждого user_id ивент OFFER с offering_user_id, offering_user_descriptor, target_user_id
 * - на сервере по target_user_id ищем в OnOfferCommand получателя оффера и
 *   отправляем ему ивент INCOMING_OFFER с offering_user_id, offering_user_descriptor
 *
 *   на клиенте INCOMING_OFFER:
 *   на клиенте-получателе создаем new RTCPeerConnection(), выставляем setRemoteDescription, делаем подписки,
 *   вызываем createAnswer(), выставляем setLocalDescription,
 *   и отправляем ивент ANSWER с answering_user_id, answering_user_descriptor, target_user_id
 *
 * 4. INCOMING_ANSWER:
 * - на клиенте-получателе находим нужный peer по answering_user_id, выставляем setRemoteDescription
 * - на сервере находим нужного user по target_user_id
 *   и отправляем ему answering_user_id, answering_user_descriptor, target_user_id
 */

@Injectable()
export class VoiceChatRoomService {
    private readonly _updateUI$ = new BehaviorSubject(true);

    public readonly updateUI$ = this._updateUI$.asObservable();

    private triggerUpdateUI(): void {
        this._updateUI$.next(true);
    }

    private _roomId: string = '';

    public get roomId(): string {
        return this._roomId;
    }

    private readonly _users$ = new BehaviorSubject<VoicechatUser[]>([]);

    public readonly users$ = this._users$.asObservable();

    public get users(): VoicechatUser[] {
        return this._users$.value;
    }

    private setUsers(users: VoicechatUser[]): void {
        this._users$.next(users);
    }

    private readonly _me$ = new BehaviorSubject<UserFromServer | null>(null);

    public readonly me$ = this._me$.asObservable();

    public get me(): UserFromServer | null {
        return this._me$.value;
    }

    private setMe(me: UserFromServer | null): void {
        this._me$.next(me);
    }

    public get connected(): boolean {
        return !!this.me?.id;
    }

    // ── Private state ───────────────────────────────────────────────
    /** One SignalingClient (WebSocket wrapper) shared by all peer connections. */
    public signalingClient: SignalingClient = new SignalingClient({
        onConnect: () => this.onSocketConnected(),
        onMessage: (msg) => this.onSocketMessage(msg)
    });

    public readonly mediaStreamManager: MediaStreamManager = new MediaStreamManager();

    constructor(
        private readonly voicechatApi: VoiceChatApiService,
        private readonly sintolModalSrv: SintolLibDynamicComponentService,
        private readonly alertsService: AlertsService
    ) {}

    public disconnect(): void {
        const disconnectMsg: WsDisconnectMsgToServer = {
            action: 'DISCONNECT',
            data: {
                disconnected_user_name: this.me!.name,
                disconnected_user_id: this.me!.id
            }
        };
        this.signalingClient.sendMsg(JSON.stringify(disconnectMsg));
        this.signalingClient.disconnect();
        this.users.forEach((user) => user.disconnect());
        this.mediaStreamManager.stopMediaStream();
        this.setUsers([]);
        this.setMe(null);
        this._roomId = '';
    }

    public async createVoiceRoom(): Promise<void> {
        const userName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input your name.'
        });
        const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room name.'
        });

        const createRoomReqBody: CreateRoomReqBody = {
            host_name: userName,
            max_users: 20,
            room_name: roomName
        };

        const resp = await this.voicechatApi.createRoom(createRoomReqBody);
        this._roomId = resp.created_room.room_id;
        this.setMe({ id: '', is_host: true, name: userName });

        const socketUrl = `${ENVIRONMENT.apiSocketUrl}/voicechat/ws/connect?room_id=${this.roomId}&user_name=${userName}`;
        this.signalingClient.connect(socketUrl);
    }

    /**
     * @returns success
     */
    public async connectToVoiceRoom(roomId: string): Promise<boolean> {
        try {
            const userName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
                title: 'Modal',
                text: 'Input your name.'
            });
            const roomInfo = await this.voicechatApi.fetchRoomById(roomId);
            const nameTaken = (roomInfo.room?.users || []).find((user) => user.name.toLowerCase() === userName.toLowerCase());
            if (nameTaken) {
                this.alertsService.showAlert({ text: `Username "${userName}" already taken. Choose another one.`, type: 'warn' });
                return false;
            }

            this.setMe({ id: '', is_host: false, name: userName });
            this._roomId = roomId;

            const socketUrl = `${ENVIRONMENT.apiSocketUrl}/voicechat/ws/connect?room_id=${this.roomId}&user_name=${userName}`;
            this.signalingClient.connect(socketUrl);
            return true;
        } catch (err) {
            this.alertsService.showAlert({ text: `Error happened trying to connect. ${err}`, type: 'error' });
            return false;
        }
    }

    private onSocketConnected(): void {
        if (!this.me) {
            throw new Error('[VoiceChatRoomService_onSocketConnected] me is undefined');
        }
        const msg: WsConnectMsgToServer = {
            action: 'CONNECT',
            data: {
                room_id: this.roomId,
                connected_user_name: this.me.name
            }
        };
        this.signalingClient.sendMsg(JSON.stringify(msg));
    }

    private onSocketMessage(msg: { data: string }): void {
        let parsed: WsMsgFromServer;
        try {
            parsed = JSON.parse(msg.data) as WsMsgFromServer;
            console.log('[VoiceChatService] WS ←', parsed.action, parsed);
        } catch (err) {
            console.error('[VoiceChatService] Failed to parse WS message:', err);
            return;
        }

        switch (parsed.action) {
            case 'YOU_CONNECTED':
                this.handleYouConnected(parsed);
                break;
            case 'USER_CONNECTED':
                this.handleUserConnected(parsed);
                break;
            case 'USER_DISCONNECTED':
                this.handleUserDisconnected(parsed);
                break;
            case 'INCOMING_OFFER':
                this.handleOffer(parsed);
                break;
            case 'INCOMING_ANSWER':
                this.handleAnswer(parsed);
                break;
            default:
                console.log('[VoiceChatService_onSocketMessage] Unknown WS action:', (parsed as any).action);
        }
    }

    private async handleYouConnected(msg: WsYouConnectedMsgFromServer): Promise<void> {
        if (!this.me) {
            throw new Error('[VoiceChatRoomService_handleYouConnected] me is undefined');
        }
        const apiUsers = msg.data.room.users;
        const users = apiUsers
            .filter((user) => user.name !== this.me!.name)
            .map(
                (user) =>
                    new VoicechatUser(
                        {
                            userId: user.id,
                            userName: user.name,
                            isHost: user.is_host,
                            pc: new RTCPeerConnection(RTC_CONFIG)
                        },
                        this.triggerUpdateUI.bind(this)
                    )
            );
        this.setUsers(users);

        const me = apiUsers.find((user) => user.name === this.me!.name);
        if (!me) return;
        this.setMe(me);
        await this.mediaStreamManager.startMediaStream();

        console.log('[VoiceChatService_handleYouConnected] me', me);
        if (!users.length) return;

        for (const user of users) {
            await user.sendOffer(this.signalingClient, this.mediaStreamManager, me.id, {
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });
        }
    }

    private handleUserConnected(msg: WsUserConnectedMsgFromServer): void {
        const connectedUser = msg.data;
        const user = new VoicechatUser(
            {
                userId: connectedUser.connected_user_id,
                userName: connectedUser.connected_user_name,
                isHost: false,
                pc: new RTCPeerConnection(RTC_CONFIG)
            },
            this.triggerUpdateUI.bind(this)
        );
        this.setUsers([...this.users, user]);
    }

    private handleUserDisconnected(msg: WsUserDisconnectedMsgFromServer): void {
        const disconnectedData = msg.data;
        const user = this.users.find((u) => u.userId === disconnectedData.disconnected_user_id);
        if (!user) return;

        user.audioElement?.pause();
        user.dataChannel?.close();
        user.pc.close();
        if (user.audioElement) user.audioElement.srcObject = null;

        const filteredUsers = this.users.filter((u) => u.userId !== disconnectedData.disconnected_user_id);
        filteredUsers.forEach((u) => {
            if (user.userId === disconnectedData.new_host_id) {
                u.isHost = true;
            } else {
                u.isHost = false;
            }
        });
        this.setUsers(filteredUsers);
    }

    /**
     * Incoming offer from someone to open peer connection
     */
    private async handleOffer(msg: WsOfferMsgFromServer): Promise<void> {
        const offeringUserFromApi = msg.data;
        const offeringUser = this.users.find((u) => u.userId === offeringUserFromApi.offering_user_id);
        console.log('[handleOffer] offeringUser:', offeringUser);
        if (!offeringUser || !this.me) return;

        await offeringUser.sendAnswer(this.signalingClient, this.mediaStreamManager, this.me.id, msg);
    }

    /**
     * Incoming answer from someone you sent the offer to
     */
    private async handleAnswer(msg: WsAnswerMsgFromServer): Promise<void> {
        const answeringUserFromApi = msg.data;
        const answeringUser = this.users.find((u) => u.userId === answeringUserFromApi.answering_user_id);
        console.log('[handleAnswer] answeringUser:', answeringUser);
        if (!answeringUser) return;

        await answeringUser.receiveAnswer(msg);
    }
}
