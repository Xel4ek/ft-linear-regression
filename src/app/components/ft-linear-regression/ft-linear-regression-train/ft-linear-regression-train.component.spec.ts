import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FtLinearRegressionTrainComponent } from './ft-linear-regression-train.component';

describe('FtLinearRegressionTrainComponent', () => {
  let component: FtLinearRegressionTrainComponent;
  let fixture: ComponentFixture<FtLinearRegressionTrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FtLinearRegressionTrainComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FtLinearRegressionTrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
