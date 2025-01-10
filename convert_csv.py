import csv
import json

# Đọc file CSV và tạo dictionary chứa thông tin và thứ hạng
student_data = {}
rankings_by_subject = {}

with open('diem_thi.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')  # Sử dụng tab làm delimiter
    
    # Tạo dict tạm để sắp xếp điểm theo môn thi
    temp_subjects = {}
    
    for row in reader:
        sbd, ten, ngay_sinh, que_quan, truong, mon_thi, diem, ket_qua, xep_giai = row
        
        # Lưu thông tin học sinh
        student_data[sbd] = {
            'ten': ten.strip(),
            'ngay_sinh': ngay_sinh.strip(),
            'que_quan': que_quan.strip(),
            'truong': truong.strip(),
            'mon_thi': mon_thi.strip(),
            'diem': float(diem.strip()),
            'ket_qua': ket_qua.strip(),
            'xep_giai': xep_giai.strip()
        }
        
        # Gom nhóm học sinh theo môn thi
        if mon_thi not in temp_subjects:
            temp_subjects[mon_thi] = []
        temp_subjects[mon_thi].append((sbd, float(diem)))

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