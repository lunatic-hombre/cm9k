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

export class PeerChannel {
  stateChangeSubject: Subject<ChannelState>;
  messageSubject: Subject<string>;

  constructor(public desc: RTCSessionDescription, public channel: RTCDataChannel) {
    this.stateChangeSubject = new Subject<ChannelState>();
    this.messageSubject = new Subject<string>();
    channel.onopen = () => {
      console.log('Data channel open.');
      this.stateChangeSubject.next(ChannelState.OPEN);
    };
    channel.onclose = () => this.stateChangeSubject.next(ChannelState.CLOSED);
    channel.onmessage = (e: MessageEvent) => this.messageSubject.next(e.data);
  }
  send(message: string): void {
    if (this.channel.readyState === 'open') {
      this.channel.send(message);
    } else {
      console.log('DATA CHANNEL IS NOT OPEN ' + this.channel.readyState);
    }
  }
  inbound(): Observable<string> {
    return this.messageSubject;
  }
  state(): Observable<ChannelState> {
    return this.stateChangeSubject;
  }
}

export interface PeerChannelAnswer {
  desc: RTCSessionDescription;
  channelPromise: Promise<PeerChannel>;
}

const getChannelHooks = channel => {
  const stateChangeSubject = new Subject<ChannelState>();
  const messageSubject = new Subject<string>();
  channel.onopen = () => {
    console.log('Data channel open.');
    stateChangeSubject.next(ChannelState.OPEN);
  };
  channel.onclose = () => stateChangeSubject.next(ChannelState.CLOSED);
  channel.onmessage = (e: MessageEvent) => messageSubject.next(e.data);
  return {stateChangeSubject, messageSubject};
};

const waitForChannel = (connection: RTCPeerConnection): Promise<RTCDataChannel> => {
  return new Promise(resolve => {
    connection.ondatachannel = channel => {
      resolve(channel.channel);
    };
  });
};

const DATA_CHANNEL_LABEL = 'TEST CHANNEL 123';
const DATA_CHANNEL_ID = 0;

@Injectable({
  providedIn: 'root'
})
export class PeerWebRTCService {

  offer(): Promise<PeerChannelCallback> {
    try {
      const connection = this.doConnectLocal();

      return connection.createOffer().then(offer => {
        return connection.setLocalDescription(offer).then(() => ({
          desc: connection.localDescription,
          connect(remoteDesc: RTCSessionDescription): Promise<PeerChannel> {
            return connection.setRemoteDescription(remoteDesc).then(() => {
              console.log('Offer accepted, peer connection established.');
              return new PeerChannel(connection.localDescription, connection.createDataChannel(DATA_CHANNEL_LABEL));
            });
          }
        }));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  answer(offer: RTCSessionDescription): Promise<PeerChannelAnswer> {
    try {
      const connection = this.doConnectLocal();

      return connection.setRemoteDescription(offer)
        .then(() => connection.createAnswer())
        .then(answer => connection.setLocalDescription(answer))
        .then(() => {
          return {
            desc: connection.localDescription,
            channelPromise: waitForChannel(connection).then(channel => {
              console.log('Sent answer, peer connection established.');
              return new PeerChannel(connection.localDescription, channel);
            })
          };
        });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private doConnectLocal(): RTCPeerConnection {
    return new RTCPeerConnection({ iceServers });
  }

}
