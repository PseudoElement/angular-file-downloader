export const STEP_RESULT = {
    HIT: 'HIT',
    MISS: 'MISS',
    KILL: 'KILL',
    ALREADY_CHECKED: 'ALREADY_CHECKED'
} as const;

export type StepResult = (typeof STEP_RESULT)[keyof typeof STEP_RESULT];

export const SOCKET_RESP_TYPE = {
    CONNECT_PLAYER: 'CONNECT_PLAYER',
    DISCONNECT_PLAYER: 'DISCONNECT_PLAYER',
    STEP: 'STEP',
    SET_PLAYER_POSITIONS: 'SET_PLAYER_POSITIONS',
    WIN_GAME: 'WIN_GAME',
    ERROR: 'ERROR',
    READY: 'READY',
    START_GAME: 'START_GAME'
} as const;

export type SocketRespType = (typeof SOCKET_RESP_TYPE)[keyof typeof SOCKET_RESP_TYPE];

export const ROOM_STATUS = {
    IDLE: 'IDLE',
    END: 'WIN',
    READY_TO_START: 'READY_TO_START',
    DELAY_BEFORE_NEXT_STEP: 'DELAY_BEFORE_NEXT_STEP',
    READY_YOUR_NEXT_STEP: 'READY_MAKE_NEXT_STEP',
    READY_ENEMY_NEXT_STEP: 'READY_ENEMY_NEXT_STEP'
} as const;

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];
