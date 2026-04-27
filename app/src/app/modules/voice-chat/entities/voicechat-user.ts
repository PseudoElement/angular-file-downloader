import { VoicechatUserParams } from '../models/voicechat-user';
import { WsAnswerMsgFromServer, WsIceCandidateMsgFromServer, WsOfferMsgFromServer } from '../models/ws-models-from-server';
import { WsAnswerMsgToServer, WsIceCandidateMsgToServer, WsOfferMsgToServer } from '../models/ws-models-to-server';
import { randomHexColor } from '../utils/converters';
import { MediaStreamManager } from './media-stream-manager';
import { SignalingClient } from './signaling-client';

export class VoicechatUser {
    public userId: string;

    public userName: string;

    public isHost: boolean;

    public pc: RTCPeerConnection;

    public dataChannel: RTCDataChannel | null;

    public audioElement: HTMLAudioElement | null;

    public readonly iconHexColor: string;

    private _mutedLocally: boolean;

    /**
     * true - if remote user was muted by you using toggleUserVoice(false)
     */
    public get mutedLocally(): boolean {
        return this._mutedLocally;
    }

    private _mutedRemotely: boolean;

    /**
     * true - if remote user muted himself (got message USER_TOGGLED_MIC from room's socket)
     */
    public get mutedRemotely(): boolean {
        return this._mutedRemotely;
    }

    private _loading: boolean;

    public get loading(): boolean {
        return this._loading;
    }

    private _speaking: boolean;

    public get speaking(): boolean {
        return this._speaking;
    }

    constructor(
        p: VoicechatUserParams,
        private readonly triggerUpdateUI: () => void
    ) {
        this.isHost = p.isHost;
        this.pc = p.pc;
        this.userId = p.userId;
        this.userName = p.userName;
        this.iconHexColor = randomHexColor();
        this.dataChannel = null;
        this.audioElement = null;
        this._mutedLocally = false;
        this._mutedRemotely = false;
        this._loading = true;
        this._speaking = false;
    }

    public disconnect(): void {
        this.dataChannel?.close();
        this.audioElement?.pause();
        console.log('disconnect CALLED!');
        this.audioElement = null;
        this.pc.close();
    }

    public async sendOffer(
        signalingClient: SignalingClient,
        mediaStreamManager: MediaStreamManager,
        senderUserId: string,
        options: RTCOfferOptions
    ): Promise<void> {
        mediaStreamManager.broadcastAudioToPeer(this.pc);

        this._mutedLocally = false;
        this.pc.addEventListener('track', this.playTrack.bind(this));
        // When all ICE candidates are gathered, send the complete offer.
        this.pc.addEventListener('icecandidate', (e) => {
            if (!e.candidate) return; // gathering complete, nothing to send
            const candidateMsg: WsIceCandidateMsgToServer = {
                action: 'ICE_CANDIDATE_TO_SERVER',
                data: {
                    candidate: e.candidate.toJSON(),
                    sender_user_id: senderUserId,
                    target_user_id: this.userId
                }
            };
            signalingClient.sendMsg(JSON.stringify(candidateMsg));
        });
        this.pc.addEventListener('connectionstatechange', () => {
            if (this.pc.connectionState === 'failed') {
                console.log(`[sendOffer] connectionstatechange failed. Restarting...`);
                this.pc.restartIce();
                this._loading = true;
                this.triggerUpdateUI();
            }
        });
        this.pc.addEventListener('negotiationneeded', () => {
            if (this.pc.connectionState === 'failed' || this.pc.iceConnectionState === 'failed') {
                console.log('[sendOffer] negotiationneeded failed. Restarting...');
                this.pc.restartIce();
                this._loading = true;
                this.triggerUpdateUI();
            }
        });
        this.pc.addEventListener('iceconnectionstatechange', () => {
            if (this.pc.iceConnectionState === 'connected') {
                this._loading = false;
                this.triggerUpdateUI();
            }
            if (this.pc.iceConnectionState === 'checking') {
                this._loading = true;
                this.triggerUpdateUI();
            }
            if (this.pc.iceConnectionState === 'failed') {
                console.log(`[sendOffer] iceconnectionstatechange failed. Restarting...`);
                this.pc.restartIce();
                this._loading = true;
                this.triggerUpdateUI();
            }
        });

        this.createDataChannel();
        this.setupDataChannel(this.dataChannel!, this.userName);

        const offer = await this.pc.createOffer(options);
        await this.pc.setLocalDescription(offer);

        console.log(`[sendOffer] Sending OFFER to ${this.userName}`);
        const localDesc = this.pc.localDescription!.toJSON();
        const offerMsg: WsOfferMsgToServer = {
            action: 'OFFER',
            data: {
                offering_user_descriptor: JSON.stringify(localDesc),
                offering_user_id: senderUserId,
                target_user_id: this.userId
            }
        };
        signalingClient.sendMsg(JSON.stringify(offerMsg));
    }

