import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpApiService {
    private readonly baseUrl = ENVIRONMENT.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    public async get<T>(path: string, options?: { params?: HttpParams; headers?: HttpHeaders }): Promise<T> {
        return firstValueFrom(
            this.httpClient.get<T>(`${this.baseUrl}/${path}`, {
                headers: options?.headers,
                params: options?.params,
                responseType: 'json'
            })
        );
    }

    public async post<T>(path: string, body: object, headers?: HttpHeaders): Promise<T> {
        return firstValueFrom(this.httpClient.post<T>(`${this.baseUrl}/${path}`, body, { headers }));
    }
}
