import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ClassLookup } from '../../../../models/student';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.html',
  styleUrls: ['./student-form.css']
})
export class StudentFormComponent {

  @Input() studentForm!: FormGroup;

  @Input() homeroomClasses: ClassLookup[] = [];

  @Input() title: string = '';

  @Input() buttonText: string = '';

  @Output() submitForm = new EventEmitter<void>();

  @Output() cancel = new EventEmitter<void>();

}