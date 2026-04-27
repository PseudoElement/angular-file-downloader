import { EnvConfig } from './model';

export const ENVIRONMENT: EnvConfig = {
    apiBaseUrl: 'http://localhost:8081/api/v1',
    apiSocketUrl: 'ws://localhost:8081/api/v1',
    appDomain: 'localhost:4200',
    iceServers: [
        { urls: 'turn:127.0.0.1:3478', credential: 'bimba', username: 'bimba' },
        { urls: 'turn:192.168.1.102:3478', credential: 'bimba', username: 'bimba' },
        { urls: 'turn:172.16.9.1:3478', credential: 'bimba', username: 'bimba' }
    ]
};
