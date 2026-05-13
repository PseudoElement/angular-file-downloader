import { Injectable } from '@angular/core';
import { SignalingClient } from '../entities/signaling-client';
import { VoicechatUser } from '../entities/voicechat-user';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Me } from '../models/http-models-from-server';
import { ENVIRONMENT } from 'src/environments/environment';
import { CreateRoomReqBody } from '../models/http-models-to-server';
import { BehaviorSubject } from 'rxjs';
import {
    WsAnswerMsgFromServer,
    WsCameraToggledMsgFromServer,
    WsIceCandidateMsgFromServer,
    WsMicToggledMsgFromServer,
    WsMsgFromServer,
    WsOfferMsgFromServer,
    WsUserConnectedMsgFromServer,
    WsUserDisconnectedMsgFromServer,
    WsUserVoiceChangedMsgFromServer,
    WsYouConnectedMsgFromServer
} from '../models/ws-models-from-server';
import {
    WsCameraToggledMsgToServer,
    WsConnectMsgToServer,
    WsDisconnectMsgToServer,
    WsMicToggledMsgToServer,
    WsUserVoiceChangedMsgToServer
} from '../models/ws-models-to-server';
import { RTC_CONFIG } from '../constants/ice-servers';
import { VoiceChatApiService } from './voice-chat-api.service';
import { MediaStreamManager } from '../entities/media-stream-manager';
import { AlertsService } from 'src/app/shared/services/alerts.service';
import { AudioLoaderService } from 'src/app/core/audio/audio-loader.service';
import * as hark from 'hark';

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

