import {Injectable} from '@angular/core';
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
  desc: string;
  send(message: string): void;
  inbound(): Observable<string>;
  state(): Observable<ChannelState>;
}

const DATA_CHANNEL_LABEL = 'TEST CHANNEL 123';

@Injectable({
  providedIn: 'root'
})
export class PeerWebRTCService {

  host(): Promise<PeerChannel> {
    try {
      // Connecting
      const connection = new RTCPeerConnection({
        iceServers
      });

      const stateChangeSubject = new Subject<ChannelState>();

      // Sending
      const sendChannel = connection.createDataChannel(DATA_CHANNEL_LABEL);
      sendChannel.onopen = () => stateChangeSubject.next(ChannelState.OPEN);
      sendChannel.onclose = () => stateChangeSubject.next(ChannelState.CLOSED);

      // Receiving
      const inboundMessageSubject = new Subject<string>();
      connection.ondatachannel = (event: RTCDataChannelEvent) => {
        const receiveChannel = event.channel;
        receiveChannel.onmessage = (e: MessageEvent) => inboundMessageSubject.next(e.data);
        receiveChannel.onopen = () => stateChangeSubject.next(ChannelState.OPEN);
        receiveChannel.onclose = () => stateChangeSubject.next(ChannelState.CLOSED);
      };

      // Bundle into interface
      return connection.createOffer()
        .then(offer => {
          connection.setLocalDescription(offer).then(() => console.log('Set local description.', connection.localDescription));
          return {
            desc: btoa(JSON.stringify(offer)),
            send(message: string): void {
              sendChannel.send(message);
            },
            inbound(): Observable<string> {
              return inboundMessageSubject;
            },
            state(): Observable<ChannelState> {
              return stateChangeSubject;
            }
          };
        });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  join(code: string): Promise<PeerChannel> {
    try {
      // Connecting
      const connection = new RTCPeerConnection({
        iceServers
      });
      const stateChangeSubject = new Subject<ChannelState>();
      let channel: RTCDataChannel = null;

      // Receiving
      const inboundMessageSubject = new Subject<string>();
      connection.ondatachannel = (event: RTCDataChannelEvent) => {
        channel = event.channel;
        channel.onmessage = (e: MessageEvent) => inboundMessageSubject.next(e.data);
        channel.onopen = () => stateChangeSubject.next(ChannelState.OPEN);
        channel.onclose = () => stateChangeSubject.next(ChannelState.CLOSED);
      };

      // Bundle into interface
      const offer = JSON.parse(atob(code));
      return connection.setRemoteDescription(offer)
        .then(() => connection.createAnswer())
        .then(() => ({
          desc: code,
          send(message: string): void {
            channel.send(message);
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
