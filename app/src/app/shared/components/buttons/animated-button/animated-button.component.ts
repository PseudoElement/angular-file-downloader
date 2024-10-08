import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-animated-button',
    templateUrl: './animated-button.component.html',
    styleUrl: './animated-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimatedButtonComponent {
    @Input() type: 'download' | 'link' = 'download';

    @Input() isDownloading: boolean = false;

    @Input() text: string = 'Download';
}
