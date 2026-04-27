import { ENVIRONMENT } from 'src/environments/environment';

export const RTC_CONFIG: RTCConfiguration = {
    iceServers: ENVIRONMENT.iceServers
};
