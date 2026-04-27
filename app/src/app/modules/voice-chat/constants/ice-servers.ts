import { ENVIRONMENT } from 'src/environments/environment';

export const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        ...ENVIRONMENT.iceServers
        // { urls: 'turn:82.146.32.19' },
        // { urls: 'stun:stun.l.google.com:19302' },
        // { urls: 'stun:stun1.l.google.com:19302' },
        // { urls: 'stun:stun.l.google.com:5349' },
        // { urls: 'stun:stun1.l.google.com:3478' },
        // { urls: 'stun:stun1.l.google.com:5349' },
        // { urls: 'stun:stun2.l.google.com:19302' },
        // { urls: 'stun:stun2.l.google.com:5349' },
        // { urls: 'stun:stun3.l.google.com:3478' },
        // { urls: 'stun:stun3.l.google.com:5349' },
        // { urls: 'stun:stun4.l.google.com:19302' },
        // { urls: 'stun:stun4.l.google.com:5349' }
    ]
};
