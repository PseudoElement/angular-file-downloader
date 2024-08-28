import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-download-button',
    templateUrl: './download-button.component.html',
    styleUrl: './download-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadButtonComponent {
    @Input() isDownloading: boolean = false;
}
