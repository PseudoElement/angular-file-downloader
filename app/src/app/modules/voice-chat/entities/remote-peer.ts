import { RTC_CONFIG } from '../constants/ice-servers';
import { PeerCreationParams } from '../models/peer';
import { WsConnectionMsgToServer } from '../models/ws-models-to-server-ai';
import { Peer } from './peer';
import { SignalingClient } from './signaling-client';

export class RemotePeer extends Peer {
    protected signalingClient: SignalingClient;

    constructor(params: PeerCreationParams) {
        super(params);
        this.signalingClient = params.signalingClient;
    }

    public async connect(socketUrl: string, roomId: string, userName: string): Promise<void> {
        // const url = `${socketUrl}?room_id=${roomId}&peer_name=${userName}`;
        // this.signalingClient.connect(url);
        this.connectToRoom(roomId, userName);
    }

    private async connectToRoom(roomId: string, userName: string): Promise<void> {
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
                const msg: WsConnectionMsgToServer = {
                    action: 'CONNECT',
                    data: {
                        peer_descriptor: localDescription,
                        peer_name: userName
                    }
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
        this.pc.addEventListener('datachannel', (event) => {
            console.log('datachannel event received!');
            this.setRtcDataChannel(event.channel);
            this.rtcChannel.onopen = () => {
                console.log('Data channel OPENED on joiner, readyState:', this.rtcChannel!.readyState);
            };
            this.rtcChannel.onclose = () => {
                console.log('Data channel CLOSED on joiner');
            };
        });

        // await this.setRemoteDescriptor();
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        console.log('Answer set as local description');
    }

    public async speak(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('[LocalPeer_startVoice] stream ==>', stream);

        stream.getTracks().forEach((track) => {
            console.log('track ==>', track);
            this.pc.addTrack(track, stream);
        });
    }

    public async setRemoteDescriptor(remoteDescriptor: string): Promise<void> {
        const remoteSDP = JSON.parse(remoteDescriptor);
        const remoteDescription = new RTCSessionDescription(remoteSDP);
        this.pc.setRemoteDescription(remoteDescription).catch((err) => console.log('setRemoteDescriptor err', err));
    }
}
