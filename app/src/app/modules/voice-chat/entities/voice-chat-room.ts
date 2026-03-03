export interface VoiceChatRoomParams {
    socketUrl: string;
}

export interface VoiceChatUser {
    name: string;
    ip: string;
    speaking: boolean;
    host: boolean;
}

export class VoiceChatRoom {
    private readonly users: VoiceChatUser[] = [];

    public get host(): VoiceChatUser {
        return this.users.find((u) => u.host)!;
    }

    public socket: WebSocket | null = null;

    constructor(p: VoiceChatRoomParams) {
        this.connect(p.socketUrl);
        this.listenSocket();
    }

    public connect(socketUrl: string): void {
        const socket = new WebSocket(socketUrl);
        this.socket = socket;
    }

    public disconnect(): void {
        this.socket?.removeEventListener('message', this.msgHandler);
        this.socket?.removeEventListener('open', this.connectionHandler);
        this.socket?.removeEventListener('error', this.errorHandler);
        this.socket?.close();
    }

    private listenSocket(): void {
        this.socket?.addEventListener('message', this.msgHandler);
        this.socket?.addEventListener('open', this.connectionHandler);
        this.socket?.addEventListener('error', this.errorHandler);
    }

    private msgHandler(msg: object): void {}

    private connectionHandler(msg: object): void {}

    private errorHandler(msg: object): void {}

    public handleUserConnection(): void {}
}
