import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CourseClass } from '../../../models/course-class';
import { CourseClassService } from '../../../services/course-class';

@Component({
  selector: 'app-course-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './course-class-form.html',
  styleUrls: ['./course-class-form.css']
})
export class CourseClassForm implements OnInit {

  isEditMode = false;

  courseClass: CourseClass = {
    id: 0,
    classCode: '',
    subjectId: 0,
    semesterId: 1,
    lecturerId: null,
    maxStudents: 40
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private courseClassService: CourseClassService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.isEditMode = true;

      this.courseClassService.getCourseClassById(id).subscribe({
        next: (data: any) => {
          this.courseClass = {
            id: Number(data.id ?? data.courseClassId ?? id),
            classCode: data.classCode ?? '',
            subjectId: Number(data.subjectId ?? 0),
            semesterId: Number(data.semesterId ?? 1),
            lecturerId: data.lecturerId !== undefined && data.lecturerId !== null
              ? Number(data.lecturerId)
              : null,
            maxStudents: Number(data.maxStudents ?? 40)
          };

          // Ép Angular cập nhật giao diện ngay sau khi nhận dữ liệu
          this.cdr.detectChanges();
        },
        error: (error) => {
          alert('Không tìm thấy lớp học phần');
          console.error(error);
          this.router.navigate(['/course-classes']);
        }
      });
    }
  }

  saveCourseClass(): void {
    if (!this.courseClass.classCode.trim()) {
      alert('Vui lòng nhập mã lớp học phần');
      return;
    }

    if (!this.courseClass.subjectId || this.courseClass.subjectId <= 0) {
      alert('Vui lòng chọn môn học');
      return;
    }

    if (!this.courseClass.semesterId || this.courseClass.semesterId <= 0) {
      alert('Vui lòng chọn học kỳ');
      return;
    }

    if (!this.courseClass.maxStudents || this.courseClass.maxStudents <= 0) {
      alert('Sĩ số tối đa phải lớn hơn 0');
      return;
    }

    const courseClassToSave: CourseClass = {
      id: Number(this.courseClass.id),
      classCode: this.courseClass.classCode.trim(),
      subjectId: Number(this.courseClass.subjectId),
      semesterId: Number(this.courseClass.semesterId),
      lecturerId: this.courseClass.lecturerId !== null
        ? Number(this.courseClass.lecturerId)
        : null,
      maxStudents: Number(this.courseClass.maxStudents)
    };

    if (this.isEditMode) {
      this.courseClassService.updateCourseClass(courseClassToSave).subscribe({
        next: () => {
          alert('Cập nhật lớp học phần thành công');
          this.router.navigate(['/course-classes']);
        },
        error: (error) => {
          console.error(error);
          alert(error.error || 'Cập nhật lớp học phần thất bại');
        }
      });
    } else {
      this.courseClassService.addCourseClass(courseClassToSave).subscribe({
        next: () => {
          alert('Lưu lớp học phần thành công');
          this.router.navigate(['/course-classes']);
        },
        error: (error) => {
          console.error(error);
          alert(error.error || 'Lưu lớp học phần thất bại');
        }
      });
    }
  }
}