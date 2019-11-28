import {User} from './author.model';

export class Message {
  timestamp: number;
  sender: User;
  text: string;

  constructor(sender: User, text: string) {
    this.timestamp = Date.now();
    this.sender = {...sender};
    this.text = text;
  }
}
