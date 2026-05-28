import { Injectable } from '@angular/core';
import { Subject } from '../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private subjects: Subject[] = [
  {
    id: 1,
    subjectCode: 'WEB101',
    subjectName: 'Công nghệ Web',
    credits: 3,
    processWeight: 40,
    finalWeight: 60
  },
  {
    id: 2,
    subjectCode: 'JAVA102',
    subjectName: 'Lập trình Java',
    credits: 4,
    processWeight: 30,
    finalWeight: 70
  }
];

  getSubjects(): Subject[] {
    return this.subjects;
  }

  addSubject(subject: Subject): void {
    this.subjects.push({
      ...subject,
      id: Date.now()
    });
  }

  updateSubject(updatedSubject: Subject): void {
    this.subjects = this.subjects.map(subject =>
      subject.id === updatedSubject.id ? updatedSubject : subject
    );
  }

  deleteSubject(id: number): void {
    this.subjects = this.subjects.filter(subject => subject.id !== id);
  }
}