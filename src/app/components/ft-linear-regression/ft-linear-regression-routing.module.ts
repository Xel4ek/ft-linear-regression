import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FtLinearRegressionTrainComponent } from '@components/ft-linear-regression/ft-linear-regression-train/ft-linear-regression-train.component';

const routes: Routes = [
  {
    path: '',
    component: FtLinearRegressionTrainComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FtLinearRegressionRoutingModule {}
