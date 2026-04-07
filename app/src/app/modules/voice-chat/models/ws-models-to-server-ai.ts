export interface WsConnectMsgToServer {
    action: 'CONNECT';
    data: {
        peer_name: string;
        peer_descriptor: string;
    };
}

export interface WsOfferMsgToServer {
    action: 'OFFER';
    data: {
        peer_descriptor: string;
        target_peer_id: string;
        peer_name: string;
    };
}

export interface WsAnswerMsgToServer {
    action: 'ANSWER';
    data: {
        peer_descriptor: string;
        target_peer_id: string;
        peer_name: string;
    };
}

export interface WsDisconnectMsgToServer {
    action: 'DISCONNECT';
    data: {
        peer_name: string;
    };
}

export type WsMsgToServer = WsConnectMsgToServer | WsOfferMsgToServer | WsAnswerMsgToServer | WsDisconnectMsgToServer;

/** @deprecated Use WsConnectMsgToServer instead */
export type WsConnectionMsgToServer = WsConnectMsgToServer;
