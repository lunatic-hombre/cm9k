import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MessageFilter} from './message.filter';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GifFilter implements MessageFilter {

  constructor(private http: HttpClient) {}

  async filter(msg: string): Promise<string> {
    if (msg.startsWith('gif')) {
      try {
        const params = {
          s: msg.substring(3).trim(),
          api_key: environment.giphyKey
        };
        const apiResult = await this.http.get(environment.giphyUrl, {params}).toPromise() as any;
        if (apiResult.data && apiResult.data.images && apiResult.data.images.fixed_height) {
          const imageUrl = apiResult.data.images.fixed_height.url;
          return `<img src="${imageUrl}" />`;
        } else {
          return msg;
        }
      } catch (e) {
        if (e.status === 429) {
          return `<img src="https://i.imgur.com/xbDqITl.gif" />`;
        } else {
          console.error(e);
        }
      }
    }
    return Promise.resolve(msg);
  }
}
