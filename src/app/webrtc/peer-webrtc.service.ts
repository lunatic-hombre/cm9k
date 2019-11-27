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
const DATA_CHANNEL_ID = 0;

@Injectable({
  providedIn: 'root'
})
export class PeerWebRTCService {

  host(): Promise<PeerChannel> {
    try {
      const {connection, stateChangeSubject, messageSubject, channel} = this.connect();

      connection.onicecandidate = e => {
        console.log(e);
      };

      return connection.createOffer()
        .then(offer => {
          connection.setLocalDescription(offer).then(() => console.log('Set local description.', connection.localDescription));
          return {
            desc: btoa(JSON.stringify(offer)),
            send(message: string): void {
              channel.send(message);
            },
            inbound(): Observable<string> {
              return messageSubject;
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
      const {connection, stateChangeSubject, messageSubject, channel} = this.connect();
      const remoteDesc = JSON.parse(atob(code));

      return connection.setRemoteDescription(remoteDesc)
        .then(() => connection.createAnswer())
        .then(localDesc => connection.setLocalDescription(localDesc))
        .then(() => ({
          desc: code,
          send(message: string): void {
            channel.send(message);
          },
          inbound(): Observable<string> {
            return messageSubject;
          },
          state(): Observable<ChannelState> {
            return stateChangeSubject;
          }
        }));
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private connect() {
    const connection = new RTCPeerConnection({
      iceServers
    });
    const stateChangeSubject = new Subject<ChannelState>();
    const messageSubject = new Subject<string>();

    const channel = connection.createDataChannel(DATA_CHANNEL_LABEL, {
      id: DATA_CHANNEL_ID,
      negotiated: true
    });
    channel.onopen = () => {
      console.log('Data channel open.');
      stateChangeSubject.next(ChannelState.OPEN);
    };
    channel.onclose = () => stateChangeSubject.next(ChannelState.CLOSED);
    channel.onmessage = (e: MessageEvent) => messageSubject.next(e.data);
    return {connection, stateChangeSubject, messageSubject, channel};
  }

}
