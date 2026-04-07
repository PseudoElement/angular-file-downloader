import { VoicechatUserParams } from '../models/voicechat-user';
import { WsOfferMsgToServer } from '../models/ws-models-to-server';
import { SignalingClient } from './signaling-client';

export class VoicechatUser {
    public userId: string;

    public userName: string;

    public isHost: boolean;

    public pc: RTCPeerConnection;

    public dataChannel: RTCDataChannel | null;

    public audioElement: HTMLAudioElement | null;

    constructor(p: VoicechatUserParams) {
        this.isHost = p.isHost;
        this.pc = p.pc;
        this.userId = p.userId;
        this.userName = p.userName;
        this.dataChannel = p.dataChannel;
        this.audioElement = p.audioElement;
    }

    public async handleOffer(signalingClient: SignalingClient, senderUserId: string, options: RTCOfferOptions): Promise<void> {
        this.createDataChannel();
        this.setupDataChannel(this.dataChannel!, this.userName);

        // When all ICE candidates are gathered, send the complete offer.
        this.pc.addEventListener('icecandidate', (e) => {
            if (e.candidate) return; // still gathering

            const localDesc = this.pc.localDescription?.toJSON();
            if (!localDesc) return;

            console.log(`[VoicechatUser_handleOffer] Sending OFFER to ${this.userName}`);
            const offerMsg: WsOfferMsgToServer = {
                action: 'OFFER',
                data: {
                    offering_user_descriptor: JSON.stringify(localDesc),
                    offering_user_id: senderUserId,
                    target_user_id: this.userId
                }
            };
            signalingClient.sendMsg(JSON.stringify(offerMsg));
        });

        const offer = await this.pc.createOffer(options);
        await this.pc.setLocalDescription(offer);
    }

    private createDataChannel(): void {
        const channel = this.pc.createDataChannel('chat');
        this.dataChannel = channel;
    }

    private setupDataChannel(channel: RTCDataChannel, peerName: string): void {
        channel.onopen = () => {
            console.log(`[VoiceChatService] DataChannel OPEN with ${peerName}`);
        };
        channel.onclose = () => {
            console.log(`[VoiceChatService] DataChannel CLOSED with ${peerName}`);
        };
        channel.onmessage = (e) => {
            console.log(`[VoiceChatService] DataChannel message from ${peerName}:`, e.data);
            // Extend here: forward to a Subject / callback for UI consumption.
        };
        channel.onerror = (e) => {
            console.error(`[VoiceChatService] DataChannel error with ${peerName}:`, e);
        };
    }
}
