import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LecturerService } from '../../../services/lecturer.service';

@Component({
  selector: 'app-lecturer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lecturer-list.html',
  styleUrls: ['./lecturer-list.css']
})
export class LecturerListComponent implements OnInit {
  lecturers: any[] = [];

  constructor(
    private lecturerService: LecturerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLecturers();
  }

  loadLecturers() {
    this.lecturerService.getLecturers().subscribe({
      next: (data) => {
        console.log(data);
        this.lecturers = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}