// 지역 데이터 (시/도별 시/구)
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
    '강원': ['강릉시', '동해시', '삼척시', '속초시', '원주시', '춘천시', '태백시', '고성군', '양구군', '양양군', '영월군', '인제군', '정선군', '철원군', '평창군', '홍천군', '화천군', '횡성군'],
    '충북': ['제천시', '청주시', '충주시', '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '증평군', '진천군'],
    '충남': ['계룡시', '공주시', '논산시', '보령시', '서산시', '아산시', '천안시', '금산군', '당진시', '부여군', '서천군', '예산군', '청양군', '태안군', '홍성군'],
    '전북': ['군산시', '김제시', '남원시', '익산시', '전주시', '정읍시', '고창군', '무주군', '부안군', '순창군', '완주군', '임실군', '장수군', '진안군'],
    '전남': ['광양시', '나주시', '목포시', '순천시', '여수시', '강진군', '고흥군', '곡성군', '구례군', '담양군', '무안군', '보성군', '신안군', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '경북': ['경산시', '경주시', '구미시', '김천시', '문경시', '상주시', '안동시', '영주시', '영천시', '포항시', '고령군', '군위군', '봉화군', '성주군', '영덕군', '영양군', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군'],
    '경남': ['거제시', '김해시', '밀양시', '사천시', '양산시', '진주시', '창원시', '통영시', '거창군', '고성군', '남해군', '산청군', '의령군', '창녕군', '하동군', '함안군', '함양군', '합천군'],
    '제주': ['서귀포시', '제주시']
};

// 페이지 잠금 함수
function lockPage() {
    // 주요 콘텐츠 영역 블러 처리 (내 연봉 카드, 계산기, 커뮤니티는 제외)
    const sectionsToBlur = [
        '.distribution-section',
        '.region-salary-section',
        '.stats-grid'
    ];
    
    sectionsToBlur.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.filter = 'blur(4px)';
            element.style.cursor = 'pointer';
            element.style.userSelect = 'none';
            
            // 클릭 시 안내 메시지 표시
            element.addEventListener('click', showLockNotice);
        }
    });
}

