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
  drops: Subject<string>;
  asks: Subject<boolean>;
  socketService: SocketService;
  socketSubject: Subject<any>;

  constructor() {
    this.userId = getMyId();
    this.rtc = new PeerWebRTCService();
    this.channels = [];
    this.messages = new Subject<Message>();
    this.joins = new Subject<User>();
    this.drops = new Subject<string>();
    this.asks = new Subject<boolean>();
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
      const payload = parts[2] ? JSON.parse(atob(parts[2])) : null;

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
          this.joins.next(payload.user);
          this.asks.next(true);
          break;
        case 'BYE':
          this.drops.next(userId);
          break;
        case 'ICE':
          this.channels.forEach(channel => {
            channel.ice(new RTCIceCandidate(payload));
          });
          break;
        case 'TALK':
          this.messages.next(payload);
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
    this.sendToPeers(message);
  }

  sendAll(messages: Array<Message>) {
    for (const msg of messages) {
      this.sendToPeers(msg);
    }
  }

  private sendToPeers(message: Message) {
    if (this.hasNoOpenChannels()) {
      this.socketSubject.next('TALK ' + this.userId + ' ' + btoa(JSON.stringify(message)));
    } else {
      this.channels.forEach(channel => channel.send(JSON.stringify(message)));
    }
  }

  private hasNoOpenChannels(): boolean {
    return !this.channels.map(c => c.isOpen()).reduce((o1, o2) => o1 || o2, false);
  }

  onMessage(): Observable<Message> {
    return this.messages;
  }

  onJoin(): Observable<User> {
    return this.joins;
  }

  onDrop(): Observable<string> {
    return this.drops;
  }

  onAsk(): Observable<boolean> {
    return this.asks;
  }

}
