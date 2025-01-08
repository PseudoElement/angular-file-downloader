import { Injectable } from '@angular/core';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { ENVIRONMENT } from 'src/environments/environment';
import {
    ConnectRoomReqBody,
    CreateRoomReqBody,
    DisconnectRoomReqBody,
    RoomInfoReqBody,
    RoomInfoResp
} from '../models/sea-battle-api-types';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AlertsService } from 'src/app/shared/services/alerts.service';

@Injectable()
export class SeaBattleApiService {
    constructor(private readonly httpApi: HttpApiService, private readonly alertsSrv: AlertsService) {}

    public fetchRoomsMapFromBackend(): Promise<any> {
        return this.httpApi.get<RoomInfoResp>(`${ENVIRONMENT.apiBaseUrl}/seabattle/get-rooms`);
    }

    public createRoom(params: CreateRoomReqBody): Promise<RoomInfoResp> {
        return this.httpApi.get<RoomInfoResp>(`${ENVIRONMENT.apiBaseUrl}/seabattle/create`, {
            params: params as unknown as HttpParams
        });
    }

    public fetchRoomInfo(params: RoomInfoReqBody): Promise<RoomInfoResp> {
        return this.httpApi.get<RoomInfoResp>(`${ENVIRONMENT.apiBaseUrl}/seabattle/get-room-info`, {
            params: params as unknown as HttpParams
        });
    }

    public connectToRoom(params: ConnectRoomReqBody): WebSocket {
        let queryParams = '';
        let count = 0;
        for (const param in params) {
            queryParams += `${param}=${params[param as keyof ConnectRoomReqBody]}`;
            if (count < Object.keys(params).length - 1) {
                queryParams += '&';
            }
            count++;
        }

        const ws = new WebSocket(`${ENVIRONMENT.apiSocketUrl}/seabattle/connect?${queryParams}`);

        return ws;
    }

    public disconnectFromRoom(params: DisconnectRoomReqBody): Promise<{ message: string }> {
        return this.httpApi.get<{ message: string }>(`${ENVIRONMENT.apiBaseUrl}/seabattle/disconnect`, {
            params: params as unknown as HttpParams
        });
    }
}
