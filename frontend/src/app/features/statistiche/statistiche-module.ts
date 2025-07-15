import { NgModule } from '@angular/core';
import { StatisticheComponent } from './statistiche.component';
import { StatisticheRoutingModule } from './statistiche-routing-module';

@NgModule({
  imports: [StatisticheComponent, StatisticheRoutingModule],
  exports: [StatisticheComponent],
})
export class StatisticheModule {}
