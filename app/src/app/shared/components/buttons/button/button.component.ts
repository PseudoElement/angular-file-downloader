import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonType } from 'src/app/shared/models/buttons';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
    @Input({ required: true }) text!: string;

    @Input() disabled: boolean = false;

    @Input() type: ButtonType = 'raised';

    @Output() onClick: EventEmitter<void> = new EventEmitter();

    public click(): void {
        if (!this.disabled) {
            this.onClick.emit();
        }
    }
}
