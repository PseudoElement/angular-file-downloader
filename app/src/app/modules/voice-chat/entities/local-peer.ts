export class LocalPeer {
    public init(): void {}

    public async speak(): Promise<MediaStream> {
        // get access to micropnohe
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('[LocalPeer_startVoice] stream ==>', stream);

        return stream;
    }

    public initSubs(): void {}
}
