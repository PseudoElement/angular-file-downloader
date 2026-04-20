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
        const initialStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const preferredMic = devices.find((d) => d.kind === 'audioinput' && d.label.toLowerCase().includes('airpods'));

        if (preferredMic) {
            initialStream.getTracks().forEach((t) => t.stop());
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: preferredMic.deviceId } }
            });
        } else {
            this.mediaStream = initialStream;
        }
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
            track.enabled = enabled;
        });
        this._audioEnabled = enabled;
    }

    public toggleYourVideo(enabled: boolean): void {
        if (!this.mediaStream) return;
        this.mediaStream.getVideoTracks().forEach((track) => {
            track.enabled = enabled;
        });
        this._videoEnabled = enabled;
    }
}
