import { SocketRespType, StepResult } from '../constants/socket-constants';

interface BaseSocketRespMsg<T = undefined> {
    message: string;
    action_type: SocketRespType;
    data: T;
}

export type ConnectPlayerRespMsg = BaseSocketRespMsg<{
    room_id: string;
    room_name: string;
    created_at: string;
    your_data: { player_id: string; player_email: string; is_owner: boolean };
    enemy_data: { player_id: string; player_email: string; is_owner: boolean };
}>;

export type DisconnectPlayerRespMsg = BaseSocketRespMsg<{ player_email: string; player_id: string; room_id: string; room_name: string }>;

export type PlayerReadyRespMsg = BaseSocketRespMsg<{ player_email: string; player_id: string }>;

export type PlayerStepRespMsg = BaseSocketRespMsg<{ player_email: string; player_id: string; step_result: StepResult; step: string }>;

export type PlayerSetPositionsRespMsg = BaseSocketRespMsg<{ player_email: string; player_id: string }>;

export type WinGameRespMsg = BaseSocketRespMsg<{ winner_email: string; winner_id: string }>;

export type SocketRespMsg =
    | ConnectPlayerRespMsg
    | DisconnectPlayerRespMsg
    | PlayerReadyRespMsg
    | PlayerStepRespMsg
    | PlayerSetPositionsRespMsg
    | WinGameRespMsg;
