import { Injectable } from '@angular/core';
import { SignalingClient } from '../entities/signaling-client';
import { VoicechatUser } from '../entities/voicechat-user';
import { HttpClient } from '@angular/common/http';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { CreateRoomRespBody } from '../models/http-models-from-server';
import { ENVIRONMENT } from 'src/environments/environment';
import { CreateRoomReqBody } from '../models/http-models-to-server';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import {
    WsAnswerMsgFromServer,
    WsMsgFromServer,
    WsOfferMsgFromServer,
    WsUserConnectedMsgFromServer,
    WsUserDisconnectedMsgFromServer,
    WsYouConnectedMsgFromServer
} from '../models/ws-models-from-server';
import { WsConnectMsgToServer, WsDisconnectMsgToServer } from '../models/ws-models-to-server';
import { RTC_CONFIG } from '../constants/ice-servers';

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
 *   отправляем ему ивент OFFER_CREATED с offering_user_id, offering_user_descriptor
 *
 *   на клиенте OFFER_CREATED:
 *   на клиенте-получателе создаем new RTCPeerConnection(), выставляем setRemoteDescription, делаем подписки,
 *   вызываем createAnswer(), выставляем setLocalDescription,
 *   и отправляем ивент ANSWER с answering_user_id, answering_user_descriptor, target_user_id
 *
 * 4. ANSWER_CREATED:
 * - на клиенте-получателе находим нужный peer по answering_user_id, выставляем setRemoteDescription
 * - на сервере находим нужного user по target_user_id
 *   и отправляем ему answering_user_id, answering_user_descriptor, target_user_id
 */

@Injectable()
export class VoiceChatService {
    private userName: string = '';

    private userId: string = '';

    private roomId: string = '';

    private readonly _users$ = new BehaviorSubject<VoicechatUser[]>([]);

    public get users(): VoicechatUser[] {
        return this._users$.value;
    }

    private setUsers(users: VoicechatUser[]): void {
        this._users$.next(users);
    }

    // ── Private state ───────────────────────────────────────────────
    /** One SignalingClient (WebSocket wrapper) shared by all peer connections. */
    public signalingClient: SignalingClient = new SignalingClient({
        onConnect: () => this.onSocketConnected(),
        onMessage: (msg) => this.onSocketMessage(msg)
    });

    constructor(
        private readonly httpClient: HttpClient,
        private readonly sintolModalSrv: SintolLibDynamicComponentService
    ) {}

    public disconnect(): void {
        const disconnectMsg: WsDisconnectMsgToServer = {
            action: 'DISCONNECT',
            data: {
                disconnected_user_name: this.userName,
                disconnected_user_id: this.userId
            }
        };
        this.signalingClient.sendMsg(JSON.stringify(disconnectMsg));
        this.signalingClient.disconnect();
        this.users.forEach((user) => user.disconnect());
        this.setUsers([]);
        this.roomId = '';
        this.userId = '';
        this.userName = '';
    }

    public async createVoiceRoom(): Promise<void> {
        this.userName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input your name.'
        });
        const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room name.'
        });

        const createRoomReqBody: CreateRoomReqBody = {
            host_name: this.userName,
            max_ueers: 10,
            room_name: roomName
        };

        const resp = await firstValueFrom(
            this.httpClient.post<CreateRoomRespBody>(`${ENVIRONMENT.apiBaseUrl}/voicechat/create`, createRoomReqBody)
        );
        this.roomId = resp.data.room_id;

        const socketUrl = `${ENVIRONMENT.apiSocketUrl}/voicechat/ws/connect?room_id=${this.roomId}&user_name=${this.userName}`;
        this.signalingClient.connect(socketUrl);
    }

    public async connectToVoiceRoom(roomId: string): Promise<void> {
        this.userName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input your name.'
        });
        this.roomId = roomId;

        const socketUrl = `${ENVIRONMENT.apiSocketUrl}/voicechat/ws/connect?room_id=${this.roomId}&user_name=${this.userName}`;
        this.signalingClient.connect(socketUrl);
    }

    private onSocketConnected(): void {
        const msg: WsConnectMsgToServer = {
            action: 'CONNECT',
            data: {
                room_id: this.roomId,
                connected_user_name: this.userName
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
            case 'OFFER_CREATED':
                this.handleOffer(parsed);
                break;
            case 'ANSWER_CREATED':
                this.handleAnswer(parsed);
                break;
            default:
                console.log('[VoiceChatService_onSocketMessage] Unknown WS action:', (parsed as any).action);
        }
    }

    private async handleYouConnected(msg: WsYouConnectedMsgFromServer): Promise<void> {
        const apiUsers = msg.data.room.users;
        const users = apiUsers
            .filter((user) => user.name !== this.userName)
            .map(
                (user) =>
                    new VoicechatUser({
                        userId: user.id,
                        userName: user.name,
                        isHost: user.is_host,
                        pc: new RTCPeerConnection(RTC_CONFIG),
                        audioElement: null,
                        dataChannel: null
                    })
            );
        this.setUsers(users);

        const me = apiUsers.find((user) => user.name === this.userName);
        console.log('[VoiceChatService_handleYouConnected] me', me);
        if (!me || !users.length) return;

        this.userId = me.id;
        for (const user of users) {
            await user.sendOffer(this.signalingClient, me.id, {
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });
        }
    }

    private handleUserConnected(msg: WsUserConnectedMsgFromServer): void {
        const connectedUser = msg.data;
        const user = new VoicechatUser({
            userId: connectedUser.connected_user_id,
            userName: connectedUser.connected_user_name,
            isHost: false,
            pc: new RTCPeerConnection(RTC_CONFIG),
            audioElement: null,
            dataChannel: null
        });
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
        if (!offeringUser) return;

        await offeringUser.sendAnswer(this.signalingClient, msg);
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
