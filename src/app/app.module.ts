import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChatViewComponent} from './chat-view/chat-view-container/chat-view.component';
import {FormsModule} from '@angular/forms';
import { ChatBubbleComponent } from './chat-view/chat-bubble/chat-bubble.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatViewComponent,
    ChatBubbleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
