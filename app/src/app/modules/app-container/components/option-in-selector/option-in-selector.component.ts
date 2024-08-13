import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MainSelectorOption } from '../../models/components-types';
import { animate, style, transition, trigger } from '@angular/animations';
import { ENVIRONMENT } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
    selector: 'app-option-in-selector',
    templateUrl: './option-in-selector.component.html',
    styleUrl: './option-in-selector.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('showHideAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(-100%)', opacity: 0 }),
                animate('200ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('200ms', style({ transform: 'translateX(-100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class OptionInSelectorComponent {
    @Input({ required: true }) info!: MainSelectorOption;

    public get hasChildren(): boolean {
        return this.info.children.length > 0;
    }

    constructor(private readonly router: Router) {}

    public trackByFn(_: number, option: MainSelectorOption): string {
        return option.value;
    }

    public needShowChildren(option: MainSelectorOption): boolean {
        return option.children.length > 0 && option.isOpen;
    }

    public getOptionWithDimmedBG(option: MainSelectorOption, parentRGB: string): MainSelectorOption {
        const rgbNums = parentRGB.split('(')[1].split(')')[0].split(', ');
        const newRgbNums = (rgbNums || []).map((num) => Number(num) - 35).join(', ');
        const newBG = `rgb(${newRgbNums})`;
        option.bgColorRGB = newBG;
        return option;
    }

    public handleClick(option: MainSelectorOption): void {
        if (option.navigationUrl) {
            this.navigateByUrl(option.navigationUrl);
        }
        if (option.children.length) {
            option.isOpen = !option.isOpen;
        }
    }

    private navigateByUrl(link: string): void {
        const appDomain = ENVIRONMENT.appDomain;
        const urlWithoutProtocol = link.replace(/http?.:\/\//gi, '');
        const domain = urlWithoutProtocol.split('/')[0];
        if (link.includes('https') && domain !== appDomain) {
            window.open(link, '_blank');
        } else {
            this.router.navigate([link]);
        }
    }
}
