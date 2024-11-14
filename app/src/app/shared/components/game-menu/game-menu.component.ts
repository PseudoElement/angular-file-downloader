import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MENU_BUTTONS, MenuButton, MenuButtonType, MenuState } from './constants/buttons';
import { MenuBestResultsInfo } from './models/models';

@Component({
    selector: 'app-game-menu',
    templateUrl: './game-menu.component.html',
    styleUrl: './game-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameMenuComponent implements OnChanges {
    @Input() state: Exclude<MenuState, 'hidden'> = 'start';

    @Input() bestResults: MenuBestResultsInfo = {};

    @Output() buttonClicked: EventEmitter<MenuButtonType> = new EventEmitter();

    private readonly _buttons$ = new BehaviorSubject<MenuButton[]>(MENU_BUTTONS.start);

    public readonly buttons$ = this._buttons$.asObservable();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['state']) {
            this._buttons$.next(MENU_BUTTONS[this.state]);
        }
    }

    public handleClick(btnType: MenuButtonType): void {
        this.buttonClicked.emit(btnType);
    }
}
