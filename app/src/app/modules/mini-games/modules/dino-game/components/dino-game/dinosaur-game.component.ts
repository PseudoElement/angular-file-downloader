import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DYNO_CONTAINER_ID } from '../../constants/common-consts';

@Component({
    selector: 'app-dinosaur-game',
    templateUrl: './dinosaur-game.component.html',
    styleUrl: './dinosaur-game.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DinosaurGameComponent {
    public readonly containerId = DYNO_CONTAINER_ID;
}
