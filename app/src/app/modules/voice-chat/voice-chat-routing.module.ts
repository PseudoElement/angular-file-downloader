import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoiceChatComponent } from './components/voice-chat/voice-chat.component';

const routes: Routes = [{ path: '', component: VoiceChatComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VoiceChatRoutingModule {}
