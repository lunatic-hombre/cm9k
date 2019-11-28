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

  me: User = new User(getMyId(), 'anonymous');

  receiver: User = {
    name: 'anonymous'
  };

  messages: Array<Message>;
  message = '';

  constructor(private messageService: MessageService,
              private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef,
              private modalService: NgbModal) {
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

  openModal(feature: string) {
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.name = feature;
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


