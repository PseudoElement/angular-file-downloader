import { ENVIRONMENT } from 'src/environments/environment';
import { SignalingClient } from './signaling-client';
import { PeerCreationParams } from '../models/peer';

export abstract class Peer {
    protected abstract signalingClient: SignalingClient;

    private _pc: RTCPeerConnection | null = null;

    private _rtcChannel: RTCDataChannel | null = null;

    public readonly me: boolean;

    constructor(params: PeerCreationParams) {
        this.me = params.me;
    }

    public get pc(): RTCPeerConnection {
        if (!this._pc) throw new Error('[Peer_pc] pc is undefined');
        return this._pc;
    }

    public setPeerConnection(pc: RTCPeerConnection | null): void {
        this._pc = pc;
    }

    protected get rtcChannel(): RTCDataChannel {
        if (!this._rtcChannel) throw new Error('[Peer_pc] rtcChannel is undefined');
        return this._rtcChannel;
    }

    protected setRtcDataChannel(dataChannel: RTCDataChannel | null): void {
        this._rtcChannel = dataChannel;
    }

    public abstract connect(socketUrl: string, roomId: string, userName: string): Promise<void>;

    public disconnect(): void {
        this.rtcChannel?.close();
        this.pc?.close();
        this.setPeerConnection(null);
        this.setRtcDataChannel(null);
    }

    protected playTrack(event: RTCTrackEvent): void {
        console.log('[playTrack] event', event);
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play();
    }
}
