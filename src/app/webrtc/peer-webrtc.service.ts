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
  channel: RTCDataChannel;
  stateChangeSubject: Subject<ChannelState>;
  messageSubject: Subject<string>;
  iceSubject: Subject<RTCIceCandidate>;

  constructor(public connection: RTCPeerConnection) {
    this.stateChangeSubject = new Subject<ChannelState>();
    this.messageSubject = new Subject<string>();
    this.iceSubject = new Subject<RTCIceCandidate>();
    this.connection.onicecandidate = ev => {
      console.log('ICE', ev.candidate);
      if (ev.candidate) {
        this.iceSubject.next(ev.candidate);
      }
    };
  }

  setChannel(channel: RTCDataChannel): PeerChannel {
    this.channel = channel;
    this.channel.onopen = () => {
      console.log('Data channel open.');
      this.stateChangeSubject.next(ChannelState.OPEN);
    };
    this.channel.onclose = () => {
      console.log('Data channel closed.');
      this.stateChangeSubject.next(ChannelState.CLOSED);
    };
    this.channel.onmessage = (e: MessageEvent) => {
      console.log('Data channel message.', e);
      this.messageSubject.next(e.data);
    };
    return this;
  }

  get desc(): RTCSessionDescription {
    return this.connection.localDescription;
  }

  ice(candidate: RTCIceCandidate): void {
    this.connection.addIceCandidate(candidate).then(() => {
      console.log('ICE candidate added.');
    });
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

const waitForChannel = (connection: RTCPeerConnection): Promise<RTCDataChannel> => {
  return new Promise(resolve => {
    connection.ondatachannel = channel => {
      resolve(channel.channel);
    };
  });
};

const DATA_CHANNEL_LABEL = 'TEST';

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
              return new PeerChannel(connection).setChannel(connection.createDataChannel(DATA_CHANNEL_LABEL));
            });
          }
        }));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  answer(offer: RTCSessionDescription): Promise<PeerChannel> {
    try {
      const connection = this.doConnectLocal();

      return connection.setRemoteDescription(offer)
        .then(() => connection.createAnswer())
        .then(answer => connection.setLocalDescription(answer))
        .then(() => {
          const peerChannel = new PeerChannel(connection);
          waitForChannel(connection).then(channel => {
            console.log('Sent answer, peer connection established.');
            peerChannel.setChannel(channel);
          });
          return peerChannel;
        });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private doConnectLocal(): RTCPeerConnection {
    return new RTCPeerConnection({iceServers});
  }

}
