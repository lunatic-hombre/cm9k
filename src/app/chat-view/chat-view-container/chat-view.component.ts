import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MessageService} from '../../messages/message.service';
import {User} from '../../messages/author.model';
import {Message} from '../../messages/message.model';
import {ActivatedRoute} from '@angular/router';

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

  constructor(private messageService: MessageService,
              private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef) {
    this.messages = new Array<Message>();
  }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const channel = params.get('channel');
      this.messageService.connect(this.me, channel)
        .then(() => {
          console.log('Connected to peer!');
          this.messageService.onMessage().subscribe(msg => {
            this.messages.push(msg);
            this.cdRef.detectChanges();
          });
        })
        .catch(err => console.error('Connection failure!', err));
    });
  }

  send() {
    console.log('send', this.message);
    this.messageService.send(new Message(this.me, this.message));
    this.message = '';
  }

}
