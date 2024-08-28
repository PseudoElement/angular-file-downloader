import { Injectable } from '@angular/core';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { Downloads } from './models/download-types';

@Injectable()
export class DownloadService {
    private readonly downloads: Downloads = {
        txtFile: false,
        games: {}
    };

    public get isTxtFileDownloading(): boolean {
        return this.downloads.txtFile;
    }

    constructor(private readonly httpApi: HttpApiService) {}

    public toggleTxtFileDownloading(isDownloading: boolean): void {
        this.downloads.txtFile = isDownloading;
    }

    public toggleGamesDownloading(game: string, isDownloading: boolean): void {}

    public async downloadTxtFile(isSqlFile: boolean): Promise<void> {
        try {
            this.toggleTxtFileDownloading(true);
            // @TODO use POST request
            await this.httpApi.downloadFileGet('download/sql-file');
        } catch (err) {
            console.log('[DownloadService_downloadTxtFile] Error occured: ', err);
        } finally {
            this.toggleTxtFileDownloading(false);
        }
    }
}
