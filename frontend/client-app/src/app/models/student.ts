// Model dùng để hứng dữ liệu trả về từ API (.NET trả về)
export interface StudentResponse {
  studentId: number;
  studentCode: string;
  lastName: string;
  firstName: string;
  gender: string;
  dateOfBirth: string; // Nhận về dạng chuỗi ISO từ .NET để dễ hiển thị và format
  homeroomClassId: number;
  homeroomClassName: string;
  email: string;
}

// Model dùng để gửi dữ liệu từ Form lên API khi Thêm mới hoặc Sửa
export interface StudentCreateUpdate {
  studentCode: string;
  lastName: string;
  firstName: string;
  gender: string;
  dateOfBirth: string; // Gửi lên dạng chuỗi YYYY-MM-DD từ HTML input date
  homeroomClassId: number;
  email: string;
}