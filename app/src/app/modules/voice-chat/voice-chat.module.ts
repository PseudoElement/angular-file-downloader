import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceChatRoutingModule } from './voice-chat-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { VoiceChatComponent } from './components/voice-chat/voice-chat.component';
import { VoiceChatRoomService } from './services/voice-chat-room.service';
import { VoiceRoomPageComponent } from './components/voice-room-page/voice-room-page.component';
import { VoiceRoomsListComponent } from './components/voice-rooms-list/voice-rooms-list.component';
import { VoicechatMainPageComponent } from './components/voicechat-main-page/voicechat-main-page.component';
import { VoiceChatRoomsService } from './services/voice-chat-rooms.service';

@NgModule({
    declarations: [VoiceChatComponent, VoiceRoomPageComponent, VoiceRoomsListComponent, VoicechatMainPageComponent],
    imports: [CommonModule, VoiceChatRoutingModule, SharedModule],
    providers: [VoiceChatRoomsService]
})
export class VoiceChatModule {}
