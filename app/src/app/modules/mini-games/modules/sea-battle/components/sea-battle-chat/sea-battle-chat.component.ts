import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SocketRespMsg } from '../../models/sea-battle-socket-resp-types';

@Component({
    selector: 'app-sea-battle-chat',
    templateUrl: './sea-battle-chat.component.html',
    styleUrl: './sea-battle-chat.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleChatComponent {
    @Input({ required: true }) messages: SocketRespMsg[] = [];
}
