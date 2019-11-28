import {Injectable} from '@angular/core';
import {Message} from './message.model';
import {getMyId, User} from './author.model';
import {Observable, Subject} from 'rxjs';
import {PeerChannel, PeerChannelCallback, PeerWebRTCService} from '../webrtc/peer-webrtc.service';
import {SocketService} from '../sockets/socket.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  userId: string;
  rtc: PeerWebRTCService;
  channels: PeerChannel[];
  channelCallback: PeerChannelCallback;
  messages: Subject<Message>;
  joins: Subject<User>;
  drops: Subject<User>;
  socketService: SocketService;
  socketSubject: Subject<any>;

  constructor() {
    this.userId = getMyId();
    this.rtc = new PeerWebRTCService();
    this.channels = [];
    this.messages = new Subject<Message>();
    this.joins = new Subject<User>();
    this.drops = new Subject<User>();
    this.socketService = new SocketService();
  }

  async connect(user: User, channelKey: string): Promise<void> {
    this.socketSubject = this.socketService.connect(channelKey);
    this.socketSubject.next(this.toHello(user));
    this.socketSubject.subscribe(messageEvent => {
      const messageString = messageEvent.data as string;
      const parts = messageString.split(' ');
      const verb = parts[0];
      const userId = parts[1];

      if (this.userId === userId) {
        console.log(verb + ' from myself.');
        return;
      }
      const payload = JSON.parse(atob(parts[parts.length - 1]));

      console.log(verb, userId, payload);

      switch (verb) {
        case 'OFFER':
          this.rtc.answer(payload).then(channel => {
            this.socketSubject.next('ANSWER ' + this.userId + ' ' + btoa(JSON.stringify(channel.desc)));
          });
          break;
        case 'ANSWER':
          if (!this.channelCallback) {
            console.log('Channel callback not defined');
            break;
          }
          this.channelCallback.connect(payload).then(channel => this.addChannel(channel));
          break;
        case 'HELLO':
          this.rtc.offer().then(callback => {
            this.channelCallback = callback;
            this.socketSubject.next('OFFER ' + this.userId + ' ' + btoa(JSON.stringify(this.channelCallback.desc)));
          });
          this.joins.next(payload);
          break;
        case 'ICE':
          this.channels.forEach(channel => {
            channel.ice(payload);
          });
          break;
      }
    });
  }

  private toHello(user: User): string {
    return 'HELLO ' + user.id + ' ' + btoa(JSON.stringify({user}));
  }

  private addChannel(channel: PeerChannel) {
    channel.inbound().subscribe(msg => this.messages.next(JSON.parse(msg)));
    channel.state().subscribe(state => console.log('State change: ' + state));
    channel.iceSubject.subscribe(candidate => this.socketSubject.next('ICE ' + this.userId + ' ' + btoa(JSON.stringify(candidate))));
    return this.channels.push(channel);
  }

  send(message: Message) {
    this.messages.next(message);
    this.channels.forEach(channel => channel.send(JSON.stringify(message)));
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
