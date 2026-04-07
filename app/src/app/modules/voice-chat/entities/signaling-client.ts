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
        this.disconnect();
        const socket = new WebSocket(socketUrl);
        this.socket = socket;
        this.listenSocket();
    }

    public disconnect(): void {
        this.socket?.removeEventListener('message', this.msgHandler);
        this.socket?.removeEventListener('open', this.connectionHandler);
        this.socket?.removeEventListener('error', this.errorHandler);
        this.socket?.close();
        this.socket = null;
    }

    public sendMsg(msg: string): void {
        if (this.socket?.readyState !== WebSocket.OPEN) {
            console.warn('[SignalingClient] Cannot send message, socket not open. State:', this.socket?.readyState);
            return;
        }
        this.socket.send(msg);
    }

    private listenSocket(): void {
        this.socket?.addEventListener('message', this.msgHandler);
        this.socket?.addEventListener('open', this.connectionHandler);
        this.socket?.addEventListener('error', this.errorHandler);
    }

    private msgHandler = (msg: MessageEvent): void => {
        console.log('[SignalingClient_msgHandler] msg:', msg);
        this.onMessage?.({ data: msg.data });
    };

    private connectionHandler = (_event: Event): void => {
        console.log('[SignalingClient_connectionHandler] WebSocket connected');
        this.onConnect?.({ data: '' });
    };

    private errorHandler = (event: Event): void => {
        console.error('[SignalingClient_errorHandler] WebSocket error:', event);
    };
}
