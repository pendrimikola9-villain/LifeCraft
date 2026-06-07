document.addEventListener('DOMContentLoaded', () => {
    
    // 1. DATABASE LOCAL STORAGE KOMPONEN
    let currentTab = 'daily';
    let todoData = JSON.parse(localStorage.getItem('zenithTodoData')) || { daily: [], weekly: [], monthly: [] };
    let badHabits = JSON.parse(localStorage.getItem('zenithBadHabits')) || [];
    let visionData = JSON.parse(localStorage.getItem('zenithVisionData')) || { short: '', long: '' };
    let smartData = JSON.parse(localStorage.getItem('zenithSmartData')) || { s: '', m: '', a: '', r: '', t: '', analyzed: false };

    // 2. KUMPULAN SELECTOR DOM ELEMEN
    const todoListContainer = document.getElementById('todoListContainer');
    const todoInput = document.getElementById('todoInput');
    const btnAddTodo = document.getElementById('btnAddTodo');
    const habitContainer = document.getElementById('habitContainer');
    const habitInput = document.getElementById('habitInput');
    const btnAddHabit = document.getElementById('btnAddHabit');

    const goalShort = document.getElementById('goalShort');
    const goalLong = document.getElementById('goalLong');
    const btnSaveVision = document.getElementById('btnSaveVision');

    const smartS = document.getElementById('smartS');
    const smartM = document.getElementById('smartM');
    const smartA = document.getElementById('smartA');
    const smartR = document.getElementById('smartR');
    const smartT = document.getElementById('smartT');
    const btnAnalyzeSMART = document.getElementById('btnAnalyzeSMART');
    const smartOutputContainer = document.getElementById('smartOutputContainer');
    const smartTableBody = document.getElementById('smartTableBody');
    const smartReportSummary = document.getElementById('smartReportSummary');

    // ==========================================================================
    // A. ENGINE REVISI: TO DO LIST BERKALA + GAMIFIKASI XP CORE
    // ==========================================================================
    function renderTodos() {
        if (!todoListContainer) return;
        todoListContainer.innerHTML = '';
        const listSekarang = todoData[currentTab] || [];

        if (listSekarang.length === 0) {
            todoListContainer.innerHTML = `<p style="color:#888; font-style:italic; font-size:13px; text-align:center; padding: 10px;">Belum ada rencana tugas ${currentTab} di daftar.</p>`;
            return;
        }

        listSekarang.forEach((todo, index) => {
            const item = document.createElement('div');
            // Menambahkan class 'completed' jika todo.completed bernilai true
            item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'space-between';
            item.style.padding = '10px';
            item.style.background = 'rgba(0,0,0,0.02)';
            item.style.borderRadius = '8px';
            item.style.marginBottom = '8px';

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${index}" class="todo-chk" style="cursor:pointer; width:16px; height:16px;">
                    <span class="todo-text-span" style="${todo.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${todo.text}</span>
                </div>
                <button data-index="${index}" class="todo-del-btn" style="background:none; border:none; color:#EF4444; cursor:pointer; font-weight:bold;">✕</button>
            `;
            todoListContainer.appendChild(item);
        });

        // Trigger Event Listener Checkbox Selesai (+10 XP Sistem)
        document.querySelectorAll('.todo-chk').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                const isChecked = e.target.checked;
                
                todoData[currentTab][idx].completed = isChecked;
                localStorage.setItem('zenithTodoData', JSON.stringify(todoData));

                // JIKA BERHASIL DICENTANG -> BERIKAN BONUS +10 XP KE SYSTEM UTAMA
                if (isChecked) {
                    if (typeof addXP === 'function') {
                        addXP(10); // Otomatis sinkron memanggil alert naik level dari js/script.js milikmu!
                    } else {
                        // Jalur penyelamat cadangan jika script.js terhambat pembacaan DOM
                        let sessionData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {username:"", xp:0, level:1};
                        sessionData.xp += 10;
                        if (sessionData.xp >= 100) {
                            sessionData.level += 1;
                            sessionData.xp -= 100;
                            alert(`Selamat! Kamu naik ke Level ${sessionData.level}! 🚀`);
                        }
                        sessionStorage.setItem('zenithSessionData', JSON.stringify(sessionData));
                        if (typeof updateDashboardUI === 'function') updateDashboardUI();
                    }
                }
                renderTodos();
            });
        });

        // Trigger Tombol Hapus Tugas
        document.querySelectorAll('.todo-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                todoData[currentTab].splice(idx, 1);
                localStorage.setItem('zenithTodoData', JSON.stringify(todoData));
                renderTodos();
            });
        });
    }

    if (btnAddTodo) {
        btnAddTodo.addEventListener('click', () => {
            const val = todoInput.value.trim();
            if (!val) return;
            todoData[currentTab].push({ text: val, completed: false });
            localStorage.setItem('zenithTodoData', JSON.stringify(todoData));
            todoInput.value = '';
            renderTodos();
        });
    }

    // Manajemen Penukaran Navigasi Tab
    const tabs = [
        { el: document.getElementById('tabDaily'), name: 'daily' },
        { el: document.getElementById('tabWeekly'), name: 'weekly' },
        { el: document.getElementById('tabMonthly'), name: 'monthly' }
    ];

    tabs.forEach(tab => {
        if (tab.el) {
            tab.el.addEventListener('click', (e) => {
                currentTab = tab.name;
                tabs.forEach(t => { if(t.el) t.el.classList.remove('active'); });
                e.currentTarget.classList.add('active');
                renderTodos();
            });
        }
    });

    // ==========================================================================
    // B. ENGINE BAD HABITS ELIMINATOR
    // ==========================================================================
    function renderHabits() {
        if (!habitContainer) return;
        habitContainer.innerHTML = '';

        if (badHabits.length === 0) {
            habitContainer.innerHTML = `<p style="color:#888; font-style:italic; font-size:13px; text-align:center; padding: 10px;">Belum ada bad habit yang didaftarkan.</p>`;
            return;
        }

        badHabits.forEach((habit, index) => {
            const item = document.createElement('div');
            item.className = 'todo-item';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'space-between';
            item.style.padding = '8px 10px';
            item.style.borderLeft = '4px solid #EF4444';
            item.style.background = 'rgba(239, 68, 68, 0.05)';
            item.style.borderRadius = '0 8px 8px 0';
            item.style.marginBottom = '6px';

            item.innerHTML = `
                <span>🔥 ${habit}</span>
                <button data-index="${index}" class="habit-del-btn" style="background:none; border:none; color:#888; cursor:pointer; font-weight:bold;">✕</button>
            `;
            habitContainer.appendChild(item);
        });

        document.querySelectorAll('.habit-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                badHabits.splice(idx, 1);
                localStorage.setItem('zenithBadHabits', JSON.stringify(badHabits));
                renderHabits();
            });
        });
    }

    if (btnAddHabit) {
        btnAddHabit.addEventListener('click', () => {
            const val = habitInput.value.trim();
            if (!val) return;
            badHabits.push(val);
            localStorage.setItem('zenithBadHabits', JSON.stringify(badHabits));
            habitInput.value = '';
            renderHabits();
        });
    }

    // ==========================================================================
    // C. ENGINE VISION BOARDS
    // ==========================================================================
    if (btnSaveVision) {
        btnSaveVision.addEventListener('click', () => {
            visionData.short = goalShort.value.trim();
            visionData.long = goalLong.value.trim();
            localStorage.setItem('zenithVisionData', JSON.stringify(visionData));
            alert("Vision Boards target masa depanmu berhasil dikunci di LocalStorage! 🚀");
        });
    }

    // ==========================================================================
    // D. REVISI UTAMA: ENGINE SMART FORM & GENERATOR OUTPUT TABEL
    // ==========================================================================
    function generateSmartTableReport() {
        if (!smartData.analyzed) {
            smartOutputContainer.style.display = 'none';
            return;
        }

        // Ambil value input dari memori
        const sVal = smartData.s || '';
        const mVal = smartData.m || '';
        const aVal = smartData.a || '';
        const rVal = smartData.r || '';
        const tVal = smartData.t || '';

        // Validasi aturan pintar
        const checkS = sVal.length >= 8 ? "✅ Valid" : "❌ Kurang Spesifik";
        const checkM = /\d+/.test(mVal) ? "✅ Terukur (Ada Angka)" : "❌ Masih Abstrak";
        const checkA = aVal.length >= 6 ? "✅ Realistis" : "❌ Kurang Metode";
        const checkR = rVal.length >= 6 ? "✅ Relevan" : "❌ Kurang Relevan";
        const checkT = /(\d+|hari|minggu|bulan|tahun|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i.test(tVal) ? "✅ Jelas" : "❌ Tanpa Tenggat";

        // Inject baris data ke tabel HTML
        smartTableBody.innerHTML = `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px; font-weight:bold;">Specific</td>
                <td style="padding: 10px;">"${sVal || 'Kosong'}"</td>
                <td style="padding: 10px; color: ${checkS.includes('✅') ? '#10B981' : '#EF4444'}; font-weight:600;">${checkS}</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px; font-weight:bold;">Measurable</td>
                <td style="padding: 10px;">"${mVal || 'Kosong'}"</td>
                <td style="padding: 10px; color: ${checkM.includes('✅') ? '#10B981' : '#EF4444'}; font-weight:600;">${checkM}</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px; font-weight:bold;">Achievable</td>
                <td style="padding: 10px;">"${aVal || 'Kosong'}"</td>
                <td style="padding: 10px; color: ${checkA.includes('✅') ? '#10B981' : '#EF4444'}; font-weight:600;">${checkA}</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px; font-weight:bold;">Relevant</td>
                <td style="padding: 10px;">"${rVal || 'Kosong'}"</td>
                <td style="padding: 10px; color: ${checkR.includes('✅') ? '#10B981' : '#EF4444'}; font-weight:600;">${checkR}</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px; font-weight:bold;">Time-Bound</td>
                <td style="padding: 10px;">"${tVal || 'Kosong'}"</td>
                <td style="padding: 10px; color: ${checkT.includes('✅') ? '#10B981' : '#EF4444'}; font-weight:600;">${checkT}</td>
            </tr>
        `;

        // Buat kesimpulan kalimat gabungan pintar otomatis
        if (checkS.includes('✅') && checkM.includes('✅') && checkT.includes('✅')) {
            smartReportSummary.innerHTML = `🤖 <strong>Kesimpulan Analisis Cerdas:</strong> Target kamu luar biasa! Parameter rencana ini sudah sepenuhnya <strong>SMART</strong>. Kalimat target terpadumu adalah: <em>"${sVal} dengan indikator ${mVal}, dieksekusi melalui ${aVal} karena ${rVal}, dan harus rampung target pada ${tVal}."</em> Tetap konsisten, Pendri!`;
        } else {
            smartReportSummary.innerHTML = `🤖 <strong>Kesimpulan Analisis Cerdas:</strong> Rencana kamu belum sepenuhnya SMART. <strong>Saran perbaikan:</strong> Pastikan pada kolom Measurable memasukkan angka pasti (misal: 1 jam sehari), dan pada kolom Time-Bound berikan batas penanggalan yang jelas.`;
        }

        smartOutputContainer.style.display = 'block';
    }

    if (btnAnalyzeSMART) {
        btnAnalyzeSMART.addEventListener('click', () => {
            smartData.s = smartS.value.trim();
            smartData.m = smartM.value.trim();
            smartData.a = smartA.value.trim();
            smartData.r = smartR.value.trim();
            smartData.t = smartT.value.trim();
            
            if (!smartData.s || !smartData.m || !smartData.t) {
                alert("Harap isi parameter minimal komponen Specific, Measurable, dan Time-Bound terlebih dahulu!");
                return;
            }

            smartData.analyzed = true;
            localStorage.setItem('zenithSmartData', JSON.stringify(smartData));
            generateSmartTableReport();
        });
    }

    // ==========================================================================
    // E. SINKRONISASI AWAL DATA PADA SAAT HALAMAN DIMUAT
    // ==========================================================================
    if (goalShort) goalShort.value = visionData.short || '';
    if (goalLong) goalLong.value = visionData.long || '';
    
    if (smartS) smartS.value = smartData.s || '';
    if (smartM) smartM.value = smartData.m || '';
    if (smartA) smartA.value = smartData.a || '';
    if (smartR) smartR.value = smartData.r || '';
    if (smartT) smartT.value = smartData.t || '';

    renderTodos();
    renderHabits();
    if (smartData.analyzed) generateSmartTableReport();
});