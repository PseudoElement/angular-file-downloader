import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MainSelectorOption } from '../../models/components-types';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-option-in-selector',
    templateUrl: './option-in-selector.component.html',
    styleUrl: './option-in-selector.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('showHideAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('200ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('200ms', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class OptionInSelectorComponent {
    @Input({ required: true }) info!: MainSelectorOption;

    public get hasChildren(): boolean {
        return this.info.children.length > 0;
    }

    public trackByFn(_: number, option: MainSelectorOption): string {
        return option.value;
    }

    public getOptionWithDimmedBG(option: MainSelectorOption, parentRGB: string): MainSelectorOption {
        const rgbNums = parentRGB.split('(')[1].split(')')[0].split(', ');
        const newRgbNums = (rgbNums || []).map((num) => Number(num) - 15).join(', ');
        const newBG = `rgb(${newRgbNums})`;

        return { ...option, bgColorRGB: newBG };
    }

    public toggleOption(option: MainSelectorOption): void {
        if (!this.hasChildren) return;
        option.isOpen = !option.isOpen;
    }
}
