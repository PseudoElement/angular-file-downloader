import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TG_BOTS } from '../../constants/tg-bots-list';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { TelegramBotUiInfo } from '../../models/tg-bot';

@Component({
    selector: 'app-bots-list',
    templateUrl: './bots-list.component.html',
    styleUrl: './bots-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BotsListComponent {
    public readonly bots = TG_BOTS;

    constructor(private readonly sintolModalSrv: SintolLibDynamicComponentService) {}

    public async onBotCardClick(bot: TelegramBotUiInfo): Promise<void> {
        await this.sintolModalSrv.openConfirmModal(ModalComponent, {
            isConfirmModal: false,
            title: bot.title,
            text: bot.description,
            height: 300,
            width: 450
        });
    }

    public onButtonClick(link: string): void {
        window.open(link, '_blank');
    }
}
