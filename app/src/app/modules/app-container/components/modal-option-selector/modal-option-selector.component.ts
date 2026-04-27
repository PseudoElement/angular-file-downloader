import { ChangeDetectionStrategy, Component, EventEmitter } from '@angular/core';
import { MAIN_SELECTOR_OPTIONS } from '../../constants/main-selector-options';
import { AbstractModalComp } from 'dynamic-rendering';

@Component({
    selector: 'app-modal-option-selector',
    templateUrl: './modal-option-selector.component.html',
    styleUrl: './modal-option-selector.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionSelectorModalComponent extends AbstractModalComp<void> {
    public readonly options = MAIN_SELECTOR_OPTIONS;

    public returnedValue: EventEmitter<void> = new EventEmitter();

    public handleClose(): void {
        console.log('handleClose_handleClose');
        this.close();
    }
}
