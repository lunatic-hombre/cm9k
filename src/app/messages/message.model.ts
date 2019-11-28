import {User} from './author.model';

export class Message {
  timestamp: number;
  sender: User;
  receiver: User;
  text: string;

  constructor(sender: User, receiver: User, text: string) {
    this.timestamp = Date.now();
    this.sender = {...sender};
    this.receiver = {...receiver};
    this.text = text;
  }
}
