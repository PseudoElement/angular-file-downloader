import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { RTC_CONFIG } from '../constants/ice-servers';
import { SignalingClient } from '../entities/signaling-client';
import { CreateRoomReqBody } from '../models/http-models-to-server';
import { CreateRoomRespBody } from '../models/http-models-from-server';
import {
    PeerFromServer,
    WsMsgFromServer,
    WsConnectMsgFromServer,
    WsOfferMsgFromServer,
    WsAnswerMsgFromServer,
    WsPeerJoinedMsgFromServer,
    WsPeerLeftMsgFromServer
} from '../models/ws-models-from-server-ai';
import { WsOfferMsgToServer, WsAnswerMsgToServer } from '../models/ws-models-to-server-ai';

/**
 * Represents an active peer-to-peer connection with a remote participant.
 */
interface PeerConnectionEntry {
    pc: RTCPeerConnection;
    peerId: string;
    peerName: string;
    dataChannel: RTCDataChannel | null;
    audioElement: HTMLAudioElement | null;
}

/**
 * Multi-peer voice chat service using WebRTC mesh topology.
 *
 * Signaling flow:
 * ─────────────────────────────────────────────────────────────────────
 * 1. A new peer joins → connects WebSocket → server broadcasts the
 *    updated room state (CONNECT) or a targeted PEER_JOINED event
 *    to every existing participant.
 *
 * 2. Each existing participant detects the newcomer, creates a fresh
 *    RTCPeerConnection + offer, and sends it to the newcomer via the
 *    OFFER WebSocket action.
 *
 * 3. The newcomer receives each OFFER, creates an RTCPeerConnection,
 *    sets the remote offer, produces an answer, and sends it back via
 *    the ANSWER WebSocket action.
 *
 * 4. The existing participant sets the remote answer → ICE completes
 *    → audio flows in both directions.
 *
 * Glare prevention (both sides trying to offer simultaneously) is
 * handled by a deterministic tie-breaker: only the peer whose username
 * is lexicographically smaller creates the offer.
 * ─────────────────────────────────────────────────────────────────────
 */
@Injectable()
export class VoiceChatService implements OnDestroy {
    // ── Public observables ──────────────────────────────────────────
    /** All peers currently known in the room (includes self). */
    public readonly peers$ = new BehaviorSubject<PeerFromServer[]>([]);

    /** High-level connection state for UI feedback. */
    public readonly connectionState$ = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>('disconnected');

    // ── Public state ────────────────────────────────────────────────
    public username = '';
    public roomId = '';

    // ── Private state ───────────────────────────────────────────────
    /** One SignalingClient (WebSocket wrapper) shared by all peer connections. */
    public signalingClient: SignalingClient = new SignalingClient({
        onConnect: () => this.onSocketConnected(),
        onMessage: (msg) => this.onSocketMessage(msg)
    });

    /** Map of peerId → active RTCPeerConnection + metadata. */
    private peerConnections = new Map<string, PeerConnectionEntry>();

    /** Cached local audio MediaStream shared across all peer connections. */
    private localStream: MediaStream | null = null;

    /**
     * Peer IDs for which we have already initiated (or are in the process
     * of initiating) an offer. Prevents duplicate offers.
     */
    private pendingOffers = new Set<string>();

    constructor(
        private readonly httpClient: HttpClient,
        private readonly sintolModalSrv: SintolLibDynamicComponentService
    ) {}

    ngOnDestroy(): void {
        this.leaveRoom();
    }

    // ════════════════════════════════════════════════════════════════
    //  PUBLIC API
    // ════════════════════════════════════════════════════════════════

