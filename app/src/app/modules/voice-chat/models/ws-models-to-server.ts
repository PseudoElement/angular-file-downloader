export interface WsConnectMsgToServer {
    action: 'CONNECT';
    data: {
        connected_user_name: string;
        room_id: string;
        camera_enabled: boolean;
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

export interface WsUserVoiceChangedMsgToServer {
    action: 'USER_VOICE_CHANGED';
    data: {
        user_id: string;
        speaking: boolean;
    };
}

export interface WsIceCandidateMsgToServer {
    action: 'ICE_CANDIDATE_TO_SERVER';
    data: {
        candidate: RTCIceCandidateInit;
        sender_user_id: string;
        target_user_id: string;
    };
}

export interface WsCameraToggledMsgToServer {
    action: 'USER_TOGGLED_CAMERA';
    data: {
        toggled_user_id: string;
        camera_enabled: boolean;
    };
}

export type WsMsgToServer =
    | WsConnectMsgToServer
    | WsOfferMsgToServer
    | WsAnswerMsgToServer
    | WsDisconnectMsgToServer
    | WsMicToggledMsgToServer
    | WsUserVoiceChangedMsgToServer
    | WsIceCandidateMsgToServer
    | WsCameraToggledMsgToServer;
