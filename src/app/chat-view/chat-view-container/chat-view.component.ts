import {ChangeDetectorRef, Component, OnInit, Input} from '@angular/core';
import {MessageService} from '../../messages/message.service';
import {getMyId, User} from '../../messages/author.model';
import {Message} from '../../messages/message.model';
import {ActivatedRoute} from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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

  messages: Array<Message>;
  message = '';

  users: Array<User> = [];

  toggled = false;

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const channel = params.get('channel');
      this.messageService.connect(this.me, channel)
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
    });

    this.messageService.onMessage().subscribe(msg => {
      this.messages.push( Object.assign({}, msg));
      this.cdRef.detectChanges();
    });
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


