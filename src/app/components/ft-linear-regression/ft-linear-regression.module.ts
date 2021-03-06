import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FtLinearRegressionRoutingModule } from './ft-linear-regression-routing.module';
import { FtLinearRegressionTrainComponent } from './ft-linear-regression-train/ft-linear-regression-train.component';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [FtLinearRegressionTrainComponent],
  imports: [CommonModule, FtLinearRegressionRoutingModule, NgxEchartsModule],
})
export class FtLinearRegressionModule {}
