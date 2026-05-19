import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistics',
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics implements AfterViewInit {

  ngAfterViewInit(): void {

    new Chart('gradeChart', {
      type: 'bar',
      data: {
        labels: ['A', 'B', 'C', 'D', 'F'],
        datasets: [
          {
            label: 'Số lượng sinh viên',
            data: [10, 20, 15, 5, 2]
          }
        ]
      }
    });

  }

}