function searchStudent() {
    const sbd = document.getElementById('sbd').value.trim();
    const resultDiv = document.getElementById('result');
    
    if (!sbd) {
        showError('Vui lòng nhập số báo danh');
        return;
    }

    if (studentData.hasOwnProperty(sbd)) {
        const student = studentData[sbd];
        const rank = rankingsBySubject[student.mon_thi][sbd];
        
        const html = `
            <div class="student-info">
                <h2>Thông tin thí sinh</h2>
                <div class="info-row">
                    <span class="info-label">Số báo danh:</span>
                    <span>${sbd}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Họ và tên:</span>
                    <span>${student.ten}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày sinh:</span>
                    <span>${student.ngay_sinh}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Quê quán:</span>
                    <span>${student.que_quan}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trường:</span>
                    <span>${student.truong}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Môn thi:</span>
                    <span>${student.mon_thi}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Điểm:</span>
                    <span>${student.diem}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Kết quả:</span>
                    <span>${student.ket_qua}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Xếp giải:</span>
                    <span>${student.xep_giai}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Thứ hạng:</span>
                    <span>${rank}</span>
                </div>
            </div>
        `;
        resultDiv.innerHTML = html;
    } else {
        showError(`Không tìm thấy thông tin của thí sinh có SBD ${sbd}`);
    }
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="error">${message}</div>`;
}