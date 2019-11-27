import {User} from './author.model';

export class Message {
  timestamp: number;
  author: User;
  text: string;
  receiver: User;

  constructor(author: User, receiver: User, text: string) {
    this.timestamp = Date.now();
    this.author = author;
    this.receiver = receiver;
    this.text = text;
  }
}
