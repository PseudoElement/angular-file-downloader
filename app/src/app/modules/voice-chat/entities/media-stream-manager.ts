export class MediaStreamManager {
    private _videoEnabled: boolean = false;

    private _audioEnabled: boolean = false;

    public get videoEnabled(): boolean {
        return this._videoEnabled;
    }

    public get audioEnabled(): boolean {
        return this._audioEnabled;
    }

    private _hasWebCamera: boolean = false;

    public get hasWebCamera(): boolean {
        return this._hasWebCamera;
    }

    private _hasMicrophone: boolean = false;

    public get hasMicrophone(): boolean {
        return this._hasMicrophone;
    }

    private mediaStream: MediaStream | null = null;

    public async startMediaStream(onMediaStreamStart?: (mediaStream: MediaStream) => void): Promise<void> {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('[startMediaStream] devices:', devices);
        const airpods = devices.find((d) => d.kind === 'audioinput' && d.label.toLowerCase().includes('airpods'));

        this._hasWebCamera = !!devices.find((d) => d.kind === 'videoinput');
        this._hasMicrophone = !!devices.find((d) => d.kind === 'audioinput');

        //@ts-ignore
        const allowedCamera = await navigator.permissions.query({ name: 'camera' }).then((d) => d.state === 'granted');

        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                ...(airpods && { deviceId: { exact: airpods.deviceId } })
            },
            video: this._hasWebCamera && allowedCamera
        });
        onMediaStreamStart?.(this.mediaStream);
    }

    public stopMediaStream(): void {
        if (!this.mediaStream) return;
        this.mediaStream.getTracks().forEach((track) => {
            track.stop();
        });
    }

    public broadcastAudioToPeer(pc: RTCPeerConnection): void {
        if (!this.mediaStream) return;
        this.mediaStream.getAudioTracks().forEach((track) => {
            console.log('[broadcastAudioToPeer] track:', track);
            pc.addTrack(track, this.mediaStream!);
        });
        this._audioEnabled = true;
    }

    public broadcastVideoToPeer(pc: RTCPeerConnection): void {
        if (!this.mediaStream) return;
        this.mediaStream.getVideoTracks().forEach((track) => {
            console.log('[broadcastVideoToPeer] track:', track);
            pc.addTrack(track, this.mediaStream!);
        });
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
        if (enabled) {
            const myVideoEl = document.getElementById('video-tag-my') as HTMLVideoElement | null;
            if (!myVideoEl) {
                console.log('[toggleYourVideo] video-tag-my element not found by id!');
                return;
            }
            myVideoEl.srcObject = this.mediaStream;
            myVideoEl.muted = true;
        }
    }
}
