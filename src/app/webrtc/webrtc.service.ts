import {PeerChannel} from './self-webrtc.service';

export interface WebRTCService {
  connect(): Promise<PeerChannel>;
}
