import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LecturerService } from '../../../services/lecturer.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-lecturer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './edit-lecturer.html', 
  styleUrls: ['./edit-lecturer.css']  
})
export class EditLecturerComponent implements OnInit {
  lecturer: any = { userId: 0, fullName: '', email: '', facultyId: null };
  faculties: any[] = [];
  isLoading: boolean = true; 
  errorMessage: string = ''; 

  constructor(
    private route: ActivatedRoute,
    private lecturerService: LecturerService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone 
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      lecturerData: this.lecturerService.getLecturerById(id),
      facultiesData: this.lecturerService.getFaculties()
    }).subscribe({
      next: (result) => {
        this.lecturer.userId = result.lecturerData.userId;
        this.lecturer.fullName = result.lecturerData.fullName;
        this.lecturer.email = result.lecturerData.email;
        this.lecturer.facultyId = result.lecturerData.facultyId;
        
        this.faculties = result.facultiesData;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi tải dữ liệu từ server.';
        this.cdr.detectChanges();
      }
    });
  }

  onUpdate(): void {
    if (!this.lecturer.fullName || this.lecturer.fullName.trim() === '') {
      this.errorMessage = 'Họ tên không được để trống!';
      return;
    }
    if (!this.lecturer.email || this.lecturer.email.trim() === '') {
      this.errorMessage = 'Email không được để trống!';
      return;
    }

    this.errorMessage = ''; 
    
    this.lecturerService.updateLecturer(this.lecturer.userId, this.lecturer).subscribe({
      next: () => {
        alert('Cập nhật thành công!');
        this.router.navigate(['/admin/lecturers']);
      },
      error: (err) => {
        this.zone.run(() => {
          if (err.error && typeof err.error === 'object') {
            if (err.error.errors) {
              this.errorMessage = Object.values(err.error.errors).flat().join(', ');
            } else if (err.error.message) {
              this.errorMessage = err.error.message;
            } else {
              this.errorMessage = Object.values(err.error).flat().join(', ');
            }
          } else {
            this.errorMessage = err.error || 'Cập nhật thất bại.';
          }
          this.cdr.detectChanges();
        });
      }
    });
  }
}