import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpApiService {
    private readonly baseUrl = ENVIRONMENT.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    public async get<T>(path: string, options?: { params?: HttpParams; headers?: HttpHeaders }): Promise<T> {
        return firstValueFrom(
            this.httpClient.get<T>(path, {
                headers: { 'Content-Type': 'application/json', ...options?.headers },
                params: options?.params,
                responseType: 'json'
            })
        );
    }

    public async post<T>(path: string, body: object, headers?: HttpHeaders): Promise<T> {
        return firstValueFrom(this.httpClient.post<T>(path, body, { headers }));
    }

    public async downloadFilePost(path: string, body: object, fileName?: string, headers?: HttpHeaders): Promise<void> {
        const res = await firstValueFrom(
            this.httpClient.post(`${this.baseUrl}/${path}`, body, {
                headers: { 'Content-Type': 'application/json', ...headers },
                responseType: 'blob'
            })
        );
        const binaryData = [res];
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(new Blob(binaryData, { type: res.type }));
        downloadLink.setAttribute('download', fileName || 'table');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
    }

    public async downloadFileGet(path: string, fileName: string, options?: { params?: HttpParams; headers?: HttpHeaders }): Promise<void> {
        const res = await firstValueFrom(
            this.httpClient.get(`${this.baseUrl}/${path}`, {
                headers: options?.headers,
                params: options?.params,
                responseType: 'blob'
            })
        );
        const binaryData = [res];
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(new Blob(binaryData, { type: res.type }));
        downloadLink.setAttribute('download', fileName);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
    }
}
