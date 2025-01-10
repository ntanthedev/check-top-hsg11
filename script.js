async function query(e) {
    e.preventDefault();
    e.stopPropagation();
    const sbd = e.target.sbd.value.trim();
    const data = await fetch('data.json').then(r => r.json());
    const resultDiv = document.getElementById('result');

    if (!sbd)
        return showError('Vui lòng nhập số báo danh');
    if (data[sbd]) {
        const s = data[sbd];
        const pRank = Object.values(data).filter(d => d.mon_thi === s.mon_thi).map(d => d.diem).sort((a, b) => b - a);
        resultDiv.innerHTML = `
            <div class="student-info">
                <h2>Thông tin thí sinh</h2>
                <div class="info-row">
                    <span class="info-label">Số báo danh:</span>
                    <span>${sbd}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Họ và tên:</span>
                    <span>${s.ten}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày sinh:</span>
                    <span>${s.ngay_sinh}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Quê quán:</span>
                    <span>${s.que_quan}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trường:</span>
                    <span>${s.truong}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Môn thi:</span>
                    <span>${s.mon_thi}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Điểm:</span>
                    <span>${s.diem}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Kết quả:</span>
                    <span>${s.ket_qua}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Xếp giải:</span>
                    <span>${s.xep_giai}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Thứ hạng:</span>
                    <span>${pRank.indexOf(s.diem) + 1}</span>
                </div>
            </div>
        `;
    } else
        showError(`Không tìm thấy thông tin của thí sinh có SBD ${sbd}`);
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="error">${message}</div>`;
}