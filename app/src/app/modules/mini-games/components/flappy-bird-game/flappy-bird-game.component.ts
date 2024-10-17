import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-flappy-bird-game',
  templateUrl: './flappy-bird-game.component.html',
  styleUrl: './flappy-bird-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlappyBirdGameComponent {

}
