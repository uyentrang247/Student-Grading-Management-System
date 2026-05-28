import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Subject } from '../../models/subject.model';
import { SubjectService } from '../../services/subject.service';

@Component({
  selector: 'app-subject-list',

  imports: [CommonModule, RouterModule],

  templateUrl: './subject-list.html',
  styleUrls: ['./subject-list.css']
})
export class SubjectList implements OnInit {

  subjects: Subject[] = [];

  constructor(private subjectService: SubjectService) {}

  ngOnInit(): void {
    this.subjects = this.subjectService.getSubjects();
  }
  deleteSubject(id: number) {

  const confirmDelete =
    confirm('Bạn có chắc muốn xóa môn học?');

  if (!confirmDelete) {
    return;
  }

  this.subjectService.deleteSubject(id);

  this.subjects =
    this.subjectService.getSubjects();
}
}