import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatisticheComponent } from './statistiche.component';
import { roleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: StatisticheComponent,
    canActivate: [roleGuard],
    data: { roles: ['Responsabile'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticheRoutingModule {}
