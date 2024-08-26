import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, Input, SimpleChange } from '@angular/core';
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

    constructor(private cdr: ChangeDetectorRef, private firebaseService: FirebaseService) {
        Chart.register(...registerables);
    }

    ngAfterViewInit(): void {
        this.initializeChart();
        this.cdr.detectChanges();  // Manually trigger detection once
    }

    private initializeChart(): void {
        if (this.chart) {
            this.chart.destroy();  // Prevent memory leaks and multiple bindings
        }
        this.firebaseService.getData('/').then((data: any) => {
            const graphData = data["polldata"]
            const olld2020Data = data["oldPollData2020"]
            const line2024Data = data["line2024Data"]
            const line2020Data = data["line2020Data"]
            const formattedData = graphData.map((item: any) => ({
                x: new Date(Date.UTC(
                    new Date(item.endDate).getUTCFullYear(),
                    new Date(item.endDate).getUTCMonth(),
                    new Date(item.endDate).getUTCDate(),
                    -17,0,0,0
                )),
                y: Number(item.spread),
                pollster: item.pollster
            }));
            const formattedOld2020Data = olld2020Data
                .filter((item: any) => new Date(item.endDate) <= new Date(new Date().getFullYear() - 4, new Date().getMonth()+1, new Date().getDate()))
                .map((item: any) => ({
                    x: new Date(Date.UTC(
                        new Date(item.endDate).getUTCFullYear() + 4,
                        new Date(item.endDate).getUTCMonth(),
                        new Date(item.endDate).getUTCDate(),
                        -17,0,0,0
                    )),
                    y: Number(item.spread),
                    pollster: item.pollster
                }));
            const formattedLine2024Data = line2024Data.map((item: any) => ({
                x: new Date(Date.UTC(
                    new Date(item.date).getUTCFullYear(),
                    new Date(item.date).getUTCMonth(),
                    new Date(item.date).getUTCDate(),
                    -17,0,0,0
                )),
                y: Number(item.spread)
            }))
            .sort((a: any, b: any) => a.x - b.x);
            const formattedLine2020Data = line2020Data
                .filter((item: any) => new Date(item.date) <= new Date(new Date().getFullYear() - 4, new Date().getMonth()+1, new Date().getDate()))
                .map((item: any) => ({
                    x: new Date(Date.UTC(
                        new Date(item.date).getUTCFullYear() + 4,
                        new Date(item.date).getUTCMonth(),
                        new Date(item.date).getUTCDate(),
                        -17, 0, 0, 0
                    )),
                    y: Number(item.spread)
                }))
                .sort((a: any, b: any) => a.x - b.x);
            console.log(formattedLine2024Data);
            this.chart = new Chart(this.chartCanvas.nativeElement, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Scatter Dataset',
                        data: formattedData,
                        backgroundColor: '#55cf6d',
                        borderColor: '#55cf6d',
                        hidden: true
                    },
                    {
                        label: 'Old 2020 Data',
                        data: formattedOld2020Data,
                        backgroundColor: '#6da3cf',
                        borderColor: '#6da3cf',
                        hidden: true
                    },
                    {
                        type: 'line',
                        label: 'Line2024',
                        data: formattedLine2024Data,
                        borderColor: '#086601',
                        borderWidth: 3,
                        fill: false,
                        cubicInterpolationMode: 'monotone',
                    },
                    {
                        type: 'line',
                        label: 'Line2020',
                        data: formattedLine2020Data,
                        borderColor: '#01347a',
                        borderWidth: 3,
                        fill: false,
                        cubicInterpolationMode: 'monotone'
                    }
                ]
                },
                
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                tooltipFormat: 'MM-dd',
                                displayFormats: {
                                    day: 'MM-dd'
                                },
                                parser: 'yyyy-MM-dd'
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            max: 12,
                            min: -8,
                            title: {
                            display: true,
                            text: 'Difference in Polls (%)'
                            }
                            
                        }
                    },
                    
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            filter: function (tooltipItem: any) {
                                return tooltipItem.datasetIndex < 2;
                            },
                            callbacks: {
                                label: function(context: any){
                                    var label = "";
                                    if(context.datasetIndex == 0){
                                        label += '2024 Poll';
                                    }
                                    else if(context.datasetIndex == 1){
                                        label += '2020 Poll';
                                    }
                                    return label;
                                }
                            },
                            
                        }
                    },
                }
            })
        }).catch((error: any) => {
            console.error(error);
        });
    }
}
