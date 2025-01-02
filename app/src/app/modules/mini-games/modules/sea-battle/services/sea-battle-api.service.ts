import { Injectable } from '@angular/core';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { ENVIRONMENT } from 'src/environments/environment';
import { ConnectRoomReqBody, CreateRoomReqBody, RoomInfoReqBody, RoomInfoResp } from '../models/sea-battle-api-types';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AlertsService } from 'src/app/shared/services/alerts.service';

@Injectable()
export class SeaBattleApiService {
    constructor(private readonly httpApi: HttpApiService, private readonly alertsSrv: AlertsService) {}

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

    public async disconnectFromRoom(params: CreateRoomReqBody): Promise<void> {
        try {
            const resp = await this.httpApi.get<{ message: string }>(`${ENVIRONMENT.apiBaseUrl}/seabattle/disconnect`, {
                params: params as unknown as HttpParams
            });
            this.alertsSrv.showAlert({ text: resp.message, type: 'success' });
        } catch (err) {
            console.log('API_disconnectFromRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }
}
