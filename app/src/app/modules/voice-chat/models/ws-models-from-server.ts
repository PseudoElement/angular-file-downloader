/* ---------------------------------------------GLOBAL--------------------------------------------------- */

export interface UserFromServer {
    name: string;
    is_host: boolean;
    id: string;
}

export interface RoomFromServer {
    users: UserFromServer[];
    name: string;
    id: string;
    max_peers: number;
    host_name: string;
}

/* ------------------------------------------------Inner room messages------------------------------------------ */

export interface WsUserConnectedMsgFromServer {
    action: 'USER_CONNECTED';
    data: {
        connected_user_name: string;
        connected_user_id: string;
    };
}

export interface WsYouConnectedMsgFromServer {
    action: 'YOU_CONNECTED';
    data: {
        room: RoomFromServer;
    };
}

export interface WsUserDisconnectedMsgFromServer {
    action: 'USER_DISCONNECTED';
    data: {
        disconnected_user_name: string;
        disconnected_user_id: string;
        new_host_name: string;
        new_host_id: string;
    };
}

export interface WsOfferMsgFromServer {
    action: 'OFFER_CREATED';
    data: {
        offering_user_id: string;
        offering_user_descriptor: string;
        target_user_id: string;
    };
}

export interface WsAnswerMsgFromServer {
    action: 'ANSWER_CREATED';
    data: {
        answering_user_id: string;
        answering_user_descriptor: string;
        target_user_id: string;
    };
}

export type WsMsgFromServer =
    | WsUserConnectedMsgFromServer
    | WsYouConnectedMsgFromServer
    | WsUserDisconnectedMsgFromServer
    | WsOfferMsgFromServer
    | WsAnswerMsgFromServer;

/* --------------------------------------------------------------------------------------------------------------- */
