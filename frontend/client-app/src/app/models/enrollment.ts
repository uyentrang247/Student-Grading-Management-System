/**
 * 1. Cấu trúc Lớp học phần (Dùng cho màn hình danh sách lớp)
 */
export interface CourseClass {
  id?: number;
  classCode: string;
  subjectId: number;
  semesterId: number;
  lecturerId?: number | null;
  subjectName?: string;
  lecturerName?: string;
  semester?: string;
  academicYear?: string;
  credits?: number;
}

/**
 * 2. Cấu trúc thông tin sinh viên nằm trong lớp học phần
 * Đã làm phẳng các trường DateOfBirth (Ngày sinh) và HomeroomClassName (Lớp sinh hoạt)
 * tương ứng với bảng hiển thị trên giao diện của bạn.
 */
export interface EnrollmentStudent {
  studentId: number;
  studentCode: string;
  lastName: string;  
  firstName: string; 
  gender: string;             
  dateOfBirth: string;        
  homeroomClassName: string;  
}


export interface ClassDetailsResponse {
  courseClassId: number;
  className: string;   // Mã lớp học phần (Ví dụ: 4901)
  subjectName: string; // Tên môn học (Ví dụ: Quản trị mạng)
  students: EnrollmentStudent[]; 
}

/**
 * Cấu trúc kết quả trả về khi gọi các API Thêm thủ công / Xóa sinh viên
 */
export interface ServiceResult {
  isSuccess: boolean;
  message: string;
}

/**
 *  Cấu trúc kết quả trả về khi gọi API Import file Excel bằng Cache
 */
export interface ExcelImportResult {
  isSuccess: boolean;
  message: string;
  errors: string[]; // Danh sách chuỗi chứa các dòng bị lỗi chi tiết trong file Excel
}