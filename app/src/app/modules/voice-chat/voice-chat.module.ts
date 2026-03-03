import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceChatRoutingModule } from './voice-chat-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { VoiceChatComponent } from './components/voice-chat/voice-chat.component';

@NgModule({
    declarations: [VoiceChatComponent],
    imports: [CommonModule, VoiceChatRoutingModule, SharedModule]
})
export class VoiceChatModule {}
