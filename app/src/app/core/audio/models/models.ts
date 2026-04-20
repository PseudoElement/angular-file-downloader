export const AUDIO_ELEMENT_KEY = {
    COIN_EARN: 'COIN_EARN',
    DISCORD_JOIN: 'DISCORD_JOIN',
    DISCORD_LEAVE: 'DISCORD_LEAVE'
} as const;

export type AudioElementKey = (typeof AUDIO_ELEMENT_KEY)[keyof typeof AUDIO_ELEMENT_KEY];
