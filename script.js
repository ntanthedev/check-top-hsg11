// Biến toàn cục để lưu trữ dữ liệu
let globalData = {};
let subjects = [];

// Tải dữ liệu khi trang được tải
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Lấy dữ liệu từ JSON
        const response = await fetch('data.json');
        globalData = await response.json();
        
        // Lấy danh sách môn học duy nhất
        const subjectSet = new Set();
        Object.values(globalData).forEach(student => {
            if (student.mon_thi) {
                subjectSet.add(student.mon_thi);
            }
        });
        subjects = Array.from(subjectSet).sort();
        
        // Điền danh sách môn học vào dropdown
        const subjectSelect = document.getElementById('subjectSelect');
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
        
        // Hiển thị container thống kê
        document.querySelector('.stats-container').style.display = 'block';
        
        // Cập nhật thống kê ban đầu
        updateStats();
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

// Hàm tra cứu theo SBD
async function query(e) {
    e.preventDefault();
    e.stopPropagation();
    const sbd = e.target.sbd.value.trim();
    
    // Sử dụng dữ liệu đã tải sẵn nếu có
    const data = globalData && Object.keys(globalData).length > 0 ? 
        globalData : await fetch('data.json').then(r => r.json());
    
    const resultDiv = document.getElementById('result');

    if (!sbd)
        return showError('Vui lòng nhập số báo danh');
    
    // Kiểm tra xem đây có phải là tìm kiếm theo tên không
    if (isNaN(sbd)) {
        return searchByName(sbd, data, resultDiv);
    }
    
    if (data[sbd]) {
        const s = data[sbd];
        const pRank = Object.values(data).filter(d => d.mon_thi === s.mon_thi).map(d => d.diem).sort((a, b) => b - a);
        const rank = pRank.indexOf(s.diem) + 1;
        const totalStudents = pRank.length;
        const rankPercent = Math.round((rank / totalStudents) * 100);
        
        // Xác định lớp CSS dựa trên kết quả và xếp giải
        let resultClass = '';
        if (s.ket_qua === "Đạt") {
            if (s.xep_giai === "Nhất") resultClass = 'result-first';
            else if (s.xep_giai === "Nhì") resultClass = 'result-second';
            else if (s.xep_giai === "Ba") resultClass = 'result-third';
            else if (s.xep_giai === "Khuyến khích") resultClass = 'result-encourage';
            else resultClass = 'result-pass';
        } else if (s.ket_qua === "Hỏng") {
            resultClass = 'result-fail';
        } else {
            resultClass = 'result-absent';
        }
        
        resultDiv.innerHTML = `
            <div class="student-info ${resultClass}">
                <h2>${s.ten}</h2>
                
                <div class="basic-info">
                    <div class="info-row">
                        <span class="info-label">Số báo danh:</span>
                        <span class="info-value">${sbd}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ngày sinh:</span>
                        <span class="info-value">${s.ngay_sinh}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nơi sinh:</span>
                        <span class="info-value">${s.noi_sinh}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Giới tính:</span>
                        <span class="info-value">${s.gioi_tinh}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Lớp:</span>
                        <span class="info-value">${s.lop}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trường:</span>
                        <span class="info-value">${s.truong}</span>
                    </div>
                </div>
                
                <div class="result-info">
                    <h3>Kết quả thi</h3>
                    <div class="info-row">
                        <span class="info-label">Môn thi:</span>
                        <span class="info-value">${s.mon_thi}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Điểm số:</span>
                        <span class="info-value score">${s.diem}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Kết quả:</span>
                        <span class="info-value result-status">${s.ket_qua}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Xếp giải:</span>
                        <span class="info-value achievement">${s.xep_giai || "Không có"}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Thứ hạng:</span>
                        <span class="info-value">${rank}/${totalStudents} (Top ${rankPercent}%)</span>
                    </div>
                </div>
            </div>
        `;
    } else
        showError(`Không tìm thấy thông tin của thí sinh có SBD ${sbd}`);
}

