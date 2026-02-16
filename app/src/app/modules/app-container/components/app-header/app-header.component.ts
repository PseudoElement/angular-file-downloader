import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SOCIALS } from '../../constants/links';
import { ViewportService } from 'src/app/shared/services/viewport.service';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { OptionSelectorModalComponent } from '../modal-option-selector/modal-option-selector.component';

@Component({
    selector: 'app-header',
    templateUrl: './app-header.component.html',
    styleUrl: './app-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
    public readonly socials = SOCIALS;

    public readonly dimension$ = this.viewportSrv.dimension$;

    constructor(
        private readonly viewportSrv: ViewportService,
        private readonly sintolModalSrv: SintolLibDynamicComponentService
    ) {}

    public async openSelectorModal(): Promise<void> {
        await this.sintolModalSrv.openConfirmModal<OptionSelectorModalComponent, void>(OptionSelectorModalComponent, {}, undefined, () =>
            console.log('CLOSE_CALLED')
        );
    }
}
