import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class VoiceChatService {
    constructor(private readonly httpClient: HttpClient) {}

    /**
     * creator name,
     */
    public createVoiceRoom({}): void {}
}
