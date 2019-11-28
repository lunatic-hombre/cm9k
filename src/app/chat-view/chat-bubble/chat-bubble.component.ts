import {Component, Input} from '@angular/core';
import {Message} from '../../messages/message.model';
import * as moment from 'moment';

@Component({
  selector: 'cm-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss']
})
export class ChatBubbleComponent {
  @Input() message: Message;
  @Input() received: string;
  momentToNow(date: Date): string {
    return moment(date).fromNow();
  }
}
