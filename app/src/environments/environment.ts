import { EnvConfig } from './model';

export const ENVIRONMENT: EnvConfig = {
    apiBaseUrl: 'http://localhost:8081/api/v1',
    apiSocketUrl: 'ws://localhost:8081/api/v1',
    appDomain: 'localhost:4200',
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.l.google.com:5349' },
        { urls: 'stun:stun1.l.google.com:3478' }
    ]
};
