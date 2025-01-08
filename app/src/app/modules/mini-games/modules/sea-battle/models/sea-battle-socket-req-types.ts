import { SocketRespType } from '../constants/socket-constants';

interface BaseSocketReqMsg<T> {
    player_email: string;
    action_type: SocketRespType;
    data: T;
}

// example ->  step: "K1"
type NewStepReqMsg = BaseSocketReqMsg<{ step: string }>;

type SetPlayerPositionsReqMsg = BaseSocketReqMsg<{ player_positions: string }>;

export type SocketReqMsg = NewStepReqMsg | SetPlayerPositionsReqMsg;
