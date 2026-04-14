import { Injectable } from '@angular/core';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { CreateRoomRespBody, RoomFromServer } from '../models/http-models-from-server';
import { ENVIRONMENT } from 'src/environments/environment';
import { CreateRoomReqBody } from '../models/http-models-to-server';

@Injectable({
    providedIn: 'root'
})
export class VoiceChatApiService {
    constructor(private readonly httpApi: HttpApiService) {}

    public async createRoom(createRoomReqBody: CreateRoomReqBody): Promise<CreateRoomRespBody> {
        return this.httpApi.post<CreateRoomRespBody>(`${ENVIRONMENT.apiBaseUrl}/voicechat/create`, createRoomReqBody);
    }

    public async fetchRoomById(id: string): Promise<RoomFromServer> {
        return this.httpApi.get<RoomFromServer>(`${ENVIRONMENT.apiBaseUrl}/voicechat/room?room_id=${id}`);
    }
}
