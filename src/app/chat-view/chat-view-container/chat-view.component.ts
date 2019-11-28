import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MessageService} from '../../messages/message.service';
import {getMyId, User} from '../../messages/author.model';
import {Message} from '../../messages/message.model';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'cm-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {

  me: User = new User(getMyId(), 'anonymous');

  receiver: User = {
    name: 'anonymous'
  };

  messages: Array<Message>;
  message = '';

  constructor(private messageService: MessageService,
              private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef) {
    this.messages = new Array<Message>();
  }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const channel = params.get('channel');
      this.messageService.connect(this.me, channel)
        .then(() => console.log('Message service connected'))
        .catch(err => console.error('Connection failure!', err));
    });

    this.messageService.onMessage().subscribe(msg => {
      this.messages.push( Object.assign({}, msg));
      this.cdRef.detectChanges();
    });
  }

  send() {
    console.log('send', this.message);
    this.messageService.send(new Message(this.me, this.receiver, this.message));
    this.message = '';
  }

}
