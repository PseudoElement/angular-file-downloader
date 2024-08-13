import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-text-files-downloader-page',
    templateUrl: './text-files-downloader.component.html',
    styleUrl: './text-files-downloader.component.scss'
})
export class TextFilesDownloaderPageComponent {
    public readonly testControl = new FormControl('s12asdas', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]);
}
