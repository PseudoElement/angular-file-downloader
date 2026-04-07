import { SignalingClientParams, SocketEventHandler } from '../models/peer';

export class SignalingClient {
    public socket: WebSocket | null = null;

    private readonly onMessage?: SocketEventHandler;

    private readonly onConnect?: SocketEventHandler;

    constructor(p: SignalingClientParams) {
        this.onMessage = p.onMessage;
        this.onConnect = p.onConnect;
    }

    public connect(socketUrl: string): void {
        const socket = new WebSocket(socketUrl);
        this.socket = socket;
        this.listenSocket();
    }

    public disconnect(): void {
        this.socket?.removeEventListener('message', this.msgHandler);
        this.socket?.removeEventListener('open', this.connectionHandler);
        this.socket?.removeEventListener('error', this.errorHandler);
        this.socket?.close();
    }

    public sendMsg(msg: string): void {
        this.socket?.send(msg);
    }

    private listenSocket(): void {
        this.socket?.addEventListener('message', this.msgHandler);
        this.socket?.addEventListener('open', this.connectionHandler);
        this.socket?.addEventListener('error', this.errorHandler);
    }

    private msgHandler(msg: object): void {
        if (!this.socket) return;
        console.log('[VoiceChatRoom_msgHandler] msg:', msg);
        this.onMessage?.(msg as { data: string }, this.socket);
    }

    private connectionHandler(msg: object): void {
        if (!this.socket) return;
        console.log('[VoiceChatRoom_connectionHandler] msg:', msg);
        this.onConnect?.(msg as { data: string }, this.socket);
    }

    private errorHandler(msg: object): void {
        if (!this.socket) return;
        console.log('[VoiceChatRoom_errorHandler] msg:', msg);
    }
}
