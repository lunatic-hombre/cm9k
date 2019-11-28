import {MessageFilter} from './message.filter';
import {Injectable} from '@angular/core';

const LINK_REGEX = /(\s|^)(https?:\S+)/i;

@Injectable({
  providedIn: 'root'
})
export class LinkFilter implements MessageFilter {
  async filter(msg: string): Promise<string> {
    return msg.replace(LINK_REGEX, '$1<a href="$2">$2</a>');
  }
}
