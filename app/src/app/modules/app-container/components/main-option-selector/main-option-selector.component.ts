import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MainSelectorOption } from '../../models/components-types';

@Component({
    selector: 'app-main-option-selector',
    templateUrl: './main-option-selector.component.html',
    styleUrl: './main-option-selector.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainOptionSelectorComponent {
    @Input({ required: true }) options!: MainSelectorOption[];
}
