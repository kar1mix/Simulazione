import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DipendenteComponent } from './dipendente.component';

const routes: Routes = [
  {
    path: '',
    component: DipendenteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DipendenteModule {}
