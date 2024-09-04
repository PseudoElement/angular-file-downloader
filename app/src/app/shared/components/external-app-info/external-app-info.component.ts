import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-external-app-info',
    templateUrl: './external-app-info.component.html',
    styleUrl: './external-app-info.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalAppInfoComponent {
    @Input({ required: true }) title!: string;

    @Input({ required: true }) img!: string;

    @Input({ required: true }) description!: string;

    @Input({ required: true }) onClick!: () => Promise<void>;

    /**
     * Whether downloading arrow is moving or not, use only where isDownloader prop = true
     */
    @Input() isDownloading: boolean = false;

    @Input() hasArrow: boolean = false;
}