@Injectable({ providedIn: 'root' })
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

    private readonly _me$ = new BehaviorSubject<Me | null>(null);

    public readonly me$ = this._me$.asObservable();

    public get me(): Me | null {
        return this._me$.value;
    }

    private setMe(me: Me | null): void {
        this._me$.next(me);
    }

    public toggleMyMic(enabled: boolean): void {
        if (!this.me) return;
        this.mediaStreamManager.toggleYourVoice(enabled);
        this.setMe({ ...this.me, muted: !enabled });
        this.triggerUpdateUI();

        const msg: WsMicToggledMsgToServer = {
            action: 'USER_TOGGLED_MIC',
            data: { mic_enabled: enabled, toggled_user_id: this.me.id }
        };
        this.signalingClient.sendMsg(JSON.stringify(msg));
    }

    public toggleMyCamera(enabled: boolean): void {
        if (!this.me) return;
        if (!this.mediaStreamManager.hasWebCamera) {
            this.alertsService.showAlert({
                type: 'warn',
                text: `Can't find your video. Allow your web-camera in site-settings and reload page.`
            });
            return;
        }

        this.setMe({ ...this.me, camera_enabled: enabled });
        this.triggerUpdateUI();
        this.mediaStreamManager.toggleYourVideo(enabled);

        const msg: WsCameraToggledMsgToServer = {
            action: 'USER_TOGGLED_CAMERA',
            data: { camera_enabled: enabled, toggled_user_id: this.me.id }
        };
        this.signalingClient.sendMsg(JSON.stringify(msg));
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

    private speechEvents: hark.Harker | null = null;

    constructor(
        private readonly voicechatApi: VoiceChatApiService,
        private readonly sintolModalSrv: SintolLibDynamicComponentService,
        private readonly alertsService: AlertsService,
        private readonly audioLoaderSrv: AudioLoaderService
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
        this.speechEvents?.stop();
    }

    public async createVoiceRoom(): Promise<boolean> {
        try {
            const allowedMicrophone = await navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => true)
                .catch(() => false);
            if (!allowedMicrophone) {
                this.alertsService.showAlert({ text: 'Allow microphone to create room.', type: 'warn' });
                return false;
            }

            const userName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
                title: 'Modal',
                text: 'Input your name.'
            });
            if (!userName || !userName.trim() || /[\&\%\+]/.test(userName)) {
                this.alertsService.showAlert({ text: `Invalid user name.`, type: 'warn' });
                return false;
            }

            const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
                title: 'Modal',
                text: 'Input room name.'
            });
            if (!roomName || !roomName.trim()) {
                this.alertsService.showAlert({ text: `Invalid room name.`, type: 'warn' });
                return false;
            }

            const createRoomReqBody: CreateRoomReqBody = {
                host_name: userName,
                max_users: 20,
                room_name: roomName
            };

            const resp = await this.voicechatApi.createRoom(createRoomReqBody);
            this._roomId = resp.created_room.room_id;
            this.setMe({ id: '', is_host: true, name: userName, muted: false, camera_enabled: false, speaking: false });

            const socketUrl = `${ENVIRONMENT.apiSocketUrl}/voicechat/ws/connect?room_id=${this.roomId}&user_name=${userName}`;
            this.signalingClient.connect(socketUrl);
            console.log('[createVoiceRoom] room created:', this.roomId);
            return true;
        } catch (err) {
            console.error('[createVoiceRoom] err:', err);
            return false;
        }
    }

    /**
     * @returns success
     */
    public async connectToVoiceRoom(roomId: string): Promise<boolean> {
        try {
            const allowedMicrophone = await navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => true)
                .catch(() => false);
            if (!allowedMicrophone) {
                this.alertsService.showAlert({ text: 'Allow microphone to connect to room.', type: 'warn' });
                return false;
            }

            const userName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
                title: 'Modal',
                text: 'Input your name.'
            });
            if (!userName || !userName.trim() || /[\&\%\+]/.test(userName)) {
                this.alertsService.showAlert({ text: `Invalid user name.`, type: 'warn' });
                return false;
            }

            const roomInfo = await this.voicechatApi.fetchRoomById(roomId);
            if (!roomInfo.room) {
                this.alertsService.showAlert({ text: `Room with id ${roomId} not found.`, type: 'warn' });
                return false;
            }

            const nameTaken = (roomInfo.room?.users || []).find((user) => user.name.toLowerCase() === userName.toLowerCase());
            if (nameTaken) {
                this.alertsService.showAlert({ text: `Username "${userName}" already taken. Choose another one.`, type: 'warn' });
                return false;
            }

            this.setMe({ id: '', is_host: false, name: userName, muted: false, camera_enabled: false, speaking: false });
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
                connected_user_name: this.me.name,
                camera_enabled: this.mediaStreamManager.videoEnabled
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
            case 'USER_TOGGLED_MIC':
                this.handleUserToggledMic(parsed);
                break;
            case 'USER_VOICE_CHANGED':
                this.handleUserVoiceChanged(parsed);
                break;
            case 'ICE_CANDIDATE_FROM_SERVER':
                this.handleIceCandidate(parsed);
                break;
            case 'USER_TOGGLED_CAMERA':
                this.handleUserToggledCamera(parsed);
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
                            cameraEnabled: user.camera_enabled,
                            pc: new RTCPeerConnection(RTC_CONFIG)
                        },
                        this.triggerUpdateUI.bind(this)
                    )
            );
        this.setUsers(users);

        const me = apiUsers.find((user) => user.name === this.me!.name);
        if (!me) return;
        this.setMe({ ...me, speaking: false });
        this.audioLoaderSrv.audioElements.DISCORD_JOIN.play();
        await this.mediaStreamManager.startMediaStream((stream) => this.onMediaStreamStart(stream));

        console.log('[VoiceChatService_handleYouConnected] me', me);
        if (!users.length) return;

        for (const user of users) {
            await user.sendOffer(this.signalingClient, this.mediaStreamManager, me.id, {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
        }
    }

    private onMediaStreamStart(mediaStream: MediaStream): void {
        if (!this.me) return;
        this.speechEvents = hark(mediaStream, { interval: 100, threshold: -40 });
        this.speechEvents.on('speaking', () => {
            if (!this.me || this.me.speaking || this.users.length < 1) return;
            const msg: WsUserVoiceChangedMsgToServer = {
                action: 'USER_VOICE_CHANGED',
                data: { speaking: true, user_id: this.me.id }
            };
            this.signalingClient.sendMsg(JSON.stringify(msg));
            this.setMe({ ...this.me, speaking: true });
        });
        this.speechEvents.on('stopped_speaking', () => {
            if (!this.me || this.users.length < 1) return;
            const msg: WsUserVoiceChangedMsgToServer = {
                action: 'USER_VOICE_CHANGED',
                data: { speaking: false, user_id: this.me.id }
            };
            this.signalingClient.sendMsg(JSON.stringify(msg));
            this.setMe({ ...this.me, speaking: false });
        });
    }

    private handleUserConnected(msg: WsUserConnectedMsgFromServer): void {
        const connectedUser = msg.data;
        if (connectedUser.connected_user_id.toLowerCase() === this.me?.id.toLowerCase()) return;
        const user = new VoicechatUser(
            {
                userId: connectedUser.connected_user_id,
                userName: connectedUser.connected_user_name,
                isHost: false,
                cameraEnabled: connectedUser.camera_enabled,
                pc: new RTCPeerConnection(RTC_CONFIG)
            },
            this.triggerUpdateUI.bind(this)
        );
        this.audioLoaderSrv.audioElements.DISCORD_JOIN.play();
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
        this.audioLoaderSrv.audioElements.DISCORD_LEAVE.play();

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

    private async handleUserToggledMic(msg: WsMicToggledMsgFromServer): Promise<void> {
        const toggledUserData = msg.data;
        if (toggledUserData.toggled_user_id.toLowerCase() === this.me?.id.toLowerCase()) return;

        const foundUser = this.users.find((u) => toggledUserData.toggled_user_id === u.userId);
        if (!foundUser) return;

        foundUser.toggleUserMicRemotely(toggledUserData.mic_enabled);
    }

    /**
     * invoked when other user speaks to microphone
     */
    private async handleUserVoiceChanged(msg: WsUserVoiceChangedMsgFromServer): Promise<void> {
        const voiceChangedData = msg.data;
        if (voiceChangedData.user_id.toLowerCase() === this.me?.id.toLowerCase()) return;

        const foundUser = this.users.find((u) => voiceChangedData.user_id === u.userId);
        if (!foundUser) return;

        foundUser.toggleSpeakingStatus(voiceChangedData.speaking);
    }

    private async handleIceCandidate(msg: WsIceCandidateMsgFromServer): Promise<void> {
        const user = this.users.find((u) => u.userId === msg.data.sender_user_id);
        if (!user) return;
        await user.addIceCandidate(msg);
    }

    private async handleUserToggledCamera(msg: WsCameraToggledMsgFromServer): Promise<void> {
        const toggledUserData = msg.data;
        if (toggledUserData.toggled_user_id.toLowerCase() === this.me?.id.toLowerCase()) return;

        const user = this.users.find((u) => u.userId === msg.data.toggled_user_id);
        if (!user) return;

        user.toggleUserCameraRemotely(toggledUserData.camera_enabled);
    }
}
