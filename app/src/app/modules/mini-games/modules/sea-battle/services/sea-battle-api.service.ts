import { Injectable } from '@angular/core';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { ENVIRONMENT } from 'src/environments/environment';
import { ConnectRoomReqBody, CreateRoomReqBody } from '../models/sea-battle-api-types';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AlertsService } from 'src/app/shared/services/alerts.service';

@Injectable()
export class SeaBattleApiService {
    private chatSocket: WebSocket | null = null;

    constructor(private readonly httpApi: HttpApiService, private readonly alertsSrv: AlertsService) {}

    public async createRoom(params: CreateRoomReqBody): Promise<void> {
        try {
            const resp = await this.httpApi.get<{ message: string }>(`${ENVIRONMENT.apiBaseUrl}/seabattle/create`, {
                params: params as unknown as HttpParams
            });
            this.alertsSrv.showAlert({ text: resp.message, type: 'success' });
        } catch (err) {
            console.log('API_createRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    public async connectToRoom(params: ConnectRoomReqBody): Promise<void> {
        try {
            const ws = new WebSocket(`${ENVIRONMENT.apiSocketUrl}/seabattle/connect`);
            ws.onerror = (err) => {
                console.log(err);
                this.alertsSrv.showAlert({ text: `Error occured trying to connect to room ${params.room_name}`, type: 'error' });
            };
            ws.onopen = () => {
                console.log('You connected!');
                this.chatSocket = ws;
                this.alertsSrv.showAlert({ text: `You connected to room ${params.room_id}!`, type: 'success' });
            };
        } catch (err) {
            console.log('API_connectToRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    public async disconnectFromRoom(params: CreateRoomReqBody): Promise<void> {
        try {
            const resp = await this.httpApi.get<{ message: string }>(`${ENVIRONMENT.apiBaseUrl}/seabattle/disconnect`, {
                params: params as unknown as HttpParams
            });
            this.alertsSrv.showAlert({ text: resp.message, type: 'success' });
        } catch (err) {
            // add alert
            console.log('API_disconnectFromRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }
}
