import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SOCIALS } from '../../constants/links';

@Component({
    selector: 'app-header',
    templateUrl: './app-header.component.html',
    styleUrl: './app-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
    public readonly socials = SOCIALS;
}
