import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MINI_GAMES } from '../../constants/mini-game-names';
import { ENVIRONMENT } from 'src/environments/environment';

@Component({
    selector: 'app-unknown-route',
    templateUrl: './unknown-route.component.html',
    styleUrl: './unknown-route.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnknownRouteComponent {
    public readonly availableGames = Object.values(MINI_GAMES);

    public getFullPath(gameName: string): string {
        const appDomain = ENVIRONMENT.appDomain;
        const protocol = appDomain.startsWith('localhost') ? 'http' : 'https';
        return `${protocol}://${appDomain}/mini-games/${gameName}`;
    }
}
