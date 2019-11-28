import {Component, Input} from '@angular/core';
import {Message} from '../../messages/message.model';

@Component({
  selector: 'cm-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss']
})
export class ChatBubbleComponent {
  @Input() message: Message;
  @Input() received: string;
}
