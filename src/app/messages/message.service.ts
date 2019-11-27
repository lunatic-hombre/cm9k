import {Injectable} from '@angular/core';
import {PeerChannel, SelfWebRTCService} from '../webrtc/self-webrtc.service';
import {Message} from './message.model';
import {User} from './author.model';
import {Observable, Subject} from 'rxjs';
import {WebRTCService} from '../webrtc/webrtc.service';
import {PeerWebRTCService} from '../webrtc/peer-webrtc.service';

enum EventType {
  MESSAGE, JOIN, DROP
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  rtc: PeerWebRTCService;
  channel: PeerChannel;
  messages: Subject<Message>;
  joins: Subject<User>;
  drops: Subject<User>;

  constructor() {
    this.rtc = new PeerWebRTCService();
    this.messages = new Subject<Message>();
    this.joins = new Subject<User>();
    this.drops = new Subject<User>();
  }

  connect(user: User, code: string): Promise<void> {
    return this.rtc.join(code).then(c => {
      this.channel = c;
      this.channel.inbound().subscribe(str => {
        console.log('receive ', str);
        // tslint:disable-next-line:radix
        const eventType = parseInt(str.charAt(0));
        const eventObj = JSON.parse(str.substr(1));
        switch (eventType) {
          case EventType.MESSAGE:
            this.messages.next(eventObj);
            break;
          default:
            throw new Error('Unknown message type');
        }
      });
    }).catch(err => console.error('Connection failure', err));
  }

  send(message: Message) {
    console.log('send ', EventType.MESSAGE + JSON.stringify(message));
    this.channel.send(EventType.MESSAGE + JSON.stringify(message));
  }

  onMessage(): Observable<Message> {
    return this.messages;
  }

  onJoin(): Observable<User> {
    return this.joins;
  }

  onDrop(): Observable<User> {
    return this.drops;
  }

}
