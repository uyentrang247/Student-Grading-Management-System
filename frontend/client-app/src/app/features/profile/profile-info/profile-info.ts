import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../services/profile';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-info.html',
  styleUrls: ['./profile-info.css']
})
export class ProfileInfoComponent {
  @Input() profile!: UserProfile;
  @Output() edit = new EventEmitter<void>();
  @Output() changePassword = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  getRoleDisplayName(): string {
    if (this.profile.role === 'Admin') return 'Quản trị viên';
    if (this.profile.role === 'Lecturer') return 'Giảng viên';
    return '';
  }

  onEdit(): void {
    this.edit.emit();
    this.cdr.detectChanges();
  }

  onChangePassword(): void {
    this.changePassword.emit();
    this.cdr.detectChanges();
  }
}