import { RTC_CONFIG } from '../constants/ice-servers';
import { PeerCreationParams } from '../models/peer';
import { ConnectionDataToServer } from '../models/ws-models-to-server';
import { Peer } from './peer';
import { SignalingClient } from './signaling-client';

export class HostPeer extends Peer {
    protected signalingClient: SignalingClient;

    constructor(params: PeerCreationParams) {
        super(params);
        this.signalingClient = new SignalingClient({
            onConnect: params.signalingClientParams.onConnect,
            onMessage: params.signalingClientParams.onMessage
        });
    }

    public async connect(socketUrl: string, roomId: string, userName: string): Promise<void> {
        const url = `${socketUrl}?room_id=${roomId}&peer_name=${userName}`;
        this.signalingClient.connect(url);
        this.createRoom(roomId, userName);
    }

    private async createRoom(roomId: string, userName: string): Promise<void> {
        this.setPeerConnection(new RTCPeerConnection(RTC_CONFIG));
        // 1. Add local tracks first
        await this.speak();

        this.pc.addEventListener('track', this.playTrack);
        this.pc.addEventListener('icecandidate', (e) => {
            console.log('event icecandidate', e.candidate?.toJSON());
            if (!e.candidate) {
                const localDescription = JSON.stringify(this.pc.localDescription?.toJSON());
                console.log('localDescription ==>', localDescription);
                if (!localDescription) return;
                const msg: ConnectionDataToServer = {
                    peer_descriptor: localDescription,
                    peer_name: userName
                };
                this.signalingClient.sendMsg(JSON.stringify(msg));
            }
        });
        this.pc.addEventListener('connectionstatechange', () => {
            console.log('Connection state:', this.pc!.connectionState);
        });
        this.pc.addEventListener('iceconnectionstatechange', () => {
            console.log('ICE connection state:', this.pc!.iceConnectionState);
        });

        const channel = this.pc.createDataChannel('chat');
        this.setRtcDataChannel(channel);

        channel.onopen = () => {
            console.log('Data channel OPENED, readyState:', channel.readyState);
        };
        channel.onclose = () => {
            console.log('Data channel CLOSED');
        };
        channel.onerror = (e) => {
            console.log('channel.onerror:', e);
        };

        const offer = await this.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
        console.log('Called createOffer...');
        await this.pc.setLocalDescription(offer);
    }

    public async speak(): Promise<void> {
        // get access to micropnohe
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('[LocalPeer_startVoice] stream ==>', stream);

        // get voice and send it to RTCPeerCoonection
        stream.getTracks().forEach((track) => {
            console.log('track ==>', track);
            this.pc.addTrack(track, stream);
        });
    }
}
