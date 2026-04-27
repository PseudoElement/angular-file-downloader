import { EnvConfig } from './model';

export const ENVIRONMENT: EnvConfig = {
    apiBaseUrl: 'https://bubamainer.fvds.ru/api/v1',
    apiSocketUrl: 'wss://bubamainer.fvds.ru/api/v1',
    appDomain: 'bubamainer.fvds.ru',
    iceServers: [
        { urls: 'turn:82.146.32.19:3478', credential: 'bimba', username: 'bimba' },
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.l.google.com:5349' },
        { urls: 'stun:stun1.l.google.com:3478' },
        { urls: 'stun:stun1.l.google.com:5349' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:5349' },
        { urls: 'stun:stun3.l.google.com:3478' },
        { urls: 'stun:stun3.l.google.com:5349' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:5349' }
    ]
};
