import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ChatViewComponent} from './chat-view/chat-view.component';

const routes: Routes = [
  { path: '', component: ChatViewComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
