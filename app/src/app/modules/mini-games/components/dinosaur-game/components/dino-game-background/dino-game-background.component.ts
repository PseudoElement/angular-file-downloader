import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

@Component({
    selector: 'app-dino-game-background',
    templateUrl: './dino-game-background.component.html',
    styleUrl: './dino-game-background.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DinoGameBackgroundComponent {
    @Input() isActive: boolean = true;

    public readonly imgWidth = 630;

    public readonly imgHeight = 380;

    public readonly imgSrc = '../../../../../../../assets/games/desert-background.png';

    public readonly imagesLen = Array.from({ length: 30 });

    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        const root = document.documentElement;
        const marginRight = 0; // change it if margin-right was changed in css (img tag) - default 10px
        const translateX = -(this.imgWidth * this.imagesLen.length + marginRight * this.imagesLen.length);

        root.style.setProperty('--start', translateX + 'px');
        root.style.setProperty('--end', 0 + 'px');
    }
}
