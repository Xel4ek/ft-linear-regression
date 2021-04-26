import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-ft-linear-regression-train',
  templateUrl: './ft-linear-regression-train.component.html',
  styleUrls: ['./ft-linear-regression-train.component.scss'],
})
export class FtLinearRegressionTrainComponent {
  counter = 0;
  active = false;
  error = '';
  title?: string[];
  data: { origin: number[][]; normalize: number[][] } = {
    origin: [],
    normalize: [],
  };
  normalizeTheta: [number, number] = [0, 0];
  theta: [number, number] = [0, 0]; //  [9000, -0.03]
  learningRate = 0.5;
  mileage?: string;
  mergeOptions = {};
  options = {};
  private exactBounds: number[] = new Array<number>(4);
  bounds = {
    xAxis: { min: Infinity, max: -Infinity },
    yAxis: { min: Infinity, max: -Infinity },
  };
  constructor() {}

  @HostListener('body: dragleave')
  onBodyDragLeave(): void {
    this.active = false;
  }

  @HostListener('body:dragover', ['$event'])
  onBodyDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.active = true;
  }

  @HostListener('body:drop', ['$event'])
  onBodyDrop(event: DragEvent): void {
    this.active = false;
    this.theta = [0, 0];
    this.normalizeTheta = [0, 0];
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        let xMax = -Infinity;
        let yMax = -Infinity;
        let xMin = Infinity;
        let yMin = Infinity;
        const rowData = (reader.result as string)
          .split(/[\r]?\n/)
          .map((str) => str.trim())
          .filter((str) => str.length);
        if (rowData.length) {
          this.title = rowData.splice(0, 1)[0].split(',');
          this.data.origin = rowData.map((str) => {
            const [x, y] = str.split(',').map((entry) => parseFloat(entry));
            if (x > xMax) {
              xMax = x;
            }
            if (x < xMin) {
              xMin = x;
            }
            if (y > yMax) {
              yMax = y;
            }
            if (y < yMin) {
              yMin = y;
            }

            return [x, y];
          });
          this.exactBounds = [xMin, yMin, xMax, yMax];
          this.data.normalize = this.data.origin.map(([x, y]) => [
            (x - xMin) / (xMax - xMin),
            (y - yMin) / (yMax - yMin),
          ]);
          [xMin, yMin] = [xMin, yMin].map((el) => this.round(el, true));
          [xMax, yMax] = [xMax, yMax].map((el) => this.round(el));
          // console.log([xMin, yMin, xMax, yMax]);
          this.bounds = {
            xAxis: { min: xMin, max: xMax },
            yAxis: { min: yMin, max: yMax },
          };
          this.mergeOptions = this.optionsSupplier();
          // this.normalizeMergeOptions = this.normalizeOptionsSupplier();
        }
      };
      try {
        reader.readAsText(file);
      } catch (e) {
        this.error = e.message;
      }
    }
  }

  updateMileage(mileage: string): void {
    this.mileage = mileage;
    this.mergeOptions = this.optionsSupplier();
  }
  optionsSupplier(): any {
    return {
      title: {
        text: 'Data',
        left: 'center',
        top: 0,
      },
      grid: [
        { left: '7%', top: '7%', width: '38%', height: '86%' },
        { right: '7%', top: '7%', width: '38%', height: '86%' },
      ],
      xAxis: [
        { gridIndex: 0, ...this.bounds.xAxis },
        { gridIndex: 1, min: 0, max: 1 },
      ],
      yAxis: [
        { gridIndex: 0, ...this.bounds.yAxis },
        { gridIndex: 1, min: 0, max: 1 },
      ],
      tooltip: [
        {
          zlevel: 0,
          z: 60,
          formatter: '({c})',
          show: true,
          showContent: true,
          trigger: 'item',
          triggerOn: 'mousemove|click',
          alwaysShowContent: false,
          displayMode: 'single',
          renderMode: 'auto',
          confine: null,
          showDelay: 0,
          hideDelay: 100,
          transitionDuration: 0.4,
          enterable: false,
          backgroundColor: '#fff',
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, .2)',
          shadowOffsetX: 1,
          shadowOffsetY: 2,
          borderRadius: 4,
          borderWidth: 1,
          padding: null,
          extraCssText: '',
          axisPointer: {
            type: 'line',
            axis: 'auto',
            animation: 'auto',
            animationDurationUpdate: 200,
            animationEasingUpdate: 'exponentialOut',
            crossStyle: {
              color: '#999',
              width: 1,
              type: 'dashed',
              textStyle: {
                color: '#666',
                fontSize: 14,
              },
            },
          },
        },
      ],
      series: [
        {
          type: 'effectScatter',
          symbolSize: 15,
          data: [[this.mileage, this.estimatePrice(this.mileage)]],
          tooltip: {
            show: true,
            formatter: ({ data: itemData }: any) =>
              this.title?.[1] + ': ' + itemData[1],
            bottom: 10,
          },
        },
        {
          name: 'data',
          type: 'scatter',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: this.data.origin,
          color: 'red',
          legendHoverLink: true,
          clip: true,
          label: {
            position: 'top',
          },
          tooltip: {
            formatter: ({ data: itemData }: any) =>
              this.title?.[0] +
              ': ' +
              itemData[0] +
              ',  ' +
              this.title?.[1] +
              ': ' +
              itemData[1],
          },
          markLine: {
            animation: false,
            // label: {
            //   formatter: 'R² = ' + 12,
            //   align: 'right',
            // },
            lineStyle: {
              type: 'solid',
              color: 'purple',
            },
            tooltip: {
              formatter:
                'y = ' + this.theta[0] + ' + ' + this.theta[1] + ' * x',
            },
            data: [
              [
                {
                  coord: (() => {
                    let bound = this.bounds.xAxis.min;
                    let y = this.estimatePrice(bound);
                    if (y > this.bounds.yAxis.max) {
                      bound =
                        ((this.bounds.yAxis.max - this.theta[0]) /
                          this.theta[1]) *
                        1.0001;
                      y = this.estimatePrice(bound);
                    }
                    return [bound, y];
                  })(),
                  symbol: 'none',
                },
                {
                  coord: (() => {
                    let bound = this.bounds.xAxis.max;
                    let y = this.estimatePrice(bound);
                    if (y < this.bounds.yAxis.min) {
                      bound =
                        ((this.bounds.yAxis.min - this.theta[0]) /
                          this.theta[1]) *
                        0.999;
                      y = this.estimatePrice(bound);
                    }
                    return [bound, y];
                  })(),
                  symbol: 'none',
                },
              ],
            ],
          },
        },
        {
          name: 'normalizeData',
          type: 'scatter',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: this.data.normalize,
          color: 'red',
          legendHoverLink: true,
          clip: true,
          label: {
            position: 'top',
          },
          tooltip: {
            formatter: ({ data: itemData }: any) =>
              this.title?.[0] +
              ': ' +
              itemData[0] +
              ',  ' +
              this.title?.[1] +
              ': ' +
              itemData[1],
          },
          markLine: {
            animation: false,
            label: {
              formatter: 'R² = ' + this.getR(),
              align: 'right',
            },

            lineStyle: {
              color: 'green',
              type: 'solid',
            },
            tooltip: {
              formatter:
                'y = ' +
                this.normalizeTheta[0] +
                ' + ' +
                this.normalizeTheta[1] +
                ' * x',
            },
            data: [
              [
                {
                  coord: (() => {
                    let bound = 0;
                    let y = this.normalizeEstimatePrice(bound);
                    if (y > 1) {
                      bound =
                        ((1 - this.normalizeTheta[0]) /
                          this.normalizeTheta[1]) *
                        1.0001;
                      y = this.normalizeEstimatePrice(bound);
                    }
                    return [bound, y];
                  })(),
                  symbol: 'none',
                },
                {
                  coord: (() => {
                    let bound = 1;
                    let y = this.normalizeEstimatePrice(bound);
                    if (y < 0) {
                      bound =
                        (-this.normalizeTheta[0] / this.normalizeTheta[1]) *
                        0.999;
                      y = this.normalizeEstimatePrice(bound);
                    }
                    return [bound, y];
                  })(),
                  symbol: 'none',
                },
              ],
            ],
          },
        },
      ],
    };
  }
  private getR(): string {
    return (
      (
        (1 -
          this.data.normalize.reduce((acc, cur) => {
            return acc + (cur[1] - this.normalizeEstimatePrice(cur[0])) ** 2;
          }, 0) /
            this.data.normalize.length) *
        100
      )
        .toString()
        .substring(0, 4) + '%'
    );
  }
  async train(): Promise<void> {
    let diff = 1;
    this.counter = 0;
    const eps = this.learningRate * this.learningRate * 1e-10;
    for (; Math.abs(diff) > eps; ++this.counter) {
      const theta0 =
        (this.learningRate / this.data.normalize.length) *
        this.data.normalize.reduce(
          (acc, cur) => acc + (this.normalizeEstimatePrice(cur[0]) - cur[1]),
          0
        );
      const theta1 =
        (this.learningRate / this.data.normalize.length) *
        this.data.normalize.reduce(
          (acc, cur) =>
            acc + (this.normalizeEstimatePrice(cur[0]) - cur[1]) * cur[0],
          0
        );
      diff = theta0 * theta0 + theta1 * theta1;
      const [xMin, yMin, xMax, yMax] = this.exactBounds;
      this.normalizeTheta = [
        this.normalizeTheta[0] - theta0,
        this.normalizeTheta[1] - theta1,
      ];
      this.theta[1] = ((yMax - yMin) * this.normalizeTheta[1]) / (xMax - xMin);
      this.theta[0] =
        yMin +
        (yMax - yMin) * this.normalizeTheta[0] +
        this.theta[1] * (1 - xMin);
      this.mergeOptions = this.optionsSupplier();
      if (this.counter % 1000 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
  reset(): void {
    this.theta = [0, 0];
    this.normalizeTheta = [0, 0];
    this.counter = 0;
    this.mergeOptions = this.optionsSupplier();
  }
  private round(x: number, lower = false): number {
    const base = 10 ** Math.trunc(Math.log10(x));
    return (Math.trunc(x / base) + (lower ? 0 : 1)) * base;
  }
  estimatePrice(mileage: string | number = 0): number {
    const mileageValue =
      typeof mileage === 'string' ? parseFloat(mileage) : mileage;
    return this.theta[0] + this.theta[1] * mileageValue;
  }
  normalizeEstimatePrice(mileage: string | number = 0): number {
    const mileageValue =
      typeof mileage === 'string' ? parseFloat(mileage) : mileage;
    return this.normalizeTheta[0] + this.normalizeTheta[1] * mileageValue;
  }
}
