import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { BehaviorSubject } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { LocalPeer } from '../../entities/local-peer';

@Component({
    selector: 'app-voice-chat',
    templateUrl: './voice-chat.component.html',
    styleUrl: './voice-chat.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoiceChatComponent {
    public readonly _messages$ = new BehaviorSubject<Array<{ name: string; msg: string }>>([]);

    private rtcChannel: RTCDataChannel | null = null;

    public readonly messageCtrl = new FormControl<string>('', [Validators.required]);

    public username: string = '';

    private readonly rtcConfig: RTCConfiguration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
    };

    private pc: RTCPeerConnection | null = null;

    private localPeer = new LocalPeer();

    constructor(private readonly sintolModalSrv: SintolLibDynamicComponentService) {}

    private playTrack(event: RTCTrackEvent): void {
        console.log('[playTrack] event', event);
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play();
    }

    public async speak(): Promise<void> {
        const stream = await this.localPeer.speak();
        // get voice and send it to RTCPeerCoonection
        stream.getTracks().forEach((track) => {
            console.log('track ==>', track);
            this.pc!.addTrack(track, stream);
        });
    }

    /**
     * 1. Создатель вызывает createOffer и выставляет свой дескриптор в setLocalDescription себе
     * 2. Отправляет свой дескриптор на бэк
     * 3. Коннектящийся юзер загружает с бэка по id дексриптор создателя, устанавливает его setRemoteDescription и вызывает createAnswer()
     * 4. Коннектящийся выставляет setLocalDescription себе из createAnswer
     * 5. Затем отправляет свой дескриптор на бэк
     * 6. Затем создатель выставляет себе дескриптор другого пользователя, полученный с бэка и ставит его в setRemoteDescription
     */

    public async createRoom(): Promise<void> {
        this.pc = new RTCPeerConnection(this.rtcConfig);

        // 1. Add local tracks first
        await this.speak();

        this.username = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input your name.'
        });

        this.pc.addEventListener('track', this.playTrack);
        this.pc.addEventListener('icecandidate', (e) => {
            console.log('event icecandidate', e.candidate?.toJSON());
            if (!e.candidate) {
                console.log('localDescription ==>', JSON.stringify(this.pc!.localDescription?.toJSON()));
            }
        });
        this.pc.addEventListener('connectionstatechange', () => {
            console.log('Connection state:', this.pc!.connectionState);
        });
        this.pc.addEventListener('iceconnectionstatechange', () => {
            console.log('ICE connection state:', this.pc!.iceConnectionState);
        });

        const channel = this.pc.createDataChannel('chat');
        this.rtcChannel = channel;
        channel.onopen = () => {
            console.log('Data channel OPENED, readyState:', channel.readyState);
        };
        channel.onclose = () => {
            console.log('Data channel CLOSED');
        };
        channel.onmessage = (e) => {
            console.log('Received:', e.data);
            this._messages$.next([...this._messages$.value, JSON.parse(e.data)]);
        };
        channel.onerror = (e) => {
            console.log('channel.onerror:', e);
        };

        const offer = await this.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
        console.log('Called createOffer...');
        await this.pc.setLocalDescription(offer);
    }

    public async setRemoteDescriptor(): Promise<void> {
        const remoteSDP = JSON.parse((document.getElementById('remote-sdp') as HTMLTextAreaElement)!.value);
        return this.pc!.setRemoteDescription(new RTCSessionDescription(remoteSDP)).catch((err) =>
            console.log('setRemoteDescriptor err', err)
        );
    }

    public sendMessage(): void {
        if (!this.messageCtrl.valid) return;
        console.log('rtcChannel readyState:', this.rtcChannel?.readyState);
        console.log('pc connectionState:', this.pc?.connectionState);
        console.log('pc iceConnectionState:', this.pc?.iceConnectionState);
        if (this.rtcChannel?.readyState !== 'open') {
            console.warn('Channel not open yet! State:', this.rtcChannel?.readyState);
            return;
        }
        const msg = { name: this.username, msg: this.messageCtrl.value };
        this.rtcChannel.send(JSON.stringify(msg));
    }

    public disconnect(): void {
        this.rtcChannel?.close();
        this.pc?.close();
        this.rtcChannel = null;
        this.pc = null;
    }

    public async connectToRoom(): Promise<void> {
        this.pc = new RTCPeerConnection(this.rtcConfig);

        // 1. Add local tracks first
        await this.speak();

        this.pc.addEventListener('track', this.playTrack);
        this.pc.addEventListener('icecandidate', (e) => {
            console.log('event icecandidate', e);
            if (!e.candidate) {
                console.log('localDescription ==>', JSON.stringify(this.pc!.localDescription?.toJSON()));
            }
        });
        this.pc.addEventListener('connectionstatechange', () => {
            console.log('Connection state:', this.pc!.connectionState);
        });
        this.pc.addEventListener('iceconnectionstatechange', () => {
            console.log('ICE connection state:', this.pc!.iceConnectionState);
        });
        this.pc.addEventListener('datachannel', (event) => {
            console.log('datachannel event received!');
            this.rtcChannel = event.channel;
            this.rtcChannel.onmessage = (e) => {
                console.log('Received:', e.data);
                this._messages$.next([...this._messages$.value, JSON.parse(e.data)]);
            };
            this.rtcChannel.onopen = () => {
                console.log('Data channel OPENED on joiner, readyState:', this.rtcChannel!.readyState);
            };
            this.rtcChannel.onclose = () => {
                console.log('Data channel CLOSED on joiner');
            };
        });

        await this.setRemoteDescriptor();
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        console.log('Answer set as local description');
    }
}
