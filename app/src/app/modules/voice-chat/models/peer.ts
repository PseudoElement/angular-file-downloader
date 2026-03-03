export interface WebRtcUser {
    pc: RTCPeerConnection;
    username: string;
    ip: string;
    isHost: boolean;
}