// 잠금 안내 메시지 표시
function showLockNotice() {
    // 이미 표시되어 있으면 무시
    if (document.getElementById('salaryLockNotice')) {
        return;
    }
    
    const notice = document.createElement('div');
    notice.id = 'salaryLockNotice';
    notice.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        text-align: center;
        padding: 60px 40px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        animation: fadeIn 0.3s ease;
    `;
    
    notice.innerHTML = `
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -45%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
        </style>
        <div style="font-size: 80px; color: #00b8a9; margin-bottom: 24px;">
            <i class="fas fa-lock"></i>
        </div>
        <h2 style="font-size: 28px; color: #1f2937; margin-bottom: 16px;">연봉 정보를 입력해주세요</h2>
        <p style="font-size: 16px; color: #6b7280; margin-bottom: 32px; line-height: 1.6;">
            연봉 정보 페이지의 모든 기능을 이용하려면<br>
            먼저 회원님의 연봉 정보를 입력해주세요.<br>
            <strong style="color: #00b8a9;">정보를 공유하고 다른 사람들의 연봉도 확인하세요!</strong>
        </p>
        <button id="btnGoToInput" style="
            padding: 14px 32px;
            background: linear-gradient(135deg, #00b8a9 0%, #00a896 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 184, 169, 0.3);
            transition: all 0.3s ease;
            margin-right: 12px;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0, 184, 169, 0.4)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 184, 169, 0.3)'">
            <i class="fas fa-edit"></i> 연봉 정보 입력하기
        </button>
        <button id="btnCloseNotice" style="
            padding: 14px 24px;
            background: #e5e7eb;
            color: #6b7280;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        " onmouseover="this.style.background='#d1d5db'"
           onmouseout="this.style.background='#e5e7eb'">
            닫기
        </button>
    `;
    
    document.body.appendChild(notice);
    
    // 버튼 클릭 이벤트
    document.getElementById('btnGoToInput').addEventListener('click', function() {
        document.getElementById('salaryModal').style.display = 'flex';
    });
    
    document.getElementById('btnCloseNotice').addEventListener('click', function() {
        notice.remove();
    });
}

// 간단한 막대 그래프 초기화
let salaryBarChart = null;

// 연차별 연봉 범위 막대 그래프 생성 (주식 차트 스타일)
function createSimpleBarChart() {
    const ctx = document.getElementById('salaryBarChart');
    if (!ctx) return;
    
    const salaryData = loadSalaryData();
    
    // 연차별 데이터 수집 (1~10년차)
    const yearlyData = [];
    
    for (let year = 1; year <= 10; year++) {
        const yearData = salaryData.filter(item => {
            const exp = parseInt(item.experience);
            return exp === year;
        });
        
        if (yearData.length > 0) {
            // 연봉을 숫자로 변환
            const salaryValues = yearData.map(item => {
                const range = item.salary;
                if (range === '10000만원 이상') return 10000;
                const [min, max] = range.replace('만원', '').split('~').map(Number);
                return (min + max) / 2;
            });
            
            const min = Math.min(...salaryValues);
            const max = Math.max(...salaryValues);
            const avg = salaryValues.reduce((a, b) => a + b, 0) / salaryValues.length;
            
            yearlyData.push({
                year: year,
                min: min,
                max: max,
                avg: avg,
                range: max - min
            });
        } else {
            yearlyData.push({
                year: year,
                min: 0,
                max: 0,
                avg: 0,
                range: 0
            });
        }
    }
    
    // 기존 차트 제거
    if (salaryBarChart) {
        salaryBarChart.destroy();
    }
    
    salaryBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yearlyData.map(d => d.year + '년차'),
            datasets: [
                {
                    label: '최저 연봉',
                    data: yearlyData.map(d => d.min),
                    backgroundColor: 'rgba(0, 184, 169, 0)',
                    borderColor: 'rgba(0, 184, 169, 0)',
                    borderWidth: 0,
                    order: 2
                },
                {
                    label: '연봉 범위',
                    data: yearlyData.map(d => d.range),
                    backgroundColor: 'rgba(0, 184, 169, 0.2)',
                    borderColor: 'rgba(0, 184, 169, 0.8)',
                    borderWidth: 2,
                    borderRadius: 4,
                    order: 2
                },
                {
                    label: '평균 연봉',
                    data: yearlyData.map(d => d.avg),
                    type: 'line',
                    borderColor: '#ef4444',
                    backgroundColor: '#ef4444',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.3,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 12,
                    titleFont: {
                        size: 13
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const data = yearlyData[index];
                            
                            if (context.dataset.label === '평균 연봉') {
                                return '평균: ' + Math.round(data.avg).toLocaleString() + '만원';
                            } else if (context.dataset.label === '연봉 범위') {
                                return [
                                    '최고: ' + Math.round(data.max).toLocaleString() + '만원',
                                    '최저: ' + Math.round(data.min).toLocaleString() + '만원',
                                    '평균: ' + Math.round(data.avg).toLocaleString() + '만원'
                                ];
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#6b7280'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: false
                    },
                    ticks: {
                        display: false,
                        maxTicksLimit: 6
                    },
                    grid: {
                        color: '#f3f4f6',
                        drawTicks: false
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            }
        }
    });
}

// 사용자의 연봉 퍼센타일 계산
function calculatePercentile(userSalary) {
    const salaryData = loadSalaryData();
    
    if (!userSalary || salaryData.length === 0) {
        return null;
    }
    
    // 연봉 범위를 숫자로 변환 (중간값 사용)
    const salaryValues = salaryData.map(item => {
        const range = item.salary;
        if (range === '10000만원 이상') return 10000;
        const [min, max] = range.replace('만원', '').split('~').map(Number);
        return (min + max) / 2;
    });
    
    // 사용자 연봉 변환
    let userValue;
    if (userSalary === '10000만원 이상') {
        userValue = 10000;
    } else {
        const [min, max] = userSalary.replace('만원', '').split('~').map(Number);
        userValue = (min + max) / 2;
    }
    
    // 퍼센타일 계산
    const lowerCount = salaryValues.filter(v => v < userValue).length;
    const percentile = Math.round((lowerCount / salaryValues.length) * 100);
    
    return 100 - percentile; // 상위 퍼센타일로 변환
}

// 연봉 실수령액 계산
function calculateSalary() {
    const salaryInput = document.getElementById('calcSalary');
    const salary = parseInt(salaryInput.value);
    
    if (!salary || salary <= 0) {
        alert('연봉을 입력해주세요.');
        salaryInput.focus();
        return;
    }
    
    if (salary > 100000) {
        alert('연봉은 100,000만원 이하로 입력해주세요.');
        salaryInput.focus();
        return;
    }
    
    // 연봉을 원 단위로 계산 (만원 -> 원)
    const yearlyTotal = salary * 10000;
    
    // 4대보험: 약 9% (국민연금 4.5%, 건강보험 3.545%, 장기요양 0.4545%, 고용보험 0.9%)
    const insurance = Math.round(yearlyTotal * 0.09);
    
    // 소득세: 간이세액 기준 약 6.6%
    const incomeTax = Math.round(yearlyTotal * 0.066);
    
    // 지방소득세: 소득세의 10% (약 0.66%)
    const localTax = Math.round(yearlyTotal * 0.0066);
    
    // 총 공제액
    const totalDeduction = insurance + incomeTax + localTax;
    
    // 실수령액
    const yearlyNet = yearlyTotal - totalDeduction;
    const monthlyNet = Math.round(yearlyNet / 12);
    
    // 결과 표시 (애니메이션 효과)
    const resultDiv = document.getElementById('calculatorResult');
    resultDiv.style.opacity = '0';
    
    setTimeout(() => {
        document.getElementById('totalSalary').textContent = (salary).toLocaleString() + '만원';
        document.getElementById('insurance').textContent = '- ' + Math.round(insurance / 10000).toLocaleString() + '만원';
        document.getElementById('incomeTax').textContent = '- ' + Math.round(incomeTax / 10000).toLocaleString() + '만원';
        document.getElementById('localTax').textContent = '- ' + Math.round(localTax / 10000).toLocaleString() + '만원';
        document.getElementById('monthlyNet').textContent = Math.round(monthlyNet / 10000).toLocaleString() + '만원';
        document.getElementById('yearlyNet').textContent = Math.round(yearlyNet / 10000).toLocaleString() + '만원';
        
        resultDiv.style.transition = 'opacity 0.3s ease';
        resultDiv.style.opacity = '1';
    }, 150);
}

// 실수령액 역산 (실수령액 → 연봉)
function reverseCalculateSalary() {
    const netSalaryInput = document.getElementById('calcNetSalary');
    const monthlyNet = parseInt(netSalaryInput.value);
    
    if (!monthlyNet || monthlyNet <= 0) {
        alert('원하는 월 실수령액을 입력해주세요.');
        netSalaryInput.focus();
        return;
    }
    
    if (monthlyNet > 10000) {
        alert('월 실수령액은 10,000만원 이하로 입력해주세요.');
        netSalaryInput.focus();
        return;
    }
    
    // 월 실수령액을 원 단위로
    const monthlyNetAmount = monthlyNet * 10000;
    const yearlyNetAmount = monthlyNetAmount * 12;
    
    // 공제율: 4대보험(9%) + 소득세(6.6%) + 지방소득세(0.66%) = 약 16.26%
    // 실수령 = 연봉 × (1 - 0.1626)
    // 연봉 = 실수령 / (1 - 0.1626) = 실수령 / 0.8374
    const deductionRate = 0.1626;
    const requiredYearlySalary = Math.round(yearlyNetAmount / (1 - deductionRate));
    
    // 결과 표시 (애니메이션 효과)
    const resultDiv = document.getElementById('reverseCalculatorResult');
    resultDiv.style.opacity = '0';
    
    setTimeout(() => {
        document.getElementById('targetMonthly').textContent = monthlyNet.toLocaleString() + '만원';
        document.getElementById('targetYearly').textContent = Math.round(yearlyNetAmount / 10000).toLocaleString() + '만원';
        document.getElementById('requiredSalary').textContent = Math.round(requiredYearlySalary / 10000).toLocaleString() + '만원';
        
        resultDiv.style.transition = 'opacity 0.3s ease';
        resultDiv.style.opacity = '1';
    }, 150);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 연봉 계산기
    const btnCalculate = document.getElementById('btnCalculate');
    if (btnCalculate) {
        btnCalculate.addEventListener('click', calculateSalary);
    }

    const calcSalaryInput = document.getElementById('calcSalary');
    if (calcSalaryInput) {
        calcSalaryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateSalary();
            }
        });
    }

    // 실수령액 환산기
    const btnReverseCalculate = document.getElementById('btnReverseCalculate');
    if (btnReverseCalculate) {
        btnReverseCalculate.addEventListener('click', reverseCalculateSalary);
    }

    const reverseNetInput = document.getElementById('reverseNetSalary');
    if (reverseNetInput) {
        reverseNetInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                reverseCalculateSalary();
            }
        });
    }

    // 커뮤니티 더보기 버튼
    const btnCommunityMore = document.querySelector('.community-section .btn-more');
    if (btnCommunityMore) {
        btnCommunityMore.addEventListener('click', function(e) {
            e.preventDefault();
            // 실제 구현 시 커뮤니티 페이지로 이동
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                alert('커뮤니티 전체 페이지는 준비 중입니다!\n곧 다양한 연봉 정보와 이야기를 만나보실 수 있습니다.');
            }, 300);
        });
    }

    // 커뮤니티 카드 클릭
    document.querySelectorAll('.community-card').forEach((card, index) => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 카드 클릭 효과
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 실제 구현 시 게시글 상세 페이지로 이동
            const titles = [
                '의사 5년차 연봉 협상 후기 공유합니다',
                '간호사 3년차 이직 시 적정 연봉은?',
                '2026년 의료업계 연봉 인상률 통계',
                '약사 경력 10년, 연봉 상승 곡선 공유'
            ];
            
            setTimeout(() => {
                alert(`📝 ${titles[index]}\n\n게시글 상세 페이지는 준비 중입니다.\n곧 다양한 연봉 정보와 커뮤니티 기능을 만나보실 수 있습니다!`);
            }, 200);
        });
        
        // 호버 효과 개선
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    // 테스트용 더미 데이터 강제 재생성
    localStorage.removeItem('salaryData');
    
    const provinces = ['서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    const salaryRanges = [
        '2000~2400만원', '2400~3000만원', '3000~4000만원', '4000~5000만원',
        '5000~6000만원', '6000~7000만원', '7000~8000만원', '8000~9000만원',
        '9000~10000만원', '10000만원 이상'
    ];
    
    const dummyData = [];
    
    // 의사 데이터 60개 (다양한 경력과 연봉)
    for (let i = 0; i < 60; i++) {
        const province = provinces[Math.floor(Math.random() * provinces.length)];
        const cities = regionData[province];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const experience = (Math.floor(Math.random() * 15) + 1) + '년차'; // 1~15년차
        const expYears = parseInt(experience);
        
        // 의사 연봉: 경력에 따라 다양하게
        let salaryIndex;
        if (expYears <= 2) {
            salaryIndex = 4 + Math.floor(Math.random() * 2); // 5000~7000
        } else if (expYears <= 5) {
            salaryIndex = 5 + Math.floor(Math.random() * 3); // 6000~9000
        } else if (expYears <= 10) {
            salaryIndex = 6 + Math.floor(Math.random() * 4); // 7000~10000+
        } else {
            salaryIndex = 7 + Math.floor(Math.random() * 3); // 8000~10000+
        }
        
        salaryIndex = Math.min(salaryIndex, salaryRanges.length - 1);
        
        dummyData.push({
            profession: '의사',
            province: province,
            city: city,
            experience: experience,
            salary: salaryRanges[salaryIndex]
        });
    }
    
    // 간호사 데이터 20개
    for (let i = 0; i < 20; i++) {
        const province = provinces[Math.floor(Math.random() * provinces.length)];
        const cities = regionData[province];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const experience = (Math.floor(Math.random() * 12) + 1) + '년차'; // 1~12년차
        const expYears = parseInt(experience);
        
        // 간호사 연봉
        let salaryIndex;
        if (expYears <= 3) {
            salaryIndex = 1 + Math.floor(Math.random() * 2); // 2400~4000
        } else if (expYears <= 7) {
            salaryIndex = 2 + Math.floor(Math.random() * 3); // 3000~6000
        } else {
            salaryIndex = 3 + Math.floor(Math.random() * 3); // 4000~7000
        }
        
        dummyData.push({
            profession: '간호사',
            province: province,
            city: city,
            experience: experience,
            salary: salaryRanges[salaryIndex]
        });
    }
    
    // 약사 데이터 15개
    for (let i = 0; i < 15; i++) {
        const province = provinces[Math.floor(Math.random() * provinces.length)];
        const cities = regionData[province];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const experience = (Math.floor(Math.random() * 10) + 1) + '년차'; // 1~10년차
        const expYears = parseInt(experience);
        
        // 약사 연봉
        let salaryIndex;
        if (expYears <= 3) {
            salaryIndex = 2 + Math.floor(Math.random() * 2); // 3000~5000
        } else if (expYears <= 7) {
            salaryIndex = 3 + Math.floor(Math.random() * 3); // 4000~7000
        } else {
            salaryIndex = 4 + Math.floor(Math.random() * 3); // 5000~8000
        }
        
        dummyData.push({
            profession: '약사',
            province: province,
            city: city,
            experience: experience,
            salary: salaryRanges[salaryIndex]
        });
    }
    
    
    dummyData.forEach(data => saveSalaryData(data));
    
    console.log('✅ 더미 데이터 생성 완료:', dummyData.length, '개');
    console.log('✅ localStorage에 저장된 데이터:', JSON.parse(localStorage.getItem('salaryData') || '[]').length, '개');
    
    // 이벤트 리스너
    document.getElementById('btnParticipate').addEventListener('click', openSalaryModal);
    
    // 지역별 지도 필터 - 실시간 업데이트
    const regionProfessionFilter = document.getElementById('regionFilterProfession');
    const regionExperienceFilter = document.getElementById('regionFilterExperience');
    const btnRegionReset = document.getElementById('btnRegionReset');
    
    console.log('지역 필터 요소 확인:', {
        profession: regionProfessionFilter,
        experience: regionExperienceFilter,
        reset: btnRegionReset
    });
    
    if (regionProfessionFilter) {
        regionProfessionFilter.addEventListener('change', function() {
            console.log('🔥 직종 필터 변경됨:', this.value);
            updateRegionMap();
        });
        console.log('직종 필터 이벤트 리스너 등록 완료');
    } else {
        console.error('❌ regionFilterProfession 요소를 찾을 수 없습니다!');
    }
    
    if (regionExperienceFilter) {
        regionExperienceFilter.addEventListener('change', function() {
            console.log('🔥 경력 필터 변경됨:', this.value);
            updateRegionMap();
        });
        console.log('경력 필터 이벤트 리스너 등록 완료');
    } else {
        console.error('❌ regionFilterExperience 요소를 찾을 수 없습니다!');
    }
    
    if (btnRegionReset) {
        btnRegionReset.addEventListener('click', function() {
            console.log('🔥 초기화 버튼 클릭!');
            if (regionProfessionFilter) {
                regionProfessionFilter.value = '';
                console.log('직종 필터 리셋');
            }
            if (regionExperienceFilter) {
                regionExperienceFilter.value = '';
                console.log('경력 필터 리셋');
            }
            updateRegionMap();
        });
        console.log('초기화 버튼 이벤트 리스너 등록 완료');
    } else {
        console.error('❌ btnRegionReset 요소를 찾을 수 없습니다!');
    }
    
    // DOMContentLoaded 끝난 후 initialize() 실행 (차트와 지도 렌더링 포함)
    console.log('🚀 DOMContentLoaded 완료, initialize() 호출');
    initialize();
});

// 내 연봉 카드 업데이트
function updateMySalaryCard() {
    const userProfile = loadUserProfile();
    const salaryDisplay = document.getElementById('mySalaryDisplay');
    const percentileDisplay = document.getElementById('myPercentileDisplay');
    
    if (userProfile.salary) {
        salaryDisplay.textContent = userProfile.salary;
        const percentile = calculatePercentile(userProfile.salary);
        percentileDisplay.textContent = percentile ? `상위 ${percentile}%` : '계산 중...';
    } else {
        salaryDisplay.textContent = '????원';
        percentileDisplay.textContent = '상위 ?%';
    }
}

// 시간당 수입 계산 및 업데이트
let currentTimeIndex = 0;
let timeUnitsData = [];

function updateTimeSalary() {
    const userProfile = loadUserProfile();
    
    timeUnitsData = [
        { label: '1초', value: 0 },
        { label: '1분', value: 0 },
        { label: '1시간', value: 0 },
        { label: '1일', value: 0 }
    ];
    
    if (userProfile.salary) {
        // 연봉을 원으로 변환
        let yearlyAmount;
        if (userProfile.salary === '10000만원 이상') {
            yearlyAmount = 100000000; // 1억
        } else {
            const [min, max] = userProfile.salary.replace('만원', '').split('~').map(Number);
            yearlyAmount = ((min + max) / 2) * 10000; // 만원을 원으로
        }
        
        // 시간 단위별 계산
        const perDay = yearlyAmount / 365;
        const perHour = perDay / 24;
        const perMinute = perHour / 60;
        const perSecond = perMinute / 60;
        
        timeUnitsData[0].value = Math.round(perSecond);
        timeUnitsData[1].value = Math.round(perMinute);
        timeUnitsData[2].value = Math.round(perHour);
        timeUnitsData[3].value = Math.round(perDay);
    }
    
    // 초기 표시
    showTimeUnit(0, timeUnitsData);
    
    // 이전/다음 버튼 이벤트
    document.getElementById('timePrevBtn').onclick = () => {
        currentTimeIndex = (currentTimeIndex - 1 + 4) % 4;
        showTimeUnit(currentTimeIndex, timeUnitsData);
    };
    
    document.getElementById('timeNextBtn').onclick = () => {
        currentTimeIndex = (currentTimeIndex + 1) % 4;
        showTimeUnit(currentTimeIndex, timeUnitsData);
    };
    
    // 인디케이터 클릭 이벤트 (수동 전환만)
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.onclick = () => {
            currentTimeIndex = index;
            showTimeUnit(currentTimeIndex, timeUnitsData);
        };
    });
}

function showTimeUnit(index, timeUnits) {
    const timeUnit = document.getElementById('timeUnit');
    const timeAmount = document.getElementById('timeAmount');
    
    // 애니메이션을 위해 클래스 제거 후 다시 추가
    timeUnit.style.animation = 'none';
    timeAmount.style.animation = 'none';
    
    setTimeout(() => {
        timeUnit.textContent = timeUnits[index].label;
        timeAmount.textContent = timeUnits[index].value > 0 
            ? timeUnits[index].value.toLocaleString() + '원' 
            : '-';
        
        timeUnit.style.animation = 'fadeIn 0.5s ease-in-out forwards';
        timeAmount.style.animation = 'fadeIn 0.5s ease-in-out 0.2s forwards';
    }, 10);
    
    // 인디케이터 업데이트
    document.querySelectorAll('.indicator').forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
    });
}

// 지역별 평균 연봉 지도 업데이트
function updateRegionMap() {
    console.log('=== updateRegionMap 함수 시작 ===');
    let salaryData = loadSalaryData();
    const container = document.getElementById('regionMap');
    
    if (!container) {
        console.error('regionMap 컨테이너를 찾을 수 없습니다!');
        return;
    }
    
    console.log('초기 데이터 개수:', salaryData.length);
    
    // 필터 적용
    const professionFilter = document.getElementById('regionFilterProfession')?.value || '';
    const experienceFilter = document.getElementById('regionFilterExperience')?.value || '';
    
    console.log('적용할 필터 - 직종:', professionFilter, '경력:', experienceFilter);
    
    if (professionFilter) {
        salaryData = salaryData.filter(item => item.profession === professionFilter);
        console.log('직종 필터 적용 후 데이터 개수:', salaryData.length);
    }
    
    if (experienceFilter) {
        salaryData = salaryData.filter(item => {
            const expYears = parseInt(item.experience);
            if (experienceFilter === '1-3') return expYears >= 1 && expYears <= 3;
            if (experienceFilter === '4-6') return expYears >= 4 && expYears <= 6;
            if (experienceFilter === '7-9') return expYears >= 7 && expYears <= 9;
            if (experienceFilter === '10+') return expYears >= 10;
            return true;
        });
        console.log('경력 필터 적용 후 데이터 개수:', salaryData.length);
    }
    
    // 주요 시도만 표시
    const mainProvinces = ['서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', 
                          '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    
    // 지역별 데이터 집계
    const regionStats = {};
    
    mainProvinces.forEach(province => {
        const provinceData = salaryData.filter(item => item.province === province);
        
        if (provinceData.length > 0) {
            const salaryValues = provinceData.map(item => {
                const range = item.salary;
                if (range === '10000만원 이상') return 10000;
                const [min, max] = range.replace('만원', '').split('~').map(Number);
                return (min + max) / 2;
            });
            
            const avg = Math.round(salaryValues.reduce((a, b) => a + b, 0) / salaryValues.length);
            
            regionStats[province] = {
                avg: avg,
                count: provinceData.length
            };
        } else {
            regionStats[province] = {
                avg: 0,
                count: 0
            };
        }
    });
    
    // 최소/최대값 계산 (색상 범위 결정)
    const avgValues = Object.values(regionStats)
        .filter(r => r.count > 0)
        .map(r => r.avg);
    
    if (avgValues.length === 0) {
        console.log('표시할 데이터가 없습니다');
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af;">조건에 맞는 데이터가 없습니다</div>';
        return;
    }
    
    const minAvg = Math.min(...avgValues);
    const maxAvg = Math.max(...avgValues);
    
    console.log('평균 연봉 범위:', minAvg, '~', maxAvg);
    console.log('지역별 통계:', regionStats);
    
    // HTML 생성 및 업데이트
    const htmlContent = mainProvinces.map(province => {
        const stats = regionStats[province];
        
        if (stats.count === 0) {
            return `
                <div class="region-item" style="opacity: 0.4; background: #f9fafb;">
                    <div class="region-name" style="color: #9ca3af;">${province}</div>
                    <div class="region-salary" style="color: #9ca3af; font-size: 14px;">데이터 없음</div>
                </div>
            `;
        }
        
        // 색상 강도 계산 (0.2 ~ 1.0)
        const intensity = avgValues.length === 1 ? 0.6 : 0.2 + ((stats.avg - minAvg) / (maxAvg - minAvg)) * 0.8;
        const bgColor = `rgba(0, 184, 169, ${intensity})`;
        const textColor = intensity > 0.6 ? '#ffffff' : '#1f2937';
        
        return `
            <div class="region-item" style="background: ${bgColor}; border-color: rgba(0, 184, 169, ${Math.min(intensity + 0.2, 1)});">
                <div class="region-name" style="color: ${textColor};">${province}</div>
                <div class="region-salary" style="color: ${textColor};">${stats.avg.toLocaleString()}만원</div>
                <div class="region-count" style="color: ${intensity > 0.6 ? 'rgba(255,255,255,0.8)' : '#6b7280'};">${stats.count}명</div>
            </div>
        `;
    }).join('');
    
    console.log('HTML 업데이트 전 container:', container);
    container.innerHTML = htmlContent;
    console.log('HTML 업데이트 완료!');
    console.log('=== updateRegionMap 함수 종료 ===');
}

// 통계 업데이트
function updateStats() {
    const allData = loadSalaryData();
    const filteredData = getFilteredData();
    
    // 참여자 수
    document.getElementById('totalParticipants').textContent = filteredData.length + '명';
    
    // 연봉을 숫자로 변환
    const salaryValues = filteredData.map(item => {
        const range = item.salary;
        if (range === '10000만원 이상') return 10000;
        const [min, max] = range.replace('만원', '').split('~').map(Number);
        return (min + max) / 2;
    });
    
    if (salaryValues.length > 0) {
        // 평균
        const avg = Math.round(salaryValues.reduce((a, b) => a + b, 0) / salaryValues.length);
        document.getElementById('averageSalary').textContent = avg.toLocaleString() + '만원';
        
        // 최고
        const max = Math.max(...salaryValues);
        document.getElementById('maxSalary').textContent = (max >= 10000 ? '10000+' : max.toLocaleString()) + '만원';
        
        // 중앙값
        const sorted = [...salaryValues].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        document.getElementById('medianSalary').textContent = median.toLocaleString() + '만원';
    } else {
        document.getElementById('averageSalary').textContent = '0만원';
        document.getElementById('maxSalary').textContent = '0만원';
        document.getElementById('medianSalary').textContent = '0만원';
    }
}

// 데이터 테이블 업데이트
function updateDataTable() {
    const filteredData = getFilteredData();
    const tbody = document.getElementById('dataTableBody');
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">조건에 맞는 데이터가 없습니다</td></tr>';
        return;
    }
    
    // 최대 20개만 표시
    const displayData = filteredData.slice(0, 20);
    
    tbody.innerHTML = displayData.map(item => `
        <tr>
            <td>${item.profession}</td>
            <td>${item.province} ${item.city}</td>
            <td>${item.experience}</td>
            <td><strong>${item.salary}</strong></td>
        </tr>
    `).join('');
}

// 필터링된 데이터 가져오기
function getFilteredData() {
    const allData = loadSalaryData();
    const profession = document.getElementById('filterProfession').value;
    const province = document.getElementById('filterProvince').value;
    const experience = document.getElementById('filterExperience').value;
    
    return allData.filter(item => {
        if (profession && item.profession !== profession) return false;
        if (province && item.province !== province) return false;
        if (experience) {
            const expYears = parseInt(item.experience);
            if (experience === '1-3' && (expYears < 1 || expYears > 3)) return false;
            if (experience === '4-6' && (expYears < 4 || expYears > 6)) return false;
            if (experience === '7-9' && (expYears < 7 || expYears > 9)) return false;
            if (experience === '10+' && expYears < 10) return false;
        }
        return true;
    });
}

// 필터 적용
function applyFilters() {
    updateStats();
    updateDataTable();
}

// 필터 초기화
function resetFilters() {
    document.getElementById('filterProfession').value = '';
    document.getElementById('filterProvince').value = '';
    document.getElementById('filterExperience').value = '';
    applyFilters();
}

// 연봉 입력 모달 열기
function openSalaryModal() {
    const modal = document.getElementById('salaryModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 로컬 스토리지에서 연봉 데이터 로드
function loadSalaryData() {
    const salaryData = localStorage.getItem('salaryData');
    return salaryData ? JSON.parse(salaryData) : [];
}

// 로컬 스토리지에 연봉 데이터 저장
function saveSalaryData(data) {
    const salaryData = loadSalaryData();
    salaryData.push(data);
    localStorage.setItem('salaryData', JSON.stringify(salaryData));
}

// 사용자 프로필 로드 (로그인 시 자동 입력용)
function loadUserProfile() {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
        return JSON.parse(profile);
    }
    // 임시 프로필 (로그인 기능 구현 전)
    return {
        profession: '의사',
        province: '서울',
        city: '강남구',
        experience: '5년차',
        salary: null // null이면 연봉 정보 없음 (????원으로 표시)
        // salary: '6000~7000만원' // 테스트용: 연봉 정보 있을 경우
    };
}

// 시/도 선택 시 시/구 업데이트 (필터)
document.getElementById('filterProvince').addEventListener('change', function() {
    const province = this.value;
    const citySelect = document.getElementById('filterCity');
    
    citySelect.innerHTML = '<option value="all">전체</option>';
    
    if (province !== 'all' && regionData[province]) {
        regionData[province].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
    
    updateStats();
    renderTable();
});

// 시/구 선택 시 업데이트 (필터)
const filterCityElement = document.getElementById('filterCity');
if (filterCityElement) {
    filterCityElement.addEventListener('change', () => {
        updateStats();
        renderTable();
    });
}

// 시/도 선택 시 시/구 업데이트 (모달)
document.getElementById('inputProvince').addEventListener('change', function() {
    const province = this.value;
    const citySelect = document.getElementById('inputCity');
    
    citySelect.innerHTML = '<option value="">선택하세요</option>';
    
    if (province && regionData[province]) {
        regionData[province].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
});

// 필터링된 데이터 가져오기 (본인 직종만)
function getFilteredData() {
    const allData = loadSalaryData();
    const userProfile = loadUserProfile();
    const userProfession = userProfile.profession; // 사용자 직종으로 고정
    const province = document.getElementById('filterProvince')?.value || 'all';
    const city = document.getElementById('filterCity')?.value || 'all';
    const experience = document.getElementById('filterExperience')?.value || 'all';
    
    return allData.filter(item => {
        // 본인 직종만 볼 수 있도록 제한
        if (item.profession !== userProfession) return false;
        if (province !== 'all' && !item.location.includes(province)) return false;
        if (city !== 'all' && !item.location.includes(city)) return false;
        if (experience !== 'all' && item.experience !== experience) return false;
        return true;
    });
}

// 전국 평균 데이터 가져오기 (지역 필터 제외)
function getNationalData() {
    const allData = loadSalaryData();
    const userProfile = loadUserProfile();
    const userProfession = userProfile.profession;
    const experience = document.getElementById('filterExperience').value;
    
    return allData.filter(item => {
        if (item.profession !== userProfession) return false;
        if (experience !== 'all' && item.experience !== experience) return false;
        return true;
    });
}

// 통계 업데이트
function updateStats() {
    const filteredData = getFilteredData();
    const totalCount = filteredData.length;
    
    const topSalaryElement = document.getElementById('topSalary');
    
    if (!topSalaryElement) {
        // 요소가 없으면 함수 종료
        return;
    }
    
    if (totalCount === 0) {
        topSalaryElement.textContent = '-';
        return;
    }
    
    // 구간별 카운트
    const salaryCount = {};
    filteredData.forEach(item => {
        salaryCount[item.salaryRange] = (salaryCount[item.salaryRange] || 0) + 1;
    });
    
    // 최다 구간
    const topRange = Object.keys(salaryCount).reduce((a, b) => 
        salaryCount[a] > salaryCount[b] ? a : b
    );
    
    topSalaryElement.textContent = topRange.replace('~', ' ~ ') + '만원';
}

// 테이블 렌더링
function renderTable() {
    const filteredData = getFilteredData();
    const tableContainer = document.getElementById('salaryTable');
    const keyMetricsContainer = document.getElementById('keyMetrics');
    const chartContainer = document.getElementById('salaryChart');
    
    if (filteredData.length === 0) {
        keyMetricsContainer.innerHTML = '';
        chartContainer.innerHTML = '';
        tableContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>연봉 데이터가 없습니다</p>
                <small>첫 번째로 연봉 정보를 공유해보세요!</small>
            </div>
        `;
        return;
    }
    
    // 구간별 집계
    const salaryStats = {};
    filteredData.forEach(item => {
        const key = item.salaryRange;
        if (!salaryStats[key]) {
            salaryStats[key] = {
                range: key,
                count: 0
            };
        }
        salaryStats[key].count++;
    });
    
    // 배열로 변환 및 정렬 (인원 수 많은 순)
    const statsArray = Object.values(salaryStats).sort((a, b) => {
        return b.count - a.count;
    });
    
    const maxCount = Math.max(...statsArray.map(s => s.count));
    const mostCommon = statsArray[0];
    
    // 최다 구간의 평균 계산
    const rangeParts = mostCommon.range.split('~');
    let avgAmount;
    if (mostCommon.range === '10000+') {
        avgAmount = '1억원 이상';
    } else {
        const min = parseInt(rangeParts[0]);
        const max = parseInt(rangeParts[1]);
        avgAmount = Math.round((min + max) / 2).toLocaleString() + '만원';
    }
    
    // 키 메트릭 카드 렌더링
    keyMetricsContainer.innerHTML = `
        <div class="key-metric-card">
            <div class="key-metric-label">가장 많은 구간</div>
            <div class="key-metric-value">${mostCommon.range.replace('~', ' ~ ')}만원</div>
        </div>
        <div class="key-metric-card">
            <div class="key-metric-label">평균 예상 연봉</div>
            <div class="key-metric-value">${avgAmount}</div>
        </div>
        <div class="key-metric-card">
            <div class="key-metric-label">데이터 분포</div>
            <div class="key-metric-value">${statsArray.length}개 구간</div>
        </div>
    `;
    
    // 차트 렌더링 (전체 구간 순서대로)
    const allRanges = ['2000~2400', '2400~2800', '2800~3200', '3200~3600', '3600~4000', '4000~5000', '5000~6000', '6000~7000', '7000~8000', '8000~10000', '10000+'];
    const chartData = allRanges.map(range => {
        const stat = salaryStats[range];
        return {
            range: range,
            count: stat ? stat.count : 0
        };
    });
    
    // 가장 많은 구간의 인원을 최대값으로 사용 (차이를 명확하게 표현)
    const chartMaxCount = Math.max(...chartData.map(d => d.count), 1);
    
    const province = document.getElementById('filterProvince').value;
    const city = document.getElementById('filterCity').value;
    let locationText = '현재 지역';
    if (province !== 'all') {
        locationText = province;
        if (city !== 'all') {
            locationText += ' ' + city;
        }
    }
    
    chartContainer.innerHTML = `
        <div class="chart-title">
            <i class="fas fa-chart-bar"></i>
            ${locationText}
        </div>
        <div class="chart-container">
            ${chartData.map(data => `
                <div class="chart-bar">
                    <div class="bar-wrapper">
                        ${data.count > 0 ? `<div class="bar" style="height: ${(data.count / chartMaxCount * 100)}%"></div>` : '<div class="bar-empty"></div>'}
                    </div>
                    <div class="bar-label">${data.range.replace('~', '-')}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 전국 평균 차트 렌더링
    const nationalData = getNationalData();
    const nationalChartContainer = document.getElementById('nationalChart');
    
    if (nationalData.length > 0) {
        const nationalStats = {};
        nationalData.forEach(item => {
            const key = item.salaryRange;
            nationalStats[key] = (nationalStats[key] || 0) + 1;
        });
        
        const nationalChartData = allRanges.map(range => ({
            range: range,
            count: nationalStats[range] || 0
        }));
        
        // 가장 많은 구간의 인원을 최대값으로 사용 (차이를 명확하게 표현)
        const nationalMaxCount = Math.max(...nationalChartData.map(d => d.count), 1);
        
        nationalChartContainer.innerHTML = `
            <div class="chart-title">
                <i class="fas fa-globe-asia"></i>
                전국 평균
            </div>
            <div class="chart-container">
                ${nationalChartData.map(data => `
                    <div class="chart-bar">
                        <div class="bar-wrapper">
                            ${data.count > 0 ? `<div class="bar national-bar" style="height: ${(data.count / nationalMaxCount * 100)}%"></div>` : '<div class="bar-empty"></div>'}
                        </div>
                        <div class="bar-label">${data.range.replace('~', '-')}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        nationalChartContainer.innerHTML = '';
    }
    
    tableContainer.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>연봉 구간</th>
                    <th>인원</th>
                    <th>비율</th>
                </tr>
            </thead>
            <tbody>
                ${statsArray.map(stat => `
                    <tr>
                        <td><strong>${stat.range.replace('~', ' ~ ')}만원</strong></td>
                        <td>${stat.count}명</td>
                        <td>
                            <div class="progress-bar-cell">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(stat.count / maxCount) * 100}%"></div>
                                </div>
                                <span class="percentage">${((stat.count / filteredData.length) * 100).toFixed(1)}%</span>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 모달 열기 함수
function openSalaryModal() {
    const modal = document.getElementById('salaryModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    // 사용자 프로필 자동 입력
    const profile = loadUserProfile();
    document.getElementById('inputProfession').value = profile.profession || '';
    document.getElementById('inputProvince').value = profile.province || '';
    // 시/구 업데이트
    if (profile.province && regionData[profile.province]) {
        const citySelect = document.getElementById('inputCity');
        citySelect.innerHTML = '<option value="">선택하세요</option>';
        regionData[profile.province].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        document.getElementById('inputCity').value = profile.city || '';
    }
    document.getElementById('inputExperience').value = profile.experience || '';
}

// CTA 카드, 내 연봉 정보 입력 버튼 클릭 시 모달 열기
const ctaCard = document.getElementById('ctaCard');
if (ctaCard) {
    ctaCard.addEventListener('click', openSalaryModal);
}
const btnParticipate = document.getElementById('btnParticipate');
if (btnParticipate) {
    btnParticipate.addEventListener('click', openSalaryModal);
}

// 모달 닫기
function closeModal() {
    console.log('closeModal called');
    const modal = document.getElementById('salaryModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// 모달 닫기(X) 버튼
const btnCloseModal = document.getElementById('btnCloseModal');
if (btnCloseModal) {
    console.log('btnCloseModal found, adding event listener');
    btnCloseModal.addEventListener('click', closeModal);
} else {
    console.log('btnCloseModal not found');
}
// 취소 버튼
function bindCancelSalaryButton() {
    const btnCancelSalary = document.getElementById('btnCancelSalary');
    if (btnCancelSalary) {
        btnCancelSalary.addEventListener('click', closeModal);
    }
}
bindCancelSalaryButton();
document.addEventListener('DOMContentLoaded', bindCancelSalaryButton);

// 모달 배경 클릭 시 닫기
document.getElementById('salaryModal').addEventListener('click', (e) => {
    if (e.target.id === 'salaryModal') {
        closeModal();
    }
});

// 연봉 정보 제출
document.getElementById('btnSubmitSalary').addEventListener('click', () => {
    const profession = document.getElementById('inputProfession').value;
    const province = document.getElementById('inputProvince').value;
    const city = document.getElementById('inputCity').value;
    const experience = document.getElementById('inputExperience').value;
    const salaryRange = document.getElementById('inputSalary').value;
    
    // 유효성 검사
    if (!profession || !province || !city || !experience || !salaryRange) {
        alert('모든 정보를 입력해주세요.');
        return;
    }
    
    // 사용자 프로필 저장
    const userProfile = {
        profession,
        province,
        city,
        experience,
        salary: salaryRange
    };
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // 데이터 저장
    const newData = {
        profession,
        province: province,
        location: '서울시',
        experience,
        salary: salaryRange,
        createdAt: new Date().toISOString()
    };
    
    saveSalaryData(newData);
    
    // 모달 닫기
    closeModal();
    
    // 안내 메시지 제거
    const notice = document.getElementById('salaryLockNotice');
    if (notice) {
        notice.remove();
    }
    
    // 블러 처리된 섹션들 복원
    const sectionsToRestore = [
        '.distribution-section',
        '.region-salary-section',
        '.filter-section',
        '.stats-grid'
    ];
    
    sectionsToRestore.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.filter = 'none';
            element.style.cursor = 'auto';
            element.style.userSelect = 'auto';
            element.removeEventListener('click', showLockNotice);
        }
    });
    
    alert('연봉 정보가 등록되었습니다. 공유해주셔서 감사합니다!');
    
    // 페이지 초기화
    initialize();
});

// 필터 변경 시 업데이트 (직군 필터 제외)
document.getElementById('filterExperience').addEventListener('change', () => {
    updateStats();
    renderTable();
});

// 필터 초기화 (직종 제외)
document.getElementById('btnResetFilter').addEventListener('click', () => {
    // 직종은 사용자 직종으로 유지
    document.getElementById('filterProvince').value = 'all';
    document.getElementById('filterCity').innerHTML = '<option value="all">전체</option>';
    document.getElementById('filterCity').value = 'all';
    document.getElementById('filterExperience').value = 'all';
    updateStats();
    renderTable();
});

// 로그인 버튼


// 초기 로드
function initialize() {
    console.log('📊 initialize() 함수 시작');
    
    const userProfile = loadUserProfile();
    
    // 개발자 모드 체크 (localStorage에 devMode가 true이면 잠금 건너뛰기)
    const devMode = localStorage.getItem('devMode') === 'true';
    console.log('🔧 개발자 모드:', devMode);
    
    // 차트와 지도는 항상 렌더링 (데이터가 있으면)
    const salaryData = loadSalaryData();
    console.log('📦 로드된 데이터 개수:', salaryData ? salaryData.length : 0);
    
    if (salaryData && salaryData.length > 0) {
        console.log('📈 차트 생성 시작...');
        createSimpleBarChart();
        console.log('🗺️  지도 업데이트 시작...');
        updateRegionMap();
        console.log('✅ 차트와 지도 렌더링 완료');
    } else {
        console.error('❌ 데이터가 없어서 차트/지도를 렌더링할 수 없습니다!');
    }
    
    // 사용자 정보가 없으면 페이지 잠금 (개발자 모드가 아닐 때만)
    if (!devMode && (!userProfile || !userProfile.profession || !userProfile.salary || !userProfile.experience)) {
        console.log('🔒 페이지 잠금 처리');
        lockPage();
        return;
    }
    
    // 내 연봉 카드 업데이트
    updateMySalaryCard();
    updateTimeSalary();
    
    updateStats();
    renderTable();
}

// initialize() 호출은 DOMContentLoaded 내에서 실행됨
