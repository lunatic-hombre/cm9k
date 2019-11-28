import {Injectable} from '@angular/core';
import {Observable, Observer, Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {path} from '../utils/urls.util';

const RETRY_INTERVAL = 700;

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private subject: Subject<MessageEvent>;
  private webSocket: WebSocket;

  constructor() {}

  public connect(channel?: string): Subject<MessageEvent> {
    if (!this.subject || this.webSocket.readyState === WebSocket.CLOSED) {
      this.subject = this.create(path('/connect', channel));
    }
    return this.subject;
  }

  private create(url: string): Subject<MessageEvent> {
    if (!url.startsWith('ws')) {
      url = path(environment.signalServerUrl, url);
    }
    const ws = this.webSocket = new WebSocket(url);

    const observable = Observable.create(
      (obs: Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);
        return ws.close.bind(ws);
      });
    const sendWithRetry = (data: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      } else {
        setTimeout(() => sendWithRetry(data), RETRY_INTERVAL);
      }
    };
    return Subject.create({
      next: sendWithRetry
    }, observable);
  }

  isConnected(): boolean {
    return this.webSocket.readyState === WebSocket.OPEN;
  }

}
