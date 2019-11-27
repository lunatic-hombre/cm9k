import { Injectable } from '@angular/core';
import {PeerChannel, WebRTCService} from '../webrtc/webrtc.service';
import {Message} from './message.model';
import {User} from './author.model';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  channel: PeerChannel;

  constructor(private rtc: WebRTCService) { }

  connect(user: User): Promise<void> {
    return this.rtc.connect().then(c => {
      this.channel = c;
    }).catch(err => console.error('Connection failure', err));
  }

  send(message: Message) {
    console.log('send', message);
    this.channel.send(JSON.stringify(message));
  }

  onMessage(): Observable<Message> {
    return this.channel.inbound().pipe(map(str => JSON.parse(str)));
  }

}
