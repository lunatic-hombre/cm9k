import {Component} from '@angular/core';
import {PeerWebRTCService} from '../webrtc/peer-webrtc.service';

@Component({
  selector: 'cm-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  joinUrl: string;
  state: 'fresh' | 'waiting' = 'fresh';

  constructor(private rtc: PeerWebRTCService) { }

  host(): void {
    this.rtc.host().then(peerChannel => {
      this.joinUrl = this.makeJoinUrl(peerChannel);
      this.state = 'waiting';
      // ON ANSWER?
    });
  }

  private makeJoinUrl(peerChannel) {
    return window.location.protocol + '//'
      + window.location.hostname + ':'
      + window.location.port
      + '/c/' + peerChannel.desc;
  }

  private copyLink() {
    const joinLinkInput = document.getElementById('join-link-input') as HTMLInputElement;
    joinLinkInput.select();
    document.execCommand('copy');
    const callout = document.getElementById('join-link-feedback');
    callout.classList.add('visible');
    setTimeout(() => {
      callout.classList.remove('visible');
      joinLinkInput.blur();
    }, 1000);
  }

}
