import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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

    /**
     * Whether downloading arrow is moving or not, use only where isDownloader prop = true
     */
    @Input() isDownloading: boolean = false;

    @Input() isDownloader: boolean = false;

    @Input() maxDescriptionLength: number = 100;

    @Output() onButtonClick: EventEmitter<void> = new EventEmitter();

    public handleButtonClick(e: MouseEvent): void {
        e.stopPropagation();
        this.onButtonClick.emit();
    }
}
