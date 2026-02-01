// 지역 데이터
const regionData = {
    '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '경기': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '김포시', '광명시', '광주시', '군포시', '하남시', '오산시', '양주시', '이천시', '구리시', '안성시', '포천시', '의왕시', '양평군', '여주시', '동두천시', '가평군', '과천시', '연천군'],
    '부산': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
    '대구': ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군'],
    '인천': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    '광주': ['광산구', '남구', '동구', '북구', '서구'],
    '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
    '울산': ['남구', '동구', '북구', '중구', '울주군'],
    '세종': ['세종시'],
    '강원': ['강릉시', '동해시', '삼척시', '속초시', '원주시', '춘천시', '태백시'],
    '충북': ['제천시', '청주시', '충주시'],
    '충남': ['계룡시', '공주시', '논산시', '보령시', '서산시', '아산시', '천안시', '당진시'],
    '전북': ['군산시', '김제시', '남원시', '익산시', '전주시', '정읍시'],
    '전남': ['광양시', '나주시', '목포시', '순천시', '여수시'],
    '경북': ['경산시', '경주시', '구미시', '김천시', '문경시', '상주시', '안동시', '영주시', '영천시', '포항시'],
    '경남': ['거제시', '김해시', '밀양시', '사천시', '양산시', '진주시', '창원시', '통영시'],
    '제주': ['서귀포시', '제주시']
};

// 연봉 구간 정의
const salaryRanges = ['2000~2400', '2400~2800', '2800~3200', '3200~3600', '3600~4000', '4000~5000', '5000~6000', '6000~7000', '7000~8000', '8000~10000', '10000+'];

// 데이터 로드
function loadSalaryData() {
    const data = localStorage.getItem('salaryData');
    return data ? JSON.parse(data) : [];
}

function saveSalaryData(newData) {
    const data = loadSalaryData();
    data.push(newData);
    localStorage.setItem('salaryData', JSON.stringify(data));
}

function loadUserProfile() {
    const profile = localStorage.getItem('userProfile');
    if (profile) return JSON.parse(profile);
    return {
        profession: '의사',
        province: '서울',
        city: '강남구',
        experience: '5년차'
    };
}

// 필터링된 데이터 가져오기
function getFilteredData() {
    const allData = loadSalaryData();
    const userProfile = loadUserProfile();
    const province = document.getElementById('filterProvince').value;
    const experience = document.getElementById('filterExperience').value;
    
    return allData.filter(item => {
        if (item.profession !== userProfile.profession) return false;
        if (province !== 'all' && !item.location.includes(province)) return false;
        if (experience !== 'all' && item.experience !== experience) return false;
        return true;
    });
}

// 전국 데이터 가져오기
function getNationalData() {
    const allData = loadSalaryData();
    const userProfile = loadUserProfile();
    const experience = document.getElementById('filterExperience').value;
    
    return allData.filter(item => {
        if (item.profession !== userProfile.profession) return false;
        if (experience !== 'all' && item.experience !== experience) return false;
        return true;
    });
}

// 통계 계산
function calculateStats(data) {
    if (data.length === 0) {
        return { avg: 0, topRange: '-', count: 0 };
    }
    
    const rangeCounts = {};
    data.forEach(item => {
        rangeCounts[item.salaryRange] = (rangeCounts[item.salaryRange] || 0) + 1;
    });
    
    let topRange = '-';
    let maxCount = 0;
    for (const range in rangeCounts) {
        if (rangeCounts[range] > maxCount) {
            maxCount = rangeCounts[range];
            topRange = range;
        }
    }
    
    // 평균 계산 (최다 구간의 중간값)
    let avgValue = 0;
    if (topRange !== '-' && topRange !== '10000+') {
        const parts = topRange.split('~');
        avgValue = Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2);
    }
    
    return { avg: avgValue, topRange, count: data.length, rangeCounts };
}

// 요약 통계 업데이트
function updateSummary() {
    const filteredData = getFilteredData();
    const stats = calculateStats(filteredData);
    
    document.getElementById('avgSalary').textContent = stats.avg > 0 ? `${stats.avg.toLocaleString()}만원` : '-';
    document.getElementById('topRange').textContent = stats.topRange !== '-' ? stats.topRange.replace('~', ' ~ ') + '만원' : '-';
    document.getElementById('responseCount').textContent = `${stats.count}명`;
}

// 차트 렌더링
function renderChart() {
    const filteredData = getFilteredData();
    const nationalData = getNationalData();
    const container = document.getElementById('chartContainer');
    
    if (filteredData.length === 0 && nationalData.length === 0) {
        container.innerHTML = `
            <div class="chart-empty">
                <i class="fas fa-chart-bar"></i>
                <p>표시할 데이터가 없습니다</p>
            </div>
        `;
        return;
    }
    
    const filteredStats = calculateStats(filteredData);
    const nationalStats = calculateStats(nationalData);
    
    const maxCount = Math.max(
        ...Object.values(filteredStats.rangeCounts || {}),
        ...Object.values(nationalStats.rangeCounts || {})
    );
    
    container.innerHTML = salaryRanges.map(range => {
        const filteredCount = filteredStats.rangeCounts[range] || 0;
        const nationalCount = nationalStats.rangeCounts[range] || 0;
        
        const filteredHeight = maxCount > 0 ? (filteredCount / maxCount * 100) : 0;
        const nationalHeight = maxCount > 0 ? (nationalCount / maxCount * 100) : 0;
        
        return `
            <div class="chart-group">
                <div class="chart-bars">
                    <div class="chart-bar" style="height: ${filteredHeight}%">
                        ${filteredCount > 0 ? `<div class="chart-bar-tooltip">${filteredCount}명</div>` : ''}
                    </div>
                    <div class="chart-bar national" style="height: ${nationalHeight}%">
                        ${nationalCount > 0 ? `<div class="chart-bar-tooltip">${nationalCount}명</div>` : ''}
                    </div>
                </div>
                <div class="chart-label">${range.replace('~', '-')}<br>만원</div>
            </div>
        `;
    }).join('');
}

// 필터 변경 이벤트
document.getElementById('filterProvince').addEventListener('change', () => {
    updateSummary();
    renderChart();
});

document.getElementById('filterExperience').addEventListener('change', () => {
    updateSummary();
    renderChart();
});

// 참여하기 버튼
document.getElementById('btnParticipate').addEventListener('click', () => {
    document.getElementById('salaryModal').classList.add('show');
    document.body.style.overflow = 'hidden';
});

// 모달 닫기
function closeModal() {
    document.getElementById('salaryModal').classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('inputSalary').value = '';
}

document.getElementById('btnCloseModal').addEventListener('click', closeModal);
document.getElementById('btnCancelModal').addEventListener('click', closeModal);

document.getElementById('salaryModal').addEventListener('click', (e) => {
    if (e.target.id === 'salaryModal') closeModal();
});

// 연봉 정보 제출
document.getElementById('btnSubmitSalary').addEventListener('click', () => {
    const salaryRange = document.getElementById('inputSalary').value;
    
    if (!salaryRange) {
        alert('연봉 구간을 선택해주세요.');
        return;
    }
    
    const profile = loadUserProfile();
    const newData = {
        profession: profile.profession,
        location: '서울시',
        experience: profile.experience,
        salaryRange,
        createdAt: new Date().toISOString()
    };
    
    saveSalaryData(newData);
    updateSummary();
    renderChart();
    closeModal();
    
    alert('연봉 정보가 등록되었습니다. 감사합니다!');
});

// 초기 로드
updateSummary();
renderChart();
