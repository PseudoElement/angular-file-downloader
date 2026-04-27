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
        room_id: string;
    };
}

export interface WsUserLeftMsgFromServer {
    action: 'USER_LEFT';
    data: {
        disconnected_user_name: string;
        disconnected_user_id: string;
        room_id: string;
        new_host_name: string;
        new_host_id: string;
    };
}

/* ------------------------------------------------Inner room messages------------------------------------------ */

export interface WsUserConnectedMsgFromServer {
    action: 'USER_CONNECTED';
    data: {
        connected_user_name: string;
        connected_user_id: string;
        room_id: string;
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
        room_id: string;
        new_host_name: string;
        new_host_id: string;
    };
}

export interface WsOfferMsgFromServer {
    action: 'INCOMING_OFFER';
    data: {
        offering_user_id: string;
        offering_user_descriptor: string;
    };
}

export interface WsAnswerMsgFromServer {
    action: 'INCOMING_ANSWER';
    data: {
        answering_user_id: string;
        answering_user_descriptor: string;
    };
}

export interface WsMicToggledMsgFromServer {
    action: 'USER_TOGGLED_MIC';
    data: {
        toggled_user_id: string;
        mic_enabled: boolean;
    };
}

export interface WsUserVoiceChangedMsgFromServer {
    action: 'USER_VOICE_CHANGED';
    data: {
        user_id: string;
        speaking: boolean;
    };
}

export interface WsIceCandidateMsgFromServer {
    action: 'ICE_CANDIDATE_FROM_SERVER';
    data: {
        candidate: RTCIceCandidateInit;
        sender_user_id: string;
        target_user_id: string;
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
    | WsAnswerMsgFromServer
    | WsMicToggledMsgFromServer
    | WsUserVoiceChangedMsgFromServer
    | WsIceCandidateMsgFromServer;

/* --------------------------------------------------------------------------------------------------------------- */
