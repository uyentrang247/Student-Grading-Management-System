import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CourseClass } from '../../../models/course-class';
import { CourseClassService } from '../../../services/course-class';
import { SubjectService } from '../../../services/subject';
import { Subject } from '../../../models/subject';
import { LecturerService } from '../../../services/lecturer.service';
import { SemesterService } from '../../../services/semester';

@Component({
  selector: 'app-course-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './course-class-form.html',
  styleUrls: ['./course-class-form.css']
})
export class CourseClassForm implements OnInit {
  isEditMode = false;

  subjects: Subject[] = [];
  lecturers: any[] = [];
  semesters: any[] = [];

  courseClass: CourseClass = {
    id: 0,
    classCode: '',
    subjectId: 0,
    semesterId: 0,
    lecturerId: 0,
    maxStudents: 40
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private courseClassService: CourseClassService,
    private subjectService: SubjectService,
    private lecturerService: LecturerService,
    private semesterService: SemesterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
    this.loadLecturers();
    this.loadSemesters();

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.isEditMode = true;
      this.loadCourseClass(id);
    }
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi tải môn học:', error);
        alert('Không thể tải danh sách môn học');
      }
    });
  }

  loadLecturers(): void {
    this.lecturerService.getLecturers().subscribe({
      next: (data: any) => {
        this.lecturers = data.map((lecturer: any) => ({
          id: lecturer.userId,
          name: lecturer.fullName
        }));

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi tải giảng viên:', error);
        alert('Không thể tải danh sách giảng viên');
      }
    });
  }

  loadSemesters(): void {
    this.semesterService.getSemesters().subscribe({
      next: (data: any) => {
        this.semesters = data.map((semester: any) => ({
          id: semester.semesterId,
          name: `${semester.term} - ${semester.academicYear}`
        }));

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi tải học kỳ:', error);
        alert('Không thể tải danh sách học kỳ');
      }
    });
  }

  loadCourseClass(id: number): void {
    this.courseClassService.getCourseClassById(id).subscribe({
      next: (data: any) => {
        this.courseClass = {
          id: Number(data.id ?? data.courseClassId ?? id),
          classCode: data.classCode ?? '',
          subjectId: Number(data.subjectId ?? 0),
          semesterId: Number(data.semesterId ?? 0),
          lecturerId: data.lecturerId !== undefined && data.lecturerId !== null
            ? Number(data.lecturerId)
            : 0,
          maxStudents: Number(data.maxStudents ?? 40)
        };

        this.cdr.detectChanges();
      },
      error: (error) => {
        alert('Không tìm thấy lớp học phần');
        console.error(error);
        this.router.navigate(['/course-classes']);
      }
    });
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

    if (!this.courseClass.lecturerId || Number(this.courseClass.lecturerId) <= 0) {
      alert('Vui lòng chọn giảng viên');
      return;
    }

    if (!this.courseClass.semesterId || this.courseClass.semesterId <= 0) {
      alert('Vui lòng chọn học kỳ');
      return;
    }

    const courseClassToSave: CourseClass = {
      id: Number(this.courseClass.id),
      classCode: this.courseClass.classCode.trim(),
      subjectId: Number(this.courseClass.subjectId),
      semesterId: Number(this.courseClass.semesterId),
      lecturerId: Number(this.courseClass.lecturerId),
      maxStudents: Number(this.courseClass.maxStudents ?? 40)
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