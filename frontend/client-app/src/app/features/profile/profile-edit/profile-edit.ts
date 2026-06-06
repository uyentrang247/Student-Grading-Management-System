import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../../services/profile';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile-edit.css']
})
export class ProfileEditComponent implements OnInit {
  @Input() profile!: UserProfile;
  @Output() save = new EventEmitter<{ fullName: string; email: string }>();
  @Output() cancel = new EventEmitter<void>();

  editForm = { fullName: '', email: '' };
  errorMessage = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.editForm = {
      fullName: this.profile.fullName,
      email: this.profile.email
    };
    this.cdr.detectChanges();
  }

  onSave(): void {
    if (!this.editForm.fullName.trim()) {
      this.errorMessage = 'Họ tên không được để trống';
      this.cdr.detectChanges();
      setTimeout(() => { 
        this.errorMessage = ''; 
        this.cdr.detectChanges();
      }, 3000);
      return;
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!this.editForm.email.trim()) {
      this.errorMessage = 'Email không được để trống';
      this.cdr.detectChanges();
      setTimeout(() => { 
        this.errorMessage = ''; 
        this.cdr.detectChanges();
      }, 3000);
      return;
    }
    if (!emailRegex.test(this.editForm.email)) {
      this.errorMessage = 'Email không đúng định dạng';
      this.cdr.detectChanges();
      setTimeout(() => { 
        this.errorMessage = ''; 
        this.cdr.detectChanges();
      }, 3000);
      return;
    }
    
    this.save.emit(this.editForm);
    this.cdr.detectChanges();
  }

  onCancel(): void {
    this.cancel.emit();
    this.cdr.detectChanges();
  }
}