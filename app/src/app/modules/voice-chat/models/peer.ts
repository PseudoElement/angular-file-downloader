import { SignalingClient } from '../entities/signaling-client';

export type SocketEventHandler = (msg: { data: string }) => void;

export interface SignalingClientParams {
    onMessage?: SocketEventHandler;
    onConnect?: SocketEventHandler;
}

export interface PeerCreationParams {
    userName: string;
    me: boolean;
    signalingClient: SignalingClient;
}
