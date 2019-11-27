import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LobbyComponent} from './lobby/lobby.component';
import {ChatViewComponent} from './chat-view/chat-view.component';

const routes: Routes = [
  { path: '', component: LobbyComponent, pathMatch: 'full' },
  { path: 'c/:code', component: ChatViewComponent, pathMatch: 'prefix' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
