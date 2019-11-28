import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChatViewComponent, NgbdModalContent} from './chat-view/chat-view-container/chat-view.component';
import {FormsModule} from '@angular/forms';
import { ChatBubbleComponent } from './chat-view/chat-bubble/chat-bubble.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {  NgxEmojiPickerModule  } from 'ngx-emoji-picker';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    ChatViewComponent,
    ChatBubbleComponent,
    NgbdModalContent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgbModule,
    NgxEmojiPickerModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [NgbdModalContent]
})
export class AppModule { }
