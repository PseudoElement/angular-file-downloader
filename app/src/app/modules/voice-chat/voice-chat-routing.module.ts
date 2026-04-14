import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoicechatMainPageComponent } from './components/voicechat-main-page/voicechat-main-page.component';
import { VoiceRoomPageComponent } from './components/voice-room-page/voice-room-page.component';
import { voiceRoomResolver } from './resolvers/voice-room-resolver';
import { activationGuard } from './guards/activation.guard';

const routes: Routes = [
    { path: '', component: VoicechatMainPageComponent },
    { path: 'room/:id', component: VoiceRoomPageComponent, canActivate: [activationGuard], resolve: { roomInfo: voiceRoomResolver } }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VoiceChatRoutingModule {}
