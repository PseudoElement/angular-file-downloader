export interface VoicechatUserParams {
    isHost: boolean;
    userId: string;
    userName: string;
    cameraEnabled: boolean;
    pc: RTCPeerConnection;
}
