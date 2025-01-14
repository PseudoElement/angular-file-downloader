import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeaBattleGameComponent } from './components/sea-battle-game/sea-battle-game.component';
import { SeaBattleRoutingModule } from './sea-battle-routing.module';
import { SeaBattleApiService } from './services/sea-battle-api.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { SeaBattleSocketService } from './services/sea-battle-socket.service';
import { SeaBattleActionsPanelComponent } from './components/sea-battle-actions-panel/sea-battle-actions-panel.component';
import { SeaBattleChatComponent } from './components/sea-battle-chat/sea-battle-chat.component';
import { SeaBattleChatMessageComponent } from './components/sea-battle-chat-message/sea-battle-chat-message.component';
import { SeaBattleFieldComponent } from './components/sea-battle-field/sea-battle-field.component';
import { SeaBattleRoomComponent } from './components/sea-battle-room/sea-battle-room.component';
import { SeaBattleRoomsListComponent } from './components/sea-battle-rooms-list/sea-battle-rooms-list.component';
import { SeaBattlePlayerActionsService } from './services/sea-battle-player-actions.service';

@NgModule({
    declarations: [
        SeaBattleGameComponent,
        SeaBattleActionsPanelComponent,
        SeaBattleChatComponent,
        SeaBattleChatMessageComponent,
        SeaBattleFieldComponent,
        SeaBattleRoomComponent,
        SeaBattleRoomsListComponent
    ],
    imports: [CommonModule, SeaBattleRoutingModule, SharedModule],
    providers: [SeaBattleApiService, SeaBattleSocketService, SeaBattlePlayerActionsService]
})
export class SeaBattleModule {}
