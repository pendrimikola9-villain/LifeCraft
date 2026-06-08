document.addEventListener('DOMContentLoaded', () => {
    
    let currentTab = 'daily';
    let todoData = JSON.parse(localStorage.getItem('zenithTodoData')) || { daily: [], weekly: [], monthly: [] };
    // Memuat data habits gabungan (baik & buruk)
    let habitsData = JSON.parse(localStorage.getItem('zenithHabitsData')) || [];

    const todoListContainer = document.getElementById('todoListContainer');
    const todoInput = document.getElementById('todoInput');
    const btnAddTodo = document.getElementById('btnAddTodo');
    const habitContainer = document.getElementById('habitContainer');
    const habitInput = document.getElementById('habitInput');
    const btnAddHabit = document.getElementById('btnAddHabit');
    const goodHabitInput = document.getElementById('goodHabitInput');
    const btnAddGoodHabit = document.getElementById('btnAddGoodHabit');
    const pureChartContainer = document.getElementById('pureChartContainer');

    function claimUserXP(amount) {
        let sessionData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || { username: "Pendri Mikola", xp: 0, level: 1 };
        sessionData.xp = parseInt(sessionData.xp) || 0;
        sessionData.level = parseInt(sessionData.level) || 1;
        
        sessionData.xp += amount;
        if (sessionData.xp >= 100) {
            sessionData.level += 1;
            sessionData.xp -= 100;
            alert(`Luar Biasa, Pendri! Karakter ZenithLife Kamu Naik ke Level ${sessionData.level}! 🚀`);
        }
        sessionStorage.setItem('zenithSessionData', JSON.stringify(sessionData));
        if (typeof updateDashboardUI === 'function') updateDashboardUI();
    }

    // ==========================================
    // 1. ENGINE GRAPHIC RENDERING GABUNGAN (MURNI CSS VANILLA DOM)
    // ==========================================
    function renderPureCSSChart() {
        if (!pureChartContainer) return;
        pureChartContainer.innerHTML = '';

        if (habitsData.length === 0) {
            pureChartContainer.innerHTML = `<p style="color:var(--text-light); font-style:italic; font-size:13px; padding: 20px;">Daftarkan kebiasaan baik atau buruk di atas untuk membangun grafik keseimbangan hidup.</p>`;
            return;
        }

        // Cari streak tertinggi sebagai batas puncak skala grafik batang (maksimal tinggi 180px)
        const maxStreak = Math.max(...habitsData.map(h => h.streak || 0), 1);

        habitsData.forEach(habit => {
            const currentStreak = habit.streak || 0;
            const calculatedHeight = (currentStreak / maxStreak) * 180 + 10; 
            const isGood = habit.type === 'good';

            const barColumn = document.createElement('div');
            barColumn.className = 'chart-bar-column';

            barColumn.innerHTML = `
                <div class="chart-bar-actual ${isGood ? 'good-habit-bar' : 'bad-habit-bar'}" style="height: ${calculatedHeight}px;">
                    <span class="chart-bar-value">${currentStreak} Hari</span>
                </div>
                <span class="chart-bar-label" title="${habit.name}">${isGood ? '👍' : '🚫'} ${habit.name}</span>
            `;
            pureChartContainer.appendChild(barColumn);
        });
    }

    // ==========================================
    // 2. RENDER TASK ECOSYSTEM
    // ==========================================
    function renderTodos() {
        if (!todoListContainer) return;
        todoListContainer.innerHTML = '';
        const listSekarang = todoData[currentTab] || [];

        if (listSekarang.length === 0) {
            todoListContainer.innerHTML = `<p style="color:var(--text-light); font-style:italic; font-size:13px; text-align:center; padding: 12px;">Belum ada rencana tugas ${currentTab}.</p>`;
            return;
        }

        listSekarang.forEach((todo, index) => {
            const item = document.createElement('div');
            item.className = `todo-item-row ${todo.completed ? 'completed-task' : ''}`;
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${index}" class="todo-chk-box" style="cursor:pointer; width:16px; height:16px;">
                    <span style="font-size:13px; font-weight:500;">${todo.text}</span>
                </div>
                <button data-index="${index}" class="todo-del-action" style="background:none; border:none; color:#EF4444; cursor:pointer; font-weight:bold;">✕</button>
            `;
            todoListContainer.appendChild(item);
        });

        document.querySelectorAll('.todo-chk-box').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                const isChecked = e.target.checked;
                todoData[currentTab][idx].completed = isChecked;
                localStorage.setItem('zenithTodoData', JSON.stringify(todoData));
                if (isChecked) claimUserXP(10);
                renderTodos();
            });
        });

        document.querySelectorAll('.todo-del-action').forEach(btn => {
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

    // ==========================================
    // 3. RENDER HABIT LIST GABUNGAN (BAIK & BURUK)
    // ==========================================
    function renderHabits() {
        if (!habitContainer) return;
        habitContainer.innerHTML = '';

        if (habitsData.length === 0) {
            habitContainer.innerHTML = `<p style="color:var(--text-light); font-style:italic; font-size:13px; text-align:center; padding: 12px;">Belum ada kebiasaan yang dilacak.</p>`;
            renderPureCSSChart();
            return;
        }

        habitsData.forEach((habit, index) => {
            const isGood = habit.type === 'good';
            const themeColor = isGood ? '#10B981' : '#EF4444';
            const themeBg = isGood ? '#F0FDF4' : '#FEF2F2';
            const themeBorder = isGood ? '#A7F3D0' : '#FCA5A5';

            const item = document.createElement('div');
            item.className = 'todo-item-row';
            item.style.borderLeft = `4px solid ${themeColor}`;
            item.style.padding = '14px 12px';
            
            item.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:4px; flex: 1;">
                    <span style="font-size:14px; font-weight:600;">${isGood ? '👍' : '🚫'} ${habit.name}</span>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="habit-streak-badge" style="background:${themeBg}; color:${themeColor}; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; border:1px solid ${themeBorder};">
                            🔥 ${habit.streak || 0} Hari ${isGood ? 'Konsisten' : 'Bertahan'}
                        </span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <button data-index="${index}" class="habit-check-btn" style="background:#10B981; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; font-weight:bold;">+1 Hari ✔</button>
                    <button data-index="${index}" class="habit-reset-btn" style="background:#64748B; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; font-weight:bold;">Reset 🔄</button>
                    <button data-index="${index}" class="habit-del-action" style="background:none; border:none; color:#B91C1C; cursor:pointer; font-weight:bold; font-size:14px;">✕</button>
                </div>
            `;
            habitContainer.appendChild(item);
        });

        // Event Klik +1 Hari Sukses
        document.querySelectorAll('.habit-check-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                habitsData[idx].streak = (habitsData[idx].streak || 0) + 1;
                localStorage.setItem('zenithHabitsData', JSON.stringify(habitsData));
                claimUserXP(15);
                renderHabits();
            });
        });

        // Event Klik Reset
        document.querySelectorAll('.habit-reset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                if(confirm(`Apakah kamu ingin mengulang tracker untuk kebiasaan "${habitsData[idx].name}" dari 0 hari lagi?`)) {
                    habitsData[idx].streak = 0;
                    localStorage.setItem('zenithHabitsData', JSON.stringify(habitsData));
                    renderHabits();
                }
            });
        });

        // Event Klik Hapus
        document.querySelectorAll('.habit-del-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                habitsData.splice(idx, 1);
                localStorage.setItem('zenithHabitsData', JSON.stringify(habitsData));
                renderHabits();
            });
        });

        renderPureCSSChart();
    }

    // Event handler tambah kebiasaan BURUK
    if (btnAddHabit) {
        btnAddHabit.addEventListener('click', () => {
            const val = habitInput.value.trim();
            if (!val) return;
            habitsData.push({ name: val, type: 'bad', streak: 0 });
            localStorage.setItem('zenithHabitsData', JSON.stringify(habitsData));
            habitInput.value = '';
            renderHabits();
        });
    }

    // Event handler tambah kebiasaan BAIK
    if (btnAddGoodHabit) {
        btnAddGoodHabit.addEventListener('click', () => {
            const val = goodHabitInput.value.trim();
            if (!val) return;
            habitsData.push({ name: val, type: 'good', streak: 0 });
            localStorage.setItem('zenithHabitsData', JSON.stringify(habitsData));
            goodHabitInput.value = '';
            renderHabits();
        });
    }

    renderTodos();
    renderHabits();
});