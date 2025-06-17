import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventiFormComponent } from './eventi-form/eventi-form.component';
import { EventiListaComponent } from './eventi-lista/eventi-lista.component';
import { CheckInComponent } from './check-in/check-in.component';

const routes: Routes = [
  {
    path: '',
    component: EventiListaComponent,
  },
  {
    path: 'nuovo',
    component: EventiFormComponent,
  },
  {
    path: ':id/modifica',
    component: EventiFormComponent,
  },
  {
    path: ':id/check-in',
    component: CheckInComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventiRoutingModule {}