// Hàm tìm kiếm theo tên
function searchByName(nameQuery, data, resultDiv) {
    if (typeof nameQuery === 'object' && nameQuery.preventDefault) {
        nameQuery.preventDefault();
        nameQuery = document.getElementById('studentName').value.trim();
    }
    
    const name = nameQuery.toLowerCase();
    
    // Lấy dữ liệu từ cache toàn cục nếu có
    const searchData = data || globalData;
    
    // Tìm tất cả học sinh có tên chứa chuỗi tìm kiếm
    const matchingStudents = Object.entries(searchData).filter(([_, student]) => 
        student.ten.toLowerCase().includes(name)
    );
    
    if (matchingStudents.length === 0) {
        showError(`Không tìm thấy học sinh nào có tên chứa "${nameQuery}"`);
    } else if (matchingStudents.length === 1) {
        // Nếu chỉ có 1 kết quả, hiển thị chi tiết
        const [sbd, _] = matchingStudents[0];
        // Truy vấn lại với SBD
        query({ 
            preventDefault: () => {}, 
            stopPropagation: () => {},
            target: { sbd: { value: sbd } }
        });
    } else {
        // Nhóm thí sinh theo trường
        const schoolGroups = {};
        matchingStudents.forEach(([sbd, student]) => {
            const school = student.truong;
            if (!schoolGroups[school]) {
                schoolGroups[school] = [];
            }
            schoolGroups[school].push([sbd, student]);
        });
        
        // Nếu có nhiều kết quả, hiển thị danh sách để chọn với giao diện card đẹp
        resultDiv.innerHTML = `
            <div class="search-results">
                <h3>Tìm thấy ${matchingStudents.length} thí sinh có tên "${nameQuery}"</h3>
                <div class="results-summary">
                    <p>Vui lòng chọn một thí sinh từ danh sách bên dưới:</p>
                </div>
                ${Object.entries(schoolGroups).map(([school, students]) => `
                    <div class="school-group">
                        <div class="school-header">
                            <i class="fas fa-school"></i> ${school}
                        </div>
                        <div class="students-grid">
                            ${students.map(([sbd, student]) => `
                                <div class="student-card" onclick="selectStudent('${sbd}')">
                                    <div class="student-card-header">
                                        <span class="student-name">${student.ten}</span>
                                        <span class="student-sbd">SBD: ${sbd}</span>
                                    </div>
                                    <div class="student-card-body">
                                        <div class="student-detail">
                                            <span class="detail-label"><i class="fas fa-user-graduate"></i> Lớp:</span>
                                            <span class="detail-value">${student.lop}</span>
                                        </div>
                                        <div class="student-detail">
                                            <span class="detail-label"><i class="fas fa-book"></i> Môn thi:</span>
                                            <span class="detail-value">${student.mon_thi}</span>
                                        </div>
                                        <div class="student-detail">
                                            <span class="detail-label"><i class="fas fa-trophy ${getAchievementIconClass(student.xep_giai)}"></i> Kết quả:</span>
                                            <span class="detail-value">${student.ket_qua === "Đạt" ? 
                                                `<span class="badge badge-success">Đạt${student.xep_giai ? ` - ${student.xep_giai}` : ''}</span>` : 
                                                '<span class="badge badge-fail">Không đạt</span>'
                                            }</span>
                                        </div>
                                    </div>
                                    <div class="student-card-footer">
                                        <span class="view-details">Xem chi tiết <i class="fas fa-arrow-right"></i></span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Hàm phụ trợ để lấy lớp CSS cho biểu tượng giải thưởng
function getAchievementIconClass(achievement) {
    if (!achievement) return '';
    switch (achievement) {
        case 'Nhất': return 'achievement-first';
        case 'Nhì': return 'achievement-second';
        case 'Ba': return 'achievement-third';
        case 'Khuyến khích': return 'achievement-encourage';
        default: return '';
    }
}

// Hàm chọn một học sinh từ danh sách kết quả tìm kiếm
function selectStudent(sbd) {
    document.getElementById('sbd').value = sbd;
    query({ 
        preventDefault: () => {}, 
        stopPropagation: () => {},
        target: { sbd: { value: sbd } }
    });
}

// Hàm hiển thị lỗi
function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="error">${message}</div>`;
}

// Hàm cập nhật thống kê
function updateStats() {
    const subjectSelect = document.getElementById('subjectSelect');
    const selectedSubject = subjectSelect.value;
    
    if (!globalData || Object.keys(globalData).length === 0) return;
    
    // Lọc sinh viên theo môn học nếu cần
    let filteredStudents = Object.values(globalData);
    if (selectedSubject !== 'all') {
        filteredStudents = filteredStudents.filter(student => student.mon_thi === selectedSubject);
    }
    
    // Tính toán các số liệu thống kê
    const totalStudents = filteredStudents.length;
    
    const passCount = filteredStudents.filter(student => student.ket_qua === "Đạt").length;
    const passRate = totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0;
    
    const firstPrize = filteredStudents.filter(student => student.xep_giai === "Nhất").length;
    const secondPrize = filteredStudents.filter(student => student.xep_giai === "Nhì").length;
    
    // Cập nhật giao diện
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('passRate').textContent = `${passRate}%`;
    document.getElementById('firstPrize').textContent = firstPrize;
    document.getElementById('secondPrize').textContent = secondPrize;
}

// Thêm vào cuối file script.js để xử lý tab
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý chuyển đổi tab
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Xóa active class từ tất cả buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Thêm active class cho button được click
                button.classList.add('active');
                
                // Ẩn tất cả tab content
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.style.display = 'none';
                });
                
                // Hiển thị tab content tương ứng
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).style.display = 'block';
                
                // Reset kết quả
                document.getElementById('result').innerHTML = '';
            });
        });
    }
});
