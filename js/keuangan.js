document.addEventListener('DOMContentLoaded', () => {
    
    const inputIncome = document.getElementById('inputIncome');
    const selCategory = document.getElementById('selCategory');
    const customCategoryWrapper = document.getElementById('customCategoryWrapper');
    const btnSaveTransaction = document.getElementById('btnSaveTransaction');
    const btnClearHistory = document.getElementById('btnClearHistory');
    const financialLogsContainer = document.getElementById('financialLogsContainer');

    // ==========================================================================
    // 1. UTK SIMULATOR: LIVE CALCULATION ANGGARAN 50/30/20
    // ==========================================================================
    function calculateBudgetSimulation() {
        if (!inputIncome) return;
        
        const incomeValue = parseFloat(inputIncome.value) || 0;
        sessionStorage.setItem('zenithSimmedIncome', incomeValue);

        // Alokasi Matematis
        const needs = Math.floor(incomeValue * 0.50);
        const wants = Math.floor(incomeValue * 0.30);
        const savings = Math.floor(incomeValue * 0.20);

        // Cetak hasil simulasi ke komponen box
        document.getElementById('lblSimNeeds').innerText = `Rp ${needs.toLocaleString('id-ID')}`;
        document.getElementById('lblSimWants').innerText = `Rp ${wants.toLocaleString('id-ID')}`;
        document.getElementById('lblSimSavings').innerText = `Rp ${savings.toLocaleString('id-ID')}`;
    }

    if (inputIncome) {
        // Ambil nilai lama yang tersimpan di memori browser
        inputIncome.value = sessionStorage.getItem('zenithSimmedIncome') || "2000000";
        calculateBudgetSimulation();

        // Picu kalkulasi ulang tiap kali user mengetik atau menekan tombol step up/down
        inputIncome.addEventListener('input', calculateBudgetSimulation);
    }

    // Default input tanggal transaksi hari ini
    const dateInput = document.getElementById('dateTransaction');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    // Toggle Kategori Kustom
    if (selCategory && customCategoryWrapper) {
        selCategory.addEventListener('change', () => {
            if (selCategory.value === 'custom') {
                customCategoryWrapper.style.display = 'block';
                document.getElementById('txtCustomCategory').focus();
            } else {
                customCategoryWrapper.style.display = 'none';
            }
        });
    }

    // ==========================================================================
    // 2. RENDER ARUS KAS KRONOLOGIS
    // ==========================================================================
    function renderFinancialData() {
        if (!financialLogsContainer) return;

        let transactions = JSON.parse(sessionStorage.getItem('zenithTransactions')) || [];
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort Kronologis

        let totalIn = 0, totalOut = 0;
        financialLogsContainer.innerHTML = '';

        if (transactions.length === 0) {
            financialLogsContainer.innerHTML = `<p style="color: var(--text-light); font-size: 13px; text-align: center; margin: auto;">Belum ada riwayat transaksi keuangan harian.</p>`;
            document.getElementById('lblTotalIn').innerText = 'Rp 0';
            document.getElementById('lblTotalOut').innerText = 'Rp 0';
            document.getElementById('lblNetBalance').innerText = 'Rp 0';
            renderMultiSavings(); // Render celengan kosong atau lama
            return;
        }

        transactions.forEach((tx, index) => {
            const card = document.createElement('div');
            const isIncome = tx.type === 'pemasukan';
            const borderLeftColor = isIncome ? '#10b981' : '#ef4444';
            const sign = isIncome ? '+' : '-';
            const bgBadge = isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

            if (isIncome) totalIn += tx.amount; else totalOut += tx.amount;

            card.style.cssText = `background: var(--bg-navbar); padding: 12px; border-radius: var(--radius-md); border-left: 4px solid ${borderLeftColor}; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; font-size: 13px;`;
            const formattedDate = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            card.innerHTML = `
                <div>
                    <h4 style="font-size: 13px; color: var(--text-dark); margin-bottom: 2px;">${tx.notes || 'Tanpa Keterangan'}</h4>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 10px; background: ${bgBadge}; color: ${borderLeftColor}; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${tx.category}</span>
                        <span style="font-size: 11px; color: var(--text-light); font-weight: 600;">📅 ${formattedDate}</span>
                    </div>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-weight: 700; color: ${borderLeftColor};">${sign} Rp ${tx.amount.toLocaleString('id-ID')}</span>
                    <button class="btn-delete-tx" data-index="${index}" style="background: transparent; border: none; color: var(--text-light); font-size: 10px; cursor: pointer; text-decoration: underline;">Hapus</button>
                </div>
            `;
            financialLogsContainer.appendChild(card);
        });

        document.getElementById('lblTotalIn').innerText = `Rp ${totalIn.toLocaleString('id-ID')}`;
        document.getElementById('lblTotalOut').innerText = `Rp ${totalOut.toLocaleString('id-ID')}`;
        
        const netBalance = totalIn - totalOut;
        const netLabel = document.getElementById('lblNetBalance');
        netLabel.innerText = `Rp ${netBalance.toLocaleString('id-ID')}`;
        netLabel.style.color = netBalance >= 0 ? '#10b981' : '#ef4444';

        // Panggil render multi-savings agar tersinkronisasi saat ada transaksi dihapus
        renderMultiSavings();

        document.querySelectorAll('.btn-delete-tx').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                let rawData = JSON.parse(sessionStorage.getItem('zenithTransactions')) || [];
                rawData.sort((a, b) => new Date(b.date) - new Date(a.date));
                rawData.splice(idx, 1);
                sessionStorage.setItem('zenithTransactions', JSON.stringify(rawData));
                renderFinancialData();
            });
        });
    }

    // Simpan Transaksi Baru
    if (btnSaveTransaction) {
        btnSaveTransaction.addEventListener('click', () => {
            const type = document.querySelector('input[name="radType"]:checked').value;
            const amount = parseInt(document.getElementById('numAmount').value);
            const date = document.getElementById('dateTransaction').value;
            const notes = document.getElementById('txtNotes').value.trim();
            let category = selCategory.value;

            if (category === 'custom') {
                const customText = document.getElementById('txtCustomCategory').value.trim();
                if (!customText) return alert('Silakan ketik nama kategori kustom kamu!');
                category = `✏️ ${customText}`;
            }

            if (!amount || amount <= 0 || !date) return alert('Lengkapi data nominal dan tanggal transaksi!');

            let transactions = JSON.parse(sessionStorage.getItem('zenithTransactions')) || [];
            transactions.push({ type, amount, date, category, notes });
            sessionStorage.setItem('zenithTransactions', JSON.stringify(transactions));

            document.getElementById('numAmount').value = '';
            document.getElementById('txtNotes').value = '';
            document.getElementById('txtCustomCategory').value = '';
            selCategory.value = selCategory.options[0].value;
            customCategoryWrapper.style.display = 'none';

            alert('Transaksi keuangan berhasil disimpan! 🪙');
            renderFinancialData();
        });
    }

    // Reset Riwayat Transaksi
    if (btnClearHistory) {
        btnClearHistory.addEventListener('click', () => {
            if (confirm('Hapus seluruh riwayat transaksi keuangan?')) {
                sessionStorage.removeItem('zenithTransactions');
                renderFinancialData();
            }
        });
    }

    // ==========================================================================
    // 3. REVISI TOTAL: LOGIKA MULTI-CELENGAN DENGAN SISTEM INPUT SETOR MANUAL
    // ==========================================================================
    const btnSaveSavingGoal = document.getElementById('btnSaveSavingGoal');
    const multiSavingsContainer = document.getElementById('multiSavingsContainer');

    function renderMultiSavings() {
        if (!multiSavingsContainer) return;

        // Ambil array daftar banyak celengan impian dari memori
        let savingsList = JSON.parse(sessionStorage.getItem('zenithMultiSavings')) || [];

        if (savingsList.length === 0) {
            multiSavingsContainer.innerHTML = `<p style="color: var(--text-light); font-size: 13px; text-align: center; margin: auto;">Belum ada daftar target tabungan impian.</p>`;
            return;
        }

        multiSavingsContainer.innerHTML = '';

        savingsList.forEach((goal, index) => {
            const card = document.createElement('div');
            card.style.cssText = "background: var(--bg-navbar); padding: 14px; border-radius: var(--radius-md); border-left: 4px solid #10b981; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;";

            // Hitung persentase ketercapaian tabungan kustom manual
            let percentage = Math.floor((goal.current / goal.target) * 100);
            if (percentage > 100) percentage = 100;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="color: var(--text-dark); font-size: 14px; font-weight: 700; margin: 0;">🎯 ${goal.name}</h4>
                    <button class="btn-delete-goal" data-index="${index}" style="background: transparent; border: none; color: #ef4444; font-size: 11px; font-weight: bold; cursor: pointer; text-decoration: underline;">Hapus</button>
                </div>
                
                <div style="width: 100%; background: var(--border-color); height: 10px; border-radius: 10px; overflow: hidden; margin: 4px 0;">
                    <div style="width: ${percentage}%; background: linear-gradient(90deg, #10b981, #34d399); height: 100%; transition: width 0.4s ease;"></div>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dark); font-weight: 600;">
                    <span>Celengan: <span>Rp ${goal.current.toLocaleString('id-ID')}</span></span>
                    <span>Target: <span>Rp ${goal.target.toLocaleString('id-ID')}</span></span>
                </div>
                
                <div style="text-align: center; font-weight: 700; font-size: 12px; color: #10b981; margin-bottom: 2px;">
                    ${percentage}% Tercapai ${percentage >= 100 ? '🎉 Selesai!' : ''}
                </div>

                <div style="display: flex; gap: 8px; margin-top: 4px; align-items: center;" class="saving-deposit-box">
                    <input type="number" class="num-deposit-input" data-index="${index}" placeholder="Masukkan jumlah uang..." style="flex: 1; padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-main); color: var(--text-dark); font-size: 12px;">
                    <button class="btn-submit-deposit" data-index="${index}" style="background: #10b981; color: white; border: none; padding: 6px 12px; font-weight: bold; font-size: 12px; border-radius: 6px; cursor: pointer;">💰 Setor</button>
                </div>
            `;

            multiSavingsContainer.appendChild(card);
        });

        // Event Listener: Eksekusi Tombol Setor Uang Tabungan Manual
        document.querySelectorAll('.btn-submit-deposit').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                const inputField = document.querySelectorAll('.num-deposit-input')[idx];
                const depositAmount = parseInt(inputField.value) || 0;

                if (depositAmount <= 0) {
                    alert('Masukkan angka nominal setoran tabungan yang valid!');
                    return;
                }

                // Tambahkan uang setoran ke objek celengan target terpilih
                savingsList[idx].current += depositAmount;
                sessionStorage.setItem('zenithMultiSavings', JSON.stringify(savingsList));
                
                alert(`Berhasil memasukkan Rp ${depositAmount.toLocaleString('id-ID')} ke celengan "${savingsList[idx].name}"! 🤝`);
                inputField.value = ''; // Reset input text setor
                renderMultiSavings();
            });
        });

        // Event Listener: Hapus Salah Satu Target Tabungan
        document.querySelectorAll('.btn-delete-goal').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                if (confirm(`Apakah kamu yakin ingin menghapus celengan "${savingsList[idx].name}"?`)) {
                    savingsList.splice(idx, 1);
                    sessionStorage.setItem('zenithMultiSavings', JSON.stringify(savingsList));
                    renderMultiSavings();
                }
            });
        });
    }

    // Aksi Mengunci Target Tabungan Baru (Bisa Berkali-kali)
    if (btnSaveSavingGoal) {
        btnSaveSavingGoal.addEventListener('click', () => {
            const name = document.getElementById('txtSavingGoalName').value.trim();
            const target = parseInt(document.getElementById('numSavingGoalTarget').value) || 0;

            if (!name || target <= 0) {
                alert('Harap isi nama impian dan target nominal dana dengan benar!');
                return;
            }

            let savingsList = JSON.parse(sessionStorage.getItem('zenithMultiSavings')) || [];
            savingsList.push({
                name: name,
                target: target,
                current: 0 // Mulai menabung dari Rp 0 secara mandiri
            });

            sessionStorage.setItem('zenithMultiSavings', JSON.stringify(savingsList));
            document.getElementById('txtSavingGoalName').value = '';
            document.getElementById('numSavingGoalTarget').value = '';

            alert(`Sukses mengunci target celengan impian baru: "${name}"! 🚀`);
            renderMultiSavings();
        });
    }

    // Jalankan render awal saat halaman terbuka
    renderFinancialData();
});