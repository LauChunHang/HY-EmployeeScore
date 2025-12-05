 const SPREADSHEET_ID = '1znQ2MapAc4fqXJc3SDxoixbrd-b6Xry4auf8vFIcqDc';
        const API_KEY = 'AIzaSyDj2ktQ36AoBSrYxPj_R4USvzvLtfh8Kb0'; 
        const SHEETS = {
            BASIC: '員工資料',
            EDUCATION: '學歷／專業資格',
            EXPERIENCE: '工作經驗',
            EMPLOYMENT: '康業受僱記錄'
        };

        let allEmployees = [];
        let educationData = [];
        let experienceData = [];
        let employmentData = [];
        let currentEmployee = null;

        // 加載所有資料
        async function loadAllData() {
            try {
                showLoading();
                
                // 並行加載所有資料
                const [basic, education, experience, employment] = await Promise.all([
                    loadSheetData(SHEETS.BASIC),
                    loadSheetData(SHEETS.EDUCATION),
                    loadSheetData(SHEETS.EXPERIENCE),
                    loadSheetData(SHEETS.EMPLOYMENT)
                ]);
                
                allEmployees = basic;
                educationData = education;
                experienceData = experience;
                employmentData = employment;
                
                displayEmployees(allEmployees);
                hideLoading();
            } catch (error) {
                console.error('加載資料失敗:', error);
                showError('加載資料失敗，請刷新頁面重試');
            }
        }

        // 從Google Sheets加載資料
        async function loadSheetData(sheetName) {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.values) return [];
            
            const headers = data.values[0];
            const rows = data.values.slice(1);
            
            return rows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });
        }

        // 顯示員工列表
        function displayEmployees(employees) {
            const grid = document.getElementById('employeeGrid');
            
            if (employees.length === 0) {
                grid.innerHTML = '<div class="error">找不到員工資料</div>';
                return;
            }
            
            grid.innerHTML = employees.map(employee => `
                <div class="employee-card" onclick="showEmployeeDetail('${employee.員工編號}')">
                    <h3>${employee.員工姓名 || '無姓名'} (${employee.員工編號 || '無編號'})</h3>
                    <div class="employee-info">
                        <p><strong>部門：</strong>${employee.部門分區 || '未填寫'}</p>
                        <p><strong>職位：</strong>${employee.職位 || '未填寫'}</p>
                        
                    </div>
                </div>
            `).join('');
        }

        // 顯示員工詳細資料
        function showEmployeeDetail(employeeId) {
            currentEmployee = allEmployees.find(emp => emp.員工編號 === employeeId);
            
            if (!currentEmployee) return;
            
            // 切換到詳細資料視圖
            document.getElementById('employeeList').style.display = 'none';
            document.getElementById('employeeDetail').style.display = 'block';
            
            // 顯示基本資料
            displayBasicInfo();
            
            // 顯示其他資料
            displayEducationInfo();
            displayExperienceInfo();
            displayEmploymentInfo();
        }

        // 顯示基本資料
        function displayBasicInfo() {
            const content = document.getElementById('basicContent');
            const employee = currentEmployee;
            
            content.innerHTML = `
                <div class="detail-section">
                    <h3>基本資料 - ${employee.員工姓名}</h3>
                    <div class="detail-item">
                        <p><strong>員工編號：</strong>${employee.員工編號 || '未填寫'}</p>
                        <p><strong>年齡：</strong>${employee.年齡 || '未填寫'}</p>
                        <p><strong>婚姻狀況：</strong>${employee.婚姻狀況 || '未填寫'}</p>
                        <p><strong>子女數目：</strong>${employee.子女數目 || '0'}</p>
                        <p><strong>職位：</strong>${employee.職位 || '未填寫'}</p>
                        <p><strong>部門/分區：</strong>${employee.部門分區 || '未填寫'}</p>
                        <p><strong>到職日期：</strong>${employee.到職日期 || '未填寫'}</p>
                    </div>
                </div>
            `;
        }

        // 顯示學歷資格
        function displayEducationInfo() {
            const content = document.getElementById('educationContent');
            const educationRecords = educationData.filter(edu => edu.員工編號 === currentEmployee.員工編號);
            
            if (educationRecords.length === 0) {
                content.innerHTML = '<div class="no-data">沒有學歷資格記錄</div>';
                return;
            }
            
            content.innerHTML = `
                <div class="detail-section">
                    <h3>學歷／專業資格 - ${currentEmployee.員工姓名}</h3>
                    ${educationRecords.map(record => `
                        <div class="detail-item">
                            <p><strong>期間：</strong>${record.由 || ''} - ${record.至 || ''}</p>
                            <p><strong>學院名稱：</strong>${record.學院名稱 || ''}</p>
                            <p><strong>所獲證書/資格：</strong>${record.所獲證書資格 || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // 顯示工作經驗
        function displayExperienceInfo() {
            const content = document.getElementById('experienceContent');
            const experienceRecords = experienceData.filter(exp => exp.員工編號 === currentEmployee.員工編號);
            
            if (experienceRecords.length === 0) {
                content.innerHTML = '<div class="no-data">沒有工作經驗記錄</div>';
                return;
            }
            
            content.innerHTML = `
                <div class="detail-section">
                    <h3>工作經驗 - ${currentEmployee.員工姓名}</h3>
                    ${experienceRecords.map(record => `
                        <div class="detail-item">
                            <p><strong>期間：</strong>${record.由 || ''} - ${record.至 || ''}</p>
                            <p><strong>公司名稱：</strong>${record.公司名稱 || ''}</p>
                            <p><strong>離職時職位：</strong>${record.離職時職位 || ''}</p>
                            <p><strong>入職前總年資：</strong>${record.入職前總年資 || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // 顯示受僱記錄
        function displayEmploymentInfo() {
            const content = document.getElementById('employmentContent');
            const employmentRecords = employmentData.filter(emp => emp.員工編號 === currentEmployee.員工編號);
            
            if (employmentRecords.length === 0) {
                content.innerHTML = '<div class="no-data">沒有受僱記錄</div>';
                return;
            }
            
            content.innerHTML = `
                <div class="detail-section">
                    <h3>康業受僱記錄 - ${currentEmployee.員工姓名}</h3>
                    ${employmentRecords.map(record => `
                        <div class="detail-item">
                            <p><strong>期間：</strong>${record.由 || ''} - ${record.至 || ''}</p>
                            <p><strong>分區：</strong>${record.分區 || ''}</p>
                            <p><strong>大廈：</strong>${record.大廈 || ''}</p>
                            <p><strong>職位：</strong>${record.職位 || ''}</p>
                            <p><strong>年資：</strong>${record.年資 || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // 返回員工列表
        function showEmployeeList() {
            document.getElementById('employeeDetail').style.display = 'none';
            document.getElementById('employeeList').style.display = 'block';
            currentEmployee = null;
        }

        // 切換標籤頁
        function switchTab(tabName) {
            // 更新標籤按鈕狀態
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
        }

        // 搜尋過濾
        function filterEmployees() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            if (!searchTerm) {
                displayEmployees(allEmployees);
                return;
            }
            
            const filtered = allEmployees.filter(employee => 
                (employee.員工姓名 && employee.員工姓名.toLowerCase().includes(searchTerm)) ||
                (employee.員工編號 && employee.員工編號.toLowerCase().includes(searchTerm))
            );
            
            displayEmployees(filtered);
        }

        function showLoading() {
            document.getElementById('employeeGrid').innerHTML = '<div class="loading">載入中...</div>';
        }

        function hideLoading() {
            // 載入完成，不需要特別處理
        }

        function showError(message) {
            document.getElementById('employeeGrid').innerHTML = `<div class="error">${message}</div>`;
        }

        // 初始化加載資料
        document.addEventListener('DOMContentLoaded', loadAllData);