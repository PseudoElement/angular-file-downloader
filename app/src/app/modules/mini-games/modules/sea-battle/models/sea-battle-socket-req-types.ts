interface BaseSocketReqMsg<T> {
    player_email: string;
    data: T;
}

// example ->  step: "K1"
type NewStepReqMsg = BaseSocketReqMsg<{ step: string }>;

type SetPlayerPositionsReqMsg = BaseSocketReqMsg<{ player_positions: string }>;

export type SocketReqMsg = NewStepReqMsg | SetPlayerPositionsReqMsg;
