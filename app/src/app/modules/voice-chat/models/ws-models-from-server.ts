import { RoomFromServer } from './http-models-from-server';

/* ---------------------------------------------GLOBAL--------------------------------------------------- */

export interface WsRoomCreatedMsgFromServer {
    action: 'ROOM_CREATED';
    data: {
        room: RoomFromServer;
    };
}

export interface WsRoomRemovedMsgFromServer {
    action: 'ROOM_REMOVED';
    data: {
        room: RoomFromServer;
    };
}

export interface WsUserJoinedMsgFromServer {
    action: 'USER_JOINED';
    data: {
        connected_user_name: string;
        connected_user_id: string;
    };
}

export interface WsUserLeftMsgFromServer {
    action: 'USER_LEFT';
    data: {
        disconnected_user_name: string;
        disconnected_user_id: string;
        new_host_name: string;
        new_host_id: string;
    };
}

// @TODO добавить ивент на подключение/отключение пользователя(обновлять счетчик изеров)

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
    };
}

export interface WsAnswerMsgFromServer {
    action: 'ANSWER_CREATED';
    data: {
        answering_user_id: string;
        answering_user_descriptor: string;
    };
}

export type WsGlobalMsgFromServer =
    | WsRoomCreatedMsgFromServer
    | WsRoomRemovedMsgFromServer
    | WsUserJoinedMsgFromServer
    | WsUserLeftMsgFromServer;

export type WsMsgFromServer =
    | WsUserConnectedMsgFromServer
    | WsYouConnectedMsgFromServer
    | WsUserDisconnectedMsgFromServer
    | WsOfferMsgFromServer
    | WsAnswerMsgFromServer;

/* --------------------------------------------------------------------------------------------------------------- */
