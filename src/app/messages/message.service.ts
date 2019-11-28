import {Injectable} from '@angular/core';
import {PeerChannel} from '../webrtc/self-webrtc.service';
import {Message} from './message.model';
import {User} from './author.model';
import {Observable, Subject} from 'rxjs';
import {PeerWebRTCService} from '../webrtc/peer-webrtc.service';
import {SocketService} from '../sockets/socket.service';

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
  socketService: SocketService;
  socketSubject: Subject<any>;

  constructor() {
    this.rtc = new PeerWebRTCService();
    this.messages = new Subject<Message>();
    this.joins = new Subject<User>();
    this.drops = new Subject<User>();
    this.socketService = new SocketService();
  }

  connect(user: User, channel: string): Promise<void> {
    this.socketSubject = this.socketService.connect(channel);
    return this.rtc.connect().then(channelCallback => {
      const desc = channelCallback.desc;
      this.socketSubject.next({user, desc});
      return this.socketSubject.toPromise()
        .then(next => channelCallback.connect(next))
        .then(peerChannel => {
          this.channel = peerChannel;
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
        });
    });
  }

  send(message: Message) {
    this.messages.next(message);
    this.socketSubject.next(message);
    // console.log('send ', EventType.MESSAGE + JSON.stringify(message));
    // this.channel.send(EventType.MESSAGE + JSON.stringify(message));
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
