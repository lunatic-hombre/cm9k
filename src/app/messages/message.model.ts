import {User} from './author.model';

export class Message {
  timestamp: number;
  author: User;
  text: string;

  constructor(author: User, text: string) {
    this.timestamp = Date.now();
    this.author = author;
    this.text = text;
  }
}
