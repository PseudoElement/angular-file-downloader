export class MediaStreamManager {
    private _videoEnabled: boolean = false;

    private _audioEnabled: boolean = false;

    public get videoEnabled(): boolean {
        return this._videoEnabled;
    }

    public get audioEnabled(): boolean {
        return this._audioEnabled;
    }

    private mediaStream: MediaStream | null = null;

    public async startMediaStream(): Promise<void> {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    public stopMediaStream(): void {
        if (!this.mediaStream) return;
        this.mediaStream.getTracks().forEach((track) => {
            track.stop();
        });
    }

    public broadcastMediaToPeer(pc: RTCPeerConnection): void {
        if (!this.mediaStream) return;
        this.mediaStream.getTracks().forEach((track) => {
            console.log('[broadcastMediaToPeer] track:', track);
            pc.addTrack(track, this.mediaStream!);
        });
        this._audioEnabled = true;
        this._videoEnabled = true;
    }

    public toggleYourVoice(enabled: boolean): void {
        if (!this.mediaStream) return;
        this.mediaStream.getAudioTracks().forEach((track) => {
            console.log('[toggleYourVoice] toggleVoice:', track);
            track.enabled = enabled;
        });
        this._audioEnabled = enabled;
    }

    public toggleYourVideo(enabled: boolean): void {
        if (!this.mediaStream) return;
        this.mediaStream.getVideoTracks().forEach((track) => {
            console.log('[toggleYourVideo] toggleVoice:', track);
            track.enabled = enabled;
        });
        this._videoEnabled = enabled;
    }
}
