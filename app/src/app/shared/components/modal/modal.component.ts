import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractModalComp } from 'dynamic-rendering';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
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
export class ModalComponent implements AbstractModalComp<boolean> {
    @Input({ required: true }) title: string = '';

    @Input({ required: true }) text: string = '';

    @Input() isConfirmModal: boolean = false;

    @Input() width: number = 400;

    @Input() height: number = 300;

    @Output() returnedValue: EventEmitter<boolean> = new EventEmitter();

    ngOnInit(): void {}

    public value = false;

    public close: () => void = () => {};

    public accept(): void {
        this.returnedValue.emit(true);
        this.close();
    }

    public reject(): void {
        this.returnedValue.emit(false);
        this.close();
    }
}
