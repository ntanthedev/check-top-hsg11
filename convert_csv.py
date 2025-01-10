import csv
import json

# Đọc file CSV và tạo dictionary chứa thông tin và thứ hạng
student_data = {}
rankings_by_subject = {}

try:
    with open('diem_thi.csv', 'r', encoding='utf-8-sig') as f:
        # Đọc toàn bộ nội dung file
        content = f.readlines()
        
        # Bỏ qua header (dòng đầu tiên)
        rows = content[1:]
        
        # Tạo dict tạm để sắp xếp điểm theo môn thi
        temp_subjects = {}
        
        for line in rows:
            # Tách dữ liệu bằng dấu phẩy và loại bỏ khoảng trắng thừa
            row = [field.strip() for field in line.split(',')]
            
            # Kiểm tra đủ số trường dữ liệu
            if len(row) < 8:  # Tối thiểu phải có 8 trường (với xep_giai có thể trống)
                print(f"Warning: Dòng không đủ trường dữ liệu: {line}")
                continue
            
            try:
                sbd = str(row[0])
                ten = row[1]
                ngay_sinh = row[2]
                que_quan = row[3]
                truong = row[4]
                mon_thi = row[5]
                diem = float(row[6])  # Chuyển điểm sang số thực
                ket_qua = row[7]
                
                # Xử lý trường xep_giai
                xep_giai = row[8] if len(row) > 8 and row[8].strip() != "" else "Không"
                
                # Đối với những học sinh "Hỏng" thì xep_giai = "Không"
                if ket_qua.strip() == "Hỏng":
                    xep_giai = "Không"
                
                # Lưu thông tin học sinh
                student_data[sbd] = {
                    'ten': ten,
                    'ngay_sinh': ngay_sinh,
                    'que_quan': que_quan,
                    'truong': truong,
                    'mon_thi': mon_thi,
                    'diem': diem,
                    'ket_qua': ket_qua,
                    'xep_giai': xep_giai
                }
                
                # Gom nhóm học sinh theo môn thi
                if mon_thi not in temp_subjects:
                    temp_subjects[mon_thi] = []
                temp_subjects[mon_thi].append((sbd, diem))
                
            except ValueError as e:
                print(f"Warning: Lỗi chuyển đổi dữ liệu ở dòng: {line}")
                print(f"Chi tiết lỗi: {str(e)}")
                continue

        # Tính thứ hạng cho từng môn thi
        for mon_thi, students in temp_subjects.items():
            # Sắp xếp theo điểm giảm dần
            sorted_students = sorted(students, key=lambda x: x[1], reverse=True)
            rankings = {}
            current_rank = 1
            prev_score = None
            
            for idx, (sbd, diem) in enumerate(sorted_students):
                if diem != prev_score:
                    current_rank = idx + 1
                rankings[sbd] = current_rank
                prev_score = diem
                
            rankings_by_subject[mon_thi] = rankings

    # Tạo nội dung file JavaScript
    js_content = f"""
    const studentData = {json.dumps(student_data, ensure_ascii=False)};
    const rankingsBySubject = {json.dumps(rankings_by_subject, ensure_ascii=False)};
    """

    # Ghi ra file data.js
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("Đã chuyển đổi dữ liệu thành công!")
    print(f"Tổng số học sinh: {len(student_data)}")
    print("Số học sinh theo môn thi:")
    for mon_thi in rankings_by_subject.keys():
        print(f"- {mon_thi}: {len(rankings_by_subject[mon_thi])}")

except Exception as e:
    print(f"Có lỗi xảy ra: {str(e)}")
    print("Vui lòng kiểm tra lại định dạng file CSV và thử lại.")