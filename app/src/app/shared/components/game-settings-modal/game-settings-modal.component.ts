import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractModalComp } from 'dynamic-rendering/lib/types/dynamic-comp-srv-types';
import { CommonGameSettings } from 'src/app/modules/mini-games/models/common-settings-types';
import { PlayerKeyboardAction } from 'src/app/modules/mini-games/modules/dino-game/models/game-objects-types';
import { KeysBindings } from 'src/app/modules/mini-games/modules/dino-game/models/key-bindings-types';
import { clone } from 'src/app/utils/deep-clone';

type KeysArray = Array<{
    key: PlayerKeyboardAction;
    value: string;
    friendlyValue: string;
}>;

export interface SettingsReturnedValue {
    keyBindings: KeysBindings;
    isMuted: boolean;
}

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
export class GameSettingsModalComponent implements AbstractModalComp<SettingsReturnedValue>, OnInit {
    @Input({ required: true }) initialKeyBindings: KeysBindings = {} as KeysBindings;

    @Input({ required: true }) settings: CommonGameSettings = { isMuted: false };

    @Output() returnedValue: EventEmitter<SettingsReturnedValue> = new EventEmitter<SettingsReturnedValue>();

    public close = () => {};

    public newKeyBindings!: KeysBindings;

    public activeKey: PlayerKeyboardAction | '' = '';

    public isMutedCtrl = new FormControl<boolean>(false);

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
        this.newKeyBindings = clone(this.initialKeyBindings);
        this.isMutedCtrl.setValue(this.settings.isMuted);
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
        this.returnedValue.emit({ keyBindings: this.newKeyBindings, isMuted: !!this.isMutedCtrl.value });
        this.close();
    }

    public cancel(): void {
        this.selectKey('');
        this.returnedValue.emit({ keyBindings: this.initialKeyBindings, isMuted: this.settings.isMuted });
        this.close();
    }
}
