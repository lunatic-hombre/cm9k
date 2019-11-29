import {ChangeDetectorRef, Component, OnInit, Input} from '@angular/core';
import {MessageService} from '../../messages/message.service';
import {getMyId, User} from '../../messages/author.model';
import {Message} from '../../messages/message.model';
import {ActivatedRoute} from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

const MESSAGE_LIMIT = 50;

@Component({
  selector: 'cm-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {

  constructor(private messageService: MessageService,
              private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef,
              private modalService: NgbModal) {
    this.messages = new Array<Message>();
  }

  me: User = new User(getMyId(), 'anonymous', 'assets/avatars/' + (Math.floor(Math.random() * 7) + 1) + '.png');
  channel = '';

  messages: Array<Message>;
  message = '';

  users: Array<User> = [];

  toggled = false;
  notify = false;

  ngOnInit() {
    if (Notification.permission === 'granted') {
      this.notify = true;
    } else {
      Notification.requestPermission().then(permission => {
        this.notify = permission === 'granted';
      });
    }
    this.route.paramMap.subscribe(params => {
      this.channel = params.get('channel');
      // get saved
      const oldMessagesValue = localStorage.getItem('messages/' + this.channel);
      if (oldMessagesValue) {
        this.messages = JSON.parse(oldMessagesValue);
      }
      this.messageService.connect(this.me, this.channel)
        .then(() => console.log('Message service connected'))
        .catch(err => console.error('Connection failure!', err));
      this.messageService.onJoin().subscribe(user => {
        this.users.push(user);
      });
      this.messageService.onDrop().subscribe(userId => {
        for (let i = 0; i < this.users.length; i++) {
          if (this.users[i].id === userId) {
            this.users.splice(i, 1);
          }
          console.log(this.users);
        }
      });
      this.messageService.onAsk().subscribe(() => {
        this.messageService.sendAll(this.messages);
      });
    });

    this.messageService.onMessage().subscribe(msg => this.onMessage(msg));
  }

  private onMessage(msg) {
    // normal flow, add to end of array
    if (this.messages.length === 0 || msg.timestamp > this.messages[this.messages.length - 1].timestamp) {
      this.messages.push(Object.assign({}, msg));
    } else {
      // historical message, maintain order by timestamp
      for (let i = this.messages.length - 1; i >= 0; i++) {
        const m = this.messages[i];
        if (m.timestamp === msg.timestamp) {
          return;
        } else if (msg.timestamp > m.timestamp) {
          this.messages.splice(i, 0, msg);
          break;
        }
      }
    }
    // notify if recent
    if (msg.timestamp > Date.now() - 10_000 && this.notify) {
      const n = new Notification(msg.sender.name + ' says', { body: msg.text, icon: msg.sender.avatar });
      setTimeout(n.close.bind(n), 4000);
    }
    // truncate to limit
    if (this.messages.length > MESSAGE_LIMIT) {
      this.messages.splice(0, this.messages.length - MESSAGE_LIMIT);
    }
    // save for later
    setTimeout(() => {
      localStorage.setItem('messages/' + this.channel, JSON.stringify(this.messages));
    }, 500);

    this.cdRef.detectChanges();
  }

  send() {
    if (this.message === '') { return; }
    console.log('send', this.message);
    this.messageService.send(new Message(this.me, this.message));
    this.message = '';
  }

  openModal(feature: string) {
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.name = feature;
  }
  handleSelection(event) {
    this.message += event.char;
  }

}

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-body">
      <p>{{name}} coming soon!</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Cool!</button>
    </div>
  `
})
export class NgbdModalContent {
  @Input() name;

  constructor(public activeModal: NgbActiveModal) {}
}