    public async sendAnswer(
        signalingClient: SignalingClient,
        mediaStreamManager: MediaStreamManager,
        answeringUserId: string,
        msg: WsOfferMsgFromServer
    ): Promise<void> {
        mediaStreamManager.broadcastAudioToPeer(this.pc);

        this._mutedLocally = false;
        this.pc.addEventListener('track', this.playTrack.bind(this));
        this.pc.addEventListener('icecandidate', (e) => {
            if (!e.candidate) return; // gathering complete, nothing to send
            const candidateMsg: WsIceCandidateMsgToServer = {
                action: 'ICE_CANDIDATE_TO_SERVER',
                data: {
                    candidate: e.candidate.toJSON(),
                    sender_user_id: answeringUserId,
                    target_user_id: this.userId
                }
            };
            signalingClient.sendMsg(JSON.stringify(candidateMsg));
        });
        this.pc.addEventListener('connectionstatechange', () => {
            if (this.pc.connectionState === 'failed') {
                console.log('[sendAnswer] connectionState failed. Restarting...');
                this.pc.restartIce();
                this._loading = true;
                this.triggerUpdateUI();
            }
        });
        this.pc.addEventListener('negotiationneeded', () => {
            if (this.pc.connectionState === 'failed' || this.pc.iceConnectionState === 'failed') {
                console.log('[sendAnswer] negotiationneeded failed. Restarting...');
                this.pc.restartIce();
                this._loading = true;
                this.triggerUpdateUI();
            }
        });
        this.pc.addEventListener('iceconnectionstatechange', () => {
            if (this.pc.iceConnectionState === 'connected') {
                this._loading = false;
                this.triggerUpdateUI();
            }
            if (this.pc.iceConnectionState === 'checking') {
                this._loading = true;
                this.triggerUpdateUI();
            }
            if (this.pc.iceConnectionState === 'failed') {
                console.log('[sendAnswer] iceConnectionState failed. Restarting...');
                this.pc.restartIce();
                this._loading = true;
                this.triggerUpdateUI();
            }
        });
        this.pc.addEventListener('datachannel', (event) => {
            console.log('[sendAnswer] datachannel event received!');
            this.dataChannel = event.channel;
            this.dataChannel.onmessage = (e) => {
                console.log('[sendAnswer] Received:', e.data);
            };
            this.dataChannel.onopen = () => {
                console.log('[sendAnswer] Data channel OPENED ', this.dataChannel!.readyState);
            };
            this.dataChannel.onclose = () => {
                console.log('[sendAnswer] Data channel CLOSED');
            };
        });

        const remoteSDP = JSON.parse(msg.data.offering_user_descriptor);
        await this.pc
            .setRemoteDescription(new RTCSessionDescription(remoteSDP))
            .catch((err) => console.log('[sendAnswer] setRemoteDescription err:', err));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        const localDesc = this.pc.localDescription?.toJSON();
        if (!localDesc) return;

        console.log(`[sendAnswer] Sending ANSWER to ${this.userName}`);
        const answerMsg: WsAnswerMsgToServer = {
            action: 'ANSWER',
            data: {
                answering_user_descriptor: JSON.stringify(localDesc),
                answering_user_id: answeringUserId,
                target_user_id: this.userId
            }
        };
        signalingClient.sendMsg(JSON.stringify(answerMsg));
    }

    public async addIceCandidate(msg: WsIceCandidateMsgFromServer): Promise<void> {
        await this.pc.addIceCandidate(new RTCIceCandidate(msg.data.candidate));
    }

    public receiveAnswer(msg: WsAnswerMsgFromServer): Promise<void> {
        const remoteSDP = JSON.parse(msg.data.answering_user_descriptor);
        return this.pc
            .setRemoteDescription(new RTCSessionDescription(remoteSDP))
            .catch((err) => console.log('[receiveAnswer] setRemoteDescription err:', err));
    }

    private playTrack(event: RTCTrackEvent): void {
        this.audioElement = new Audio();
        this.audioElement.srcObject = event.streams[0];
        this.audioElement.play();
    }

    public toggleUserMicLocally(enabled: boolean): void {
        this._mutedLocally = !enabled;
        if (!this.audioElement) return;
        this.audioElement.volume = enabled ? 1 : 0;
    }

    public toggleUserMicRemotely(enabled: boolean): void {
        this._mutedRemotely = !enabled;
        this.triggerUpdateUI();
    }

    public toggleSpeakingStatus(speaking: boolean): void {
        console.log('[toggleSpeakingStatus] speaking:', speaking);
        this._speaking = speaking;
        this.triggerUpdateUI();
    }

    private createDataChannel(): void {
        const channel = this.pc.createDataChannel('chat');
        this.dataChannel = channel;
    }

    private setupDataChannel(channel: RTCDataChannel, peerName: string): void {
        channel.onopen = () => {
            // console.log(`[setupDataChannel] DataChannel OPEN with ${peerName}`);
        };
        channel.onclose = () => {
            // console.log(`[setupDataChannel] DataChannel CLOSED with ${peerName}`);
        };
        channel.onmessage = (e) => {
            // console.log(`[setupDataChannel] DataChannel message from ${peerName}:`, e.data);
        };
        channel.onerror = (e) => {
            // console.error(`[setupDataChannel] DataChannel error with ${peerName}:`, e);
        };
    }
}
