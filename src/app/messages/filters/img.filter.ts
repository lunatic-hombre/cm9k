import {MessageFilter} from './message.filter';
import {Injectable} from '@angular/core';

const IMG_REGEX = /(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*\.(?:jpg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i;

@Injectable({
  providedIn: 'root'
})
export class ImgFilter implements MessageFilter {
  async filter(msg: string): Promise<string> {
    msg = msg.trim();
    if (IMG_REGEX.test(msg)) {
      return `<img src="${msg}" />`;
    }
    return msg;
  }
}
