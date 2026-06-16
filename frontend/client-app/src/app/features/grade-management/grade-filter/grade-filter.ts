import { Component, Output, EventEmitter, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grade-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grade-filter.html',
  styleUrls: ['./grade-filter.css']
})
export class GradeFilterComponent {
  @Input() courseClasses: any[] = [];
  @Input() selectedClassId: number = 0;
  @Output() classChange = new EventEmitter<number>();
  @Output() filterChange = new EventEmitter<{filtered: any[], keyword: string, showFailOnly: boolean}>();
  @Output() reset = new EventEmitter<void>();

  searchKeyword: string = '';
  showFailOnly: boolean = false;
  @Input() originalStudents: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  onClassChange(): void {
    this.classChange.emit(this.selectedClassId);
  }

  onFilter(): void {
    let filtered = [...this.originalStudents];
    
    const keyword = this.searchKeyword.trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(s =>
        s.studentCode.toLowerCase().includes(keyword) ||
        s.fullName.toLowerCase().includes(keyword)
      );
    }
    
    if (this.showFailOnly) {
      filtered = filtered.filter(s => {
        const avg = s.processScore !== null && s.finalScore !== null
          ? Math.round((s.processScore * 0.4 + s.finalScore * 0.6) * 10) / 10
          : null;
        return avg !== null && avg < 4.0;
      });
    }
    
    this.filterChange.emit({
      filtered: filtered,
      keyword: this.searchKeyword,
      showFailOnly: this.showFailOnly
    });
    this.cdr.detectChanges();
  }

  onReset(): void {
    this.searchKeyword = '';
    this.showFailOnly = false;
    this.reset.emit();
    this.onFilter();
  }
}