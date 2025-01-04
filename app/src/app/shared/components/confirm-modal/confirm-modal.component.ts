import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractModalComp } from 'dynamic-rendering/lib/types/dynamic-comp-srv-types';
import { FormControl } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrl: './confirm-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('showHideAnimation', [
            transition(':enter', [
                style({ transform: 'translate(-50%, -30%)', opacity: 0 }),
                animate('200ms', style({ transform: 'translate(-50%, -50%)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translate(-50%, -50%)', opacity: 1 }),
                animate('200ms', style({ transform: 'translate(-50%, -30%)', opacity: 0 }))
            ])
        ])
    ]
})
export class ConfirmModalComponent implements AbstractModalComp<string> {
    @Input({ required: true }) title: string = '';

    @Input({ required: true }) text: string = '';

    @Input() width: number = 400;

    @Input() height: number = 300;

    @Output() returnedValue: EventEmitter<string> = new EventEmitter();

    public close: () => void = () => {};

    public readonly valueCtrl = new FormControl<string>('');

    public accept(): void {
        this.returnedValue.emit(this.valueCtrl.value!);
        this.close();
    }
}
