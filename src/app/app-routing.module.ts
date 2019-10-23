import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { EditComponent } from './edit/edit.component';
import { TranslatedComponent } from './translated/translated.component';
import { TranslatedVideoComponent } from './translated-video/translated-video.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'home',
    component: LandingComponent
  },
  {
    path: 'edit/:id',
    component: EditComponent
  },
  {
    path: 'remix/:id',
    component: EditComponent
  },
  {
    path: 'translated',
    component: TranslatedComponent
  },
  {
    path: 'translated/:id',
    component: TranslatedVideoComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
