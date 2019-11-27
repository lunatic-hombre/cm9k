import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MessageService} from '../messaging/message.service';
import {User} from '../messaging/author.model';
import {Message} from '../messaging/message.model';

@Component({
  selector: 'cm-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {

  me: User = {
    name: 'anonymous'
  };

  messages: Array<Message>;
  message = '';

  constructor(private messageService: MessageService, private cdRef: ChangeDetectorRef) {
    this.messages = new Array<Message>();
  }

  ngOnInit() {
    this.messageService.connect(this.me)
      .then(() => {
        console.log('Connected to peer!');
        this.messageService.onMessage().subscribe(msg => {
          console.log('Message recieved', msg);
          this.messages.push(msg);
          this.cdRef.detectChanges();
        });
      })
      .catch(err => console.error('Connection failure!', err));
  }

  send() {
    console.log('send', this.message);
    this.messageService.send(new Message(this.me, this.message));
    this.message = '';
  }

}
