export interface WsConnectMsgToServer {
    action: 'CONNECT';
    data: {
        connected_user_name: string;
        room_id: string;
    };
}

export interface WsDisconnectMsgToServer {
    action: 'DISCONNECT';
    data: {
        disconnected_user_name: string;
        disconnected_user_id: string;
    };
}

export interface WsOfferMsgToServer {
    action: 'OFFER';
    data: {
        offering_user_id: string;
        offering_user_descriptor: string;
        target_user_id: string;
    };
}

export interface WsAnswerMsgToServer {
    action: 'ANSWER';
    data: {
        answering_user_id: string;
        answering_user_descriptor: string;
        target_user_id: string;
    };
}

export interface WsMicToggledMsgToServer {
    action: 'USER_TOGGLED_MIC';
    data: {
        toggled_user_id: string;
        mic_enabled: boolean;
    };
}

export type WsMsgToServer =
    | WsConnectMsgToServer
    | WsOfferMsgToServer
    | WsAnswerMsgToServer
    | WsDisconnectMsgToServer
    | WsMicToggledMsgToServer;
