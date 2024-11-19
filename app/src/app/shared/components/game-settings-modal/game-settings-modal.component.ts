import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AbstractModalComp } from 'dynamic-rendering/lib/types/dynamic-comp-srv-types';
import { PlayerKeyboardAction } from 'src/app/modules/mini-games/modules/dino-game/models/game-objects-types';
import { KeysMap } from 'src/app/modules/mini-games/modules/dino-game/services/dino-game-controls.service';
import { clone } from 'src/app/utils/deep-clone';

type KeysArray = Array<{
    key: PlayerKeyboardAction;
    value: string;
    friendlyValue: string;
}>;

@Component({
    selector: 'app-game-controls-modal',
    templateUrl: './game-settings-modal.component.html',
    styleUrl: './game-settings-modal.component.scss',
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
export class GameSettingsModalComponent implements AbstractModalComp<KeysMap>, OnInit {
    @Input({ required: true }) initialKeyBindings: KeysMap = {} as KeysMap;

    @Output() returnedValue: EventEmitter<KeysMap> = new EventEmitter<KeysMap>();

    public close = () => {};

    public newKeyBindings!: KeysMap;

    public activeKey: PlayerKeyboardAction | '' = '';

    public get keysBindingsToArray(): KeysArray {
        return Object.entries(this.newKeyBindings).map((el) => ({
            key: el[0] as PlayerKeyboardAction,
            value: el[1].value,
            friendlyValue: el[1].friendlyValue
        }));
    }

    @HostListener('window:keydown', ['$event']) public onKeyDown(e: KeyboardEvent): void {
        if (!this.activeKey) return;
        this.newKeyBindings[this.activeKey].value = e.code;
        this.newKeyBindings[this.activeKey].friendlyValue = e.key;
    }

    ngOnInit() {
        console.log(this.initialKeyBindings);
        this.newKeyBindings = clone(this.initialKeyBindings);
    }

    public handleKeyValueClick(e: Event, key: PlayerKeyboardAction): void {
        e.stopPropagation();
        if (this.activeKey === key) this.selectKey('');
        else this.selectKey(key);
    }

    public reset(): void {
        this.selectKey('');
    }

    public selectKey(key: PlayerKeyboardAction | ''): void {
        this.activeKey = key;
    }

    public saveKeyBindings(): void {
        this.selectKey('');
        this.returnedValue.emit(this.newKeyBindings);
        this.close();
    }

    public cancel(): void {
        this.selectKey('');
        this.returnedValue.emit(this.initialKeyBindings);
        this.close();
    }
}
