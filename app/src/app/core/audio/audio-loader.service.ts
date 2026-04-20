import { Injectable } from '@angular/core';
import { AudioElementKey } from './models/models';

export type AudioElements = {
    [key in AudioElementKey]: HTMLAudioElement;
};

@Injectable({
    providedIn: 'root'
})
export class AudioLoaderService {
    public readonly audioElements: AudioElements = {
        COIN_EARN: new Audio(),
        DISCORD_JOIN: new Audio(),
        DISCORD_LEAVE: new Audio()
    };

    public init(): void {
        this.audioElements.COIN_EARN.src = 'assets/audio/coin-earn.mp3';
        this.audioElements.DISCORD_JOIN.src = 'assets/audio/discord-join.mp3';
        this.audioElements.DISCORD_LEAVE.src = 'assets/audio/discord-leave.mp3';
    }
}
