import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MAIN_SELECTOR_OPTIONS } from '../../constants/main-selector-options';

@Component({
    selector: 'app-container',
    templateUrl: './app-container.component.html',
    styleUrl: './app-container.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppContainerComponent {
    public readonly options = MAIN_SELECTOR_OPTIONS;
}