    /**
     * Create a new voice room (host flow).
     *
     * 1. Prompt user for name & room name.
     * 2. POST /voicechat/create to obtain a room_id.
     * 3. Acquire the local audio stream.
     * 4. Connect the signaling WebSocket.
     */
    public async createVoiceRoom(socketUrl: string): Promise<void> {
        this.username = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input your name.'
        });
        const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room name.'
        });

        const createRoomReqBody: CreateRoomReqBody = {
            host_name: this.username,
            max_ueers: 10,
            room_name: roomName
        };

        const resp = await firstValueFrom(
            this.httpClient.post<CreateRoomRespBody>(`${ENVIRONMENT.apiBaseUrl}/voicechat/create`, createRoomReqBody)
        );
        this.roomId = resp.data.room_id;

        await this.acquireLocalStream();
        this.connectSignaling(socketUrl);
    }

    /**
     * Join an existing voice room (guest flow).
     *
     * 1. Prompt user for name & room ID.
     * 2. Acquire the local audio stream.
     * 3. Connect the signaling WebSocket.
     */
    public async connectToRoom(socketUrl: string): Promise<void> {
        this.username = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input your name.'
        });
        this.roomId = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room id.'
        });

        await this.acquireLocalStream();
        this.connectSignaling(socketUrl);
    }

    /**
     * Leave the room – tear down every peer connection, stop local
     * tracks, notify the server, and close the WebSocket.
     */
    public leaveRoom(): void {
        // Close all RTCPeerConnections
        this.peerConnections.forEach((_entry, peerId) => {
            this.closePeerConnection(peerId);
        });
        this.peerConnections.clear();
        this.pendingOffers.clear();

        // Stop local audio
        this.stopLocalStream();

        // Notify server & disconnect WebSocket
        this.signalingClient.sendMsg(JSON.stringify({ action: 'DISCONNECT', data: { peer_name: this.username } }));
        this.signalingClient.disconnect();

        // Reset observable state
        this.peers$.next([]);
        this.connectionState$.next('disconnected');
    }

    /**
     * Broadcast a data-channel message to every connected peer.
     */
    public broadcastMessage(message: string): void {
        const payload = JSON.stringify({ name: this.username, msg: message });

        this.peerConnections.forEach((entry) => {
            if (entry.dataChannel?.readyState === 'open') {
                entry.dataChannel.send(payload);
            }
        });
    }

    /** Number of currently active peer connections. */
    public get activePeerCount(): number {
        return this.peerConnections.size;
    }

    /** Retrieve a specific peer connection entry (e.g. for UI). */
    public getPeerConnection(peerId: string): PeerConnectionEntry | undefined {
        return this.peerConnections.get(peerId);
    }

    // ════════════════════════════════════════════════════════════════
    //  SIGNALING – WebSocket helpers
    // ════════════════════════════════════════════════════════════════

    private connectSignaling(socketUrl: string): void {
        this.connectionState$.next('connecting');
        const wsUrl = `${socketUrl}/voicechat/ws/connect?room_id=${this.roomId}&peer_name=${this.username}`;
        this.signalingClient.connect(wsUrl);
    }

    private onSocketConnected(): void {
        console.log('[VoiceChatService] WebSocket connected');
        this.connectionState$.next('connected');
    }

    /**
     * Central WebSocket message router.
     */
    private onSocketMessage(msg: { data: string }): void {
        let parsed: WsMsgFromServer;
        try {
            parsed = JSON.parse(msg.data) as WsMsgFromServer;
        } catch (err) {
            console.error('[VoiceChatService] Failed to parse WS message:', err);
            return;
        }

        console.log('[VoiceChatService] WS ←', parsed.action, parsed);

        switch (parsed.action) {
            case 'CONNECT':
                this.handleConnect(parsed);
                break;
            case 'PEER_JOINED':
                this.handlePeerJoined(parsed);
                break;
            case 'OFFER':
                this.handleOffer(parsed);
                break;
            case 'ANSWER':
                this.handleAnswer(parsed);
                break;
            case 'PEER_LEFT':
                this.handlePeerLeft(parsed);
                break;
            default:
                console.warn('[VoiceChatService] Unknown WS action:', (parsed as any).action);
        }
    }

    // ════════════════════════════════════════════════════════════════
    //  SIGNALING – Incoming message handlers
    // ════════════════════════════════════════════════════════════════

    /**
     * CONNECT – the server sends the full room state.
     *
     * Received when we first connect AND whenever the room roster changes
     * (if the server re-broadcasts the state instead of sending
     * PEER_JOINED / PEER_LEFT individually).
     *
     * For every peer we don't already have a connection with, we decide
     * who should create the offer using a deterministic tie-breaker
     * (lexicographic username comparison). This prevents "glare" when
     * both sides try to offer at the same time.
     */
    private async handleConnect(msg: WsConnectMsgFromServer): Promise<void> {
        const { room } = msg.data;
        this.peers$.next(room.peers);

        for (const peer of room.peers) {
            if (peer.name === this.username) continue;
            if (this.peerConnections.has(peer.id)) continue;
            if (this.pendingOffers.has(peer.id)) continue;

            // Tie-breaker: the peer with the "smaller" username creates the offer.
            if (this.username < peer.name) {
                console.log(`[VoiceChatService] CONNECT → creating offer for ${peer.name} (${peer.id})`);
                await this.createOfferForPeer(peer.id, peer.name);
            } else {
                console.log(`[VoiceChatService] CONNECT → waiting for offer from ${peer.name} (${peer.id})`);
            }
        }
    }

    /**
     * PEER_JOINED – a single new peer entered the room.
     *
     * Only existing participants receive this. We always create an offer
     * for the newcomer because we know we are the "existing" side.
     */
    private async handlePeerJoined(msg: WsPeerJoinedMsgFromServer): Promise<void> {
        const { peer_id, peer_name } = msg.data;

        if (this.peerConnections.has(peer_id) || this.pendingOffers.has(peer_id)) {
            console.warn(`[VoiceChatService] Already connected / pending for ${peer_name}`);
            return;
        }

        console.log(`[VoiceChatService] PEER_JOINED → creating offer for ${peer_name} (${peer_id})`);
        await this.createOfferForPeer(peer_id, peer_name);
    }

    /**
     * OFFER – a remote peer sent us an SDP offer.
     *
     * We create a new RTCPeerConnection, set their offer as the remote
     * description, produce an answer, and send it back.
     */
    private async handleOffer(msg: WsOfferMsgFromServer): Promise<void> {
        const { peer_descriptor, from_peer_id, from_peer_name } = msg.data;

        console.log(`[VoiceChatService] OFFER ← ${from_peer_name} (${from_peer_id})`);

        // If we already have a connection for this peer, tear it down first
        // (renegotiation scenario).
        if (this.peerConnections.has(from_peer_id)) {
            console.log(`[VoiceChatService] Renegotiation: closing old PC for ${from_peer_name}`);
            this.closePeerConnection(from_peer_id);
        }

        // Also clear any pending offer we may have been preparing –
        // the other side won the race.
        this.pendingOffers.delete(from_peer_id);

        const pc = await this.buildPeerConnection(from_peer_id, from_peer_name);

        // Answer side: receive the data channel via the "datachannel" event.
        pc.addEventListener('datachannel', (event) => {
            console.log(`[VoiceChatService] datachannel event from ${from_peer_name}`);
            const entry = this.peerConnections.get(from_peer_id);
            if (entry) {
                entry.dataChannel = event.channel;
                this.setupDataChannel(event.channel, from_peer_name);
            }
        });

        // When all ICE candidates are gathered, send the complete answer.
        pc.addEventListener('icecandidate', (e) => {
            if (e.candidate) return; // still gathering

            const localDesc = pc.localDescription?.toJSON();
            if (!localDesc) return;

            console.log(`[VoiceChatService] Sending ANSWER → ${from_peer_name}`);
            const answerMsg: WsAnswerMsgToServer = {
                action: 'ANSWER',
                data: {
                    peer_descriptor: JSON.stringify(localDesc),
                    target_peer_id: from_peer_id,
                    peer_name: this.username
                }
            };
            this.signalingClient.sendMsg(JSON.stringify(answerMsg));
        });

        // Set the remote offer & create an answer.
        const remoteSDP = JSON.parse(peer_descriptor);
        await pc.setRemoteDescription(new RTCSessionDescription(remoteSDP));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log(`[VoiceChatService] Answer created for ${from_peer_name}`);
    }

    /**
     * ANSWER – a remote peer responded to our offer.
     *
     * Set their answer as the remote description on the matching
     * RTCPeerConnection.
     */
    private async handleAnswer(msg: WsAnswerMsgFromServer): Promise<void> {
        const { peer_descriptor, from_peer_id, from_peer_name } = msg.data;

        console.log(`[VoiceChatService] ANSWER ← ${from_peer_name} (${from_peer_id})`);

        const entry = this.peerConnections.get(from_peer_id);
        if (!entry) {
            console.warn(`[VoiceChatService] No RTCPeerConnection for ${from_peer_name} – ignoring answer`);
            return;
        }

        const remoteSDP = JSON.parse(peer_descriptor);
        await entry.pc.setRemoteDescription(new RTCSessionDescription(remoteSDP));
        this.pendingOffers.delete(from_peer_id);

        console.log(`[VoiceChatService] Remote description set for ${from_peer_name} – connection should complete`);
    }

    /**
     * PEER_LEFT – a participant left the room.
     *
     * Close the matching RTCPeerConnection and remove it from our map.
     */
    private handlePeerLeft(msg: WsPeerLeftMsgFromServer): void {
        const { peer_id } = msg.data;
        console.log(`[VoiceChatService] PEER_LEFT: ${peer_id}`);

        this.closePeerConnection(peer_id);
        this.pendingOffers.delete(peer_id);

        // Update the public peers list.
        const updated = this.peers$.value.filter((p) => p.id !== peer_id);
        this.peers$.next(updated);
    }

    // ════════════════════════════════════════════════════════════════
    //  WebRTC – Offer creation
    // ════════════════════════════════════════════════════════════════

    /**
     * Create a new RTCPeerConnection for `peerId`, produce an SDP offer,
     * and send it via the signaling channel.
     */
    private async createOfferForPeer(peerId: string, peerName: string): Promise<void> {
        this.pendingOffers.add(peerId);

        const pc = await this.buildPeerConnection(peerId, peerName);

        // Offer side: we create the data channel.
        const channel = pc.createDataChannel('chat');
        const entry = this.peerConnections.get(peerId);
        if (entry) {
            entry.dataChannel = channel;
        }
        this.setupDataChannel(channel, peerName);

        // When all ICE candidates are gathered, send the complete offer.
        pc.addEventListener('icecandidate', (e) => {
            if (e.candidate) return; // still gathering

            const localDesc = pc.localDescription?.toJSON();
            if (!localDesc) return;

            console.log(`[VoiceChatService] Sending OFFER → ${peerName}`);
            const offerMsg: WsOfferMsgToServer = {
                action: 'OFFER',
                data: {
                    peer_descriptor: JSON.stringify(localDesc),
                    target_peer_id: peerId,
                    peer_name: this.username
                }
            };
            this.signalingClient.sendMsg(JSON.stringify(offerMsg));
        });

        // Produce the offer.
        const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: false
        });
        await pc.setLocalDescription(offer);

        console.log(`[VoiceChatService] Offer created for ${peerName} (${peerId})`);
    }

    // ════════════════════════════════════════════════════════════════
    //  WebRTC – Shared RTCPeerConnection factory
    // ════════════════════════════════════════════════════════════════

    /**
     * Build a new RTCPeerConnection, attach the local audio tracks,
     * wire up track / connection-state listeners, and store it in the map.
     */
    private async buildPeerConnection(peerId: string, peerName: string): Promise<RTCPeerConnection> {
        const pc = new RTCPeerConnection(RTC_CONFIG);

        // Store immediately so later look-ups succeed.
        this.peerConnections.set(peerId, {
            pc,
            peerId,
            peerName,
            dataChannel: null,
            audioElement: null
        });

        // Attach local audio tracks so the remote side receives our audio.
        const stream = await this.getLocalStream();
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        // ── Remote track → play audio ───────────────────────────────
        pc.addEventListener('track', (event: RTCTrackEvent) => {
            console.log(`[VoiceChatService] track event from ${peerName}`, event);

            if (event.streams.length === 0) return;

            const audio = new Audio();
            audio.srcObject = event.streams[0];
            audio.play().catch((err) => console.warn(`[VoiceChatService] Audio autoplay blocked for ${peerName}:`, err));

            const entry = this.peerConnections.get(peerId);
            if (entry) {
                entry.audioElement = audio;
            }
        });

        // ── Connection state monitoring ─────────────────────────────
        pc.addEventListener('connectionstatechange', () => {
            const state = pc.connectionState;
            console.log(`[VoiceChatService] connectionState [${peerName}]: ${state}`);

            if (state === 'failed' || state === 'closed') {
                console.warn(`[VoiceChatService] Connection ${state} for ${peerName} – cleaning up`);
                this.closePeerConnection(peerId);
            }
        });

        pc.addEventListener('iceconnectionstatechange', () => {
            console.log(`[VoiceChatService] iceConnectionState [${peerName}]: ${pc.iceConnectionState}`);
        });

        pc.addEventListener('icegatheringstatechange', () => {
            console.log(`[VoiceChatService] iceGatheringState [${peerName}]: ${pc.iceGatheringState}`);
        });

        return pc;
    }

    // ════════════════════════════════════════════════════════════════
    //  WebRTC – Data channel helpers
    // ════════════════════════════════════════════════════════════════

    private setupDataChannel(channel: RTCDataChannel, peerName: string): void {
        channel.onopen = () => {
            console.log(`[VoiceChatService] DataChannel OPEN with ${peerName}`);
        };
        channel.onclose = () => {
            console.log(`[VoiceChatService] DataChannel CLOSED with ${peerName}`);
        };
        channel.onmessage = (e) => {
            console.log(`[VoiceChatService] DataChannel message from ${peerName}:`, e.data);
            // Extend here: forward to a Subject / callback for UI consumption.
        };
        channel.onerror = (e) => {
            console.error(`[VoiceChatService] DataChannel error with ${peerName}:`, e);
        };
    }

    // ════════════════════════════════════════════════════════════════
    //  WebRTC – Teardown helpers
    // ════════════════════════════════════════════════════════════════

    /**
     * Gracefully close a single peer connection and free resources.
     */
    private closePeerConnection(peerId: string): void {
        const entry = this.peerConnections.get(peerId);
        if (!entry) return;

        // Stop remote audio playback.
        if (entry.audioElement) {
            entry.audioElement.pause();
            entry.audioElement.srcObject = null;
        }

        entry.dataChannel?.close();
        entry.pc.close();

        this.peerConnections.delete(peerId);
        console.log(`[VoiceChatService] Closed RTCPeerConnection with ${entry.peerName}`);
    }

    // ════════════════════════════════════════════════════════════════
    //  Audio – Local stream management
    // ════════════════════════════════════════════════════════════════

    /**
     * Lazily acquire (and cache) the local audio MediaStream.
     */
    private async getLocalStream(): Promise<MediaStream> {
        if (!this.localStream) {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            console.log('[VoiceChatService] Local audio stream acquired');
        }
        return this.localStream;
    }

    /**
     * Acquire the stream without caching – alias used by the public API.
     */
    private async acquireLocalStream(): Promise<void> {
        await this.getLocalStream();
    }

    /**
     * Stop all local audio tracks and release the stream reference.
     */
    private stopLocalStream(): void {
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
            console.log('[VoiceChatService] Local audio stream stopped');
        }
    }
}
