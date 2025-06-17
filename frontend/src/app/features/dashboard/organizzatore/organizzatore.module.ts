import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizzatoreComponent } from './organizzatore.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizzatoreComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizzatoreModule {}
