import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {PeerChannel, WebRTCService} from '../webrtc/webrtc.service';

@Component({
  selector: 'cm-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {

  channel: PeerChannel;
  messages: Array<string>;
  message = '';

  constructor(private rtc: WebRTCService, private cdRef: ChangeDetectorRef) {
    this.messages = new Array<string>();
  }

  ngOnInit() {
    this.rtc.connect().then(c => {
      this.channel = c;
      this.channel.inbound().subscribe(msg => {
        console.log('receive', msg);
        this.messages.push(msg);
        this.cdRef.detectChanges();
      });
    }).catch(err => console.error('Connection failure', err));
  }

  send() {
    console.log('send', this.message);
    this.channel.send(this.message);
    this.message = '';
  }

}
