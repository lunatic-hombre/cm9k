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

export interface PeerChannelCallback {
  desc: RTCSessionDescription;
  connect(desc: RTCSessionDescription): Promise<PeerChannel>;
}

export interface PeerChannel {
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

  connect(): Promise<PeerChannelCallback> {
    try {
      const {connection, stateChangeSubject, messageSubject, channel} = this.doConnectLocal();

      return connection.createOffer().then(offer => {
        return connection.setLocalDescription(offer).then(() => ({
          desc: connection.localDescription,
          connect(remoteDesc: RTCSessionDescription): Promise<PeerChannel> {
            return connection.setRemoteDescription(remoteDesc).then(() => ({
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
          }
        }));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private doConnectLocal() {
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
