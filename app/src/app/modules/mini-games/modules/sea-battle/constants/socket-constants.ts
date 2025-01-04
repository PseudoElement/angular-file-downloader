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
    ERROR: 'ERROR'
} as const;

export type SocketRespType = (typeof SOCKET_RESP_TYPE)[keyof typeof SOCKET_RESP_TYPE];

export const ROOM_STATE = {
    PLAYING: 'PLAYING',
    IDLE: 'IDLE',
    END: 'WIN'
} as const;

export type RoomState = (typeof ROOM_STATE)[keyof typeof ROOM_STATE];
