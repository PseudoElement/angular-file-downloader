import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dinosaur-game',
  templateUrl: './dinosaur-game.component.html',
  styleUrl: './dinosaur-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DinosaurGameComponent {

}
