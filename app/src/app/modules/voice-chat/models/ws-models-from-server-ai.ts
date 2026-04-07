export interface PeerFromServer {
    descriptor: string;
    name: string;
    is_host: boolean;
    id: string;
}

export interface RoomFromServer {
    peers: PeerFromServer[];
    name: string;
    id: string;
    max_peers: number;
    host_name: string;
}

export interface WsConnectMsgFromServer {
    action: 'CONNECT';
    data: {
        room: RoomFromServer;
    };
}

export interface WsOfferMsgFromServer {
    action: 'OFFER';
    data: {
        peer_descriptor: string;
        from_peer_id: string;
        from_peer_name: string;
    };
}

export interface WsAnswerMsgFromServer {
    action: 'ANSWER';
    data: {
        peer_descriptor: string;
        from_peer_id: string;
        from_peer_name: string;
    };
}

export interface WsPeerJoinedMsgFromServer {
    action: 'PEER_JOINED';
    data: {
        peer_id: string;
        peer_name: string;
    };
}

export interface WsPeerLeftMsgFromServer {
    action: 'PEER_LEFT';
    data: {
        peer_id: string;
    };
}

export type WsMsgFromServer =
    | WsConnectMsgFromServer
    | WsOfferMsgFromServer
    | WsAnswerMsgFromServer
    | WsPeerJoinedMsgFromServer
    | WsPeerLeftMsgFromServer;

/** @deprecated Use WsConnectMsgFromServer instead */
export type WsConnectionMsgFromServer = WsConnectMsgFromServer;
