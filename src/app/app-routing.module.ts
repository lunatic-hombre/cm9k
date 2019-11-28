import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ChatViewComponent} from './chat-view/chat-view-container/chat-view.component';

const routes: Routes = [
  { path: '', component: ChatViewComponent, pathMatch: 'full' },
  { path: 'c/:channel', component: ChatViewComponent, pathMatch: 'prefix' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
