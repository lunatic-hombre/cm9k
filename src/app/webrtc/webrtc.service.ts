import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

const iceServers: RTCIceServer[] = [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
  {
    urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
    username: 'webrtc',
    credential: 'webrtc',
  },
];

export enum ChannelState {
  OPEN, CLOSED
}

export interface PeerChannel {
  send(message: string): void;
  inbound(): Observable<string>;
  state(): Observable<ChannelState>;
}

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {

  connect(): Promise<PeerChannel> {
    try {
      // Connecting
      const localConnection = new RTCPeerConnection({
        iceServers
      });
      const remoteConnection = new RTCPeerConnection({
        iceServers
      });
      localConnection.onicecandidate = e => !e.candidate
        || remoteConnection.addIceCandidate(e.candidate)
          .catch(err => console.error('Failed to connect ICE candidate', err));
      remoteConnection.onicecandidate = e => !e.candidate
        || localConnection.addIceCandidate(e.candidate)
          .catch(err => console.error('Failed to connect ICE candidate', err));

      const stateChangeSubject = new Subject<ChannelState>();

      // Sending
      const sendChannel = localConnection.createDataChannel('sendDataChannel');
      sendChannel.onopen = () => stateChangeSubject.next(ChannelState.OPEN);
      sendChannel.onclose = () => stateChangeSubject.next(ChannelState.CLOSED);

      // Receiving
      const inboundMessageSubject = new Subject<string>();
      remoteConnection.ondatachannel = (event: RTCDataChannelEvent) => {
        const receiveChannel = event.channel;
        receiveChannel.onmessage = (e: MessageEvent) => inboundMessageSubject.next(e.data);
        receiveChannel.onopen = () => stateChangeSubject.next(ChannelState.OPEN);
        receiveChannel.onclose = () => stateChangeSubject.next(ChannelState.CLOSED);
      };

      // Bundle into interface
      return localConnection.createOffer()
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
        .then(() => remoteConnection.createAnswer())
        .then(answer => remoteConnection.setLocalDescription(answer))
        .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
        .then(() => ({
          send(message: string): void {
            sendChannel.send(message);
          },
          inbound(): Observable<string> {
            return inboundMessageSubject;
          },
          state(): Observable<ChannelState> {
            return stateChangeSubject;
          }
        }));
    } catch (e) {
      return Promise.reject(e);
    }
  }

}
