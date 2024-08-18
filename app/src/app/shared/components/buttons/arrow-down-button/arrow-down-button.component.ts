import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-arrow-down-button',
    templateUrl: './arrow-down-button.component.html',
    styleUrl: './arrow-down-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrowDownButtonComponent {
    @Input() isOpen: boolean = false;
}
