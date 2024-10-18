import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { DinoGameService } from '../../services/dino-game.service';

@Component({
    selector: 'app-dino-game-background',
    templateUrl: './dino-game-background.component.html',
    styleUrl: './dino-game-background.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DinoGameBackgroundComponent implements OnDestroy, OnInit {
    constructor(private readonly dynoGameSrv: DinoGameService) {}

    ngOnInit(): void {
        this.dynoGameSrv.startGame();
    }

    ngOnDestroy(): void {
        this.dynoGameSrv.endGame();
    }

    public readonly bgAnimation$ = this.dynoGameSrv.bgAnimationStyle$;
}
