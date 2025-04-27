import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, Input, SimpleChange, NgZone } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { FirebaseService } from '../services/firebase';
import 'chartjs-adapter-date-fns';  // Import it at the top of your file
import { appDataSets } from '../app.constants';
@Component({
    selector: 'app-graph',
    templateUrl: './graph.html',
    styleUrls: ['./graph.css'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush  // Reduce change detection cycles
})
export class GraphComponent implements AfterViewInit {
    @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
    chart!: Chart;
    @Input() toggledOptions: string[][] | undefined;
    toggleButtons(toggles: string[][]): void {
            if (this.chart) {
                const flat_toggles = toggles.flat();
                for(let i = 0; i < appDataSets.length; i++){
                    if(flat_toggles.includes(appDataSets[i])){
                        this.chart.data.datasets[i]? this.chart.data.datasets[i].hidden = false: null;
                    }
                    else{
                        this.chart.data.datasets[i]? this.chart.data.datasets[i].hidden = true: null;
                    }
                }
                this.chart.update();
            }
    }

    constructor(private cdr: ChangeDetectorRef, private firebaseService: FirebaseService, private ngZone: NgZone) {
        Chart.register(...registerables);
    }

    private updateIntervalId: any;

    ngAfterViewInit(): void {
        this.initializeChart();
        this.cdr.detectChanges();
        this.updateIntervalId = setInterval(() => {
            if (this.chart) {
                this.chart.update();
            }
        }, 3000);
    }

    ngOnDestroy(): void {
        if (this.updateIntervalId) {
            clearInterval(this.updateIntervalId);
        }
    }
    private initializeChart(): void {
        // 1. Destroy any existing chart
        if (this.chart) {
          this.chart.destroy();
        }
      
        // 2. Create the Chart.js instance with an empty Sensor0 dataset
        this.chart = new Chart(this.chartCanvas.nativeElement, {
          type: 'line',
          data: {
            datasets: [
              {
            label: 'Sensor 0',
            data: [],
            borderColor: '#55cf6d',
            backgroundColor: '#55cf6d',
            fill: false,
            cubicInterpolationMode: 'monotone',
            animation: {
                duration: 0,
            }
              },
              // If you still need your static Line2024 dataset, you can seed it here:
              // {
              //   label: 'Line2024',
              //   data: [],          // will fill in later or via a separate subscription
              //   borderColor: '#086601',
              //   borderWidth: 3,
              //   fill: false,
              // },
            ]
          },
          options: {
            scales: {
              x: {
            type: 'time',
            time: {
              unit: 'second',
              tooltipFormat: 'mm:ss',
              displayFormats: {
                second: 'mm:ss'
              }
            },
            title: { display: true, text: 'Date' }
              },
              y: {
            min: 0, max: 12,
            title: { display: true, text: 'Sensor Value' }
              }
            },
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
            callbacks: {
              label: ctx => `Sensor0: ${ctx.parsed.y}`
            }
              }
            }
          }
        });
      
        // 3. Stream new data in and animate
        let lastTimestamp = 0;
        const MAX_POINTS = 100;
      
        this.firebaseService.subscribeToData('/sensors/sensor0/', (rawData: any[]) => {

            const points = rawData.map(item => ({
                x: new Date(item.date),
                y: Number(item.value)
              }));
            
              // mutate the existing dataset
              const sensorDs = this.chart.data.datasets[0];
              const arr = sensorDs.data as unknown as {x:Date,y:number}[];
              arr.splice(0, arr.length, ...points);
            
              console.log('Updating chart, points =', points.length);
              this.chart.update('active');
        });
      }
      
}
