/* ==========================================================================
   1. DATABASE LINK SINKRONISASI SESSIONSTORAGE
   ========================================================================== */
let financeData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {
    username: "", xp: 0, level: 1, waterIntake: 0, notesCount: 0, atsScore: 0, wallet: 0, savedExpenses: [], lastMissionDate: ""
};

// Pastikan array pengeluaran sudah terdefinisi di memori browser
if (financeData.savedExpenses === undefined) financeData.savedExpenses = [];

function saveFinanceData() {
    sessionStorage.setItem('zenithSessionData', JSON.stringify(financeData));
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
}

function addFinanceXP(amount) {
    financeData.xp += amount;
    if (financeData.xp >= 100) {
        financeData.level += 1;
        financeData.xp = financeData.xp - 100;
        alert(`Selamat! Kamu naik ke Level ${financeData.level}! 🚀`);
    }
    saveFinanceData();
}

/* ==========================================================================
   2. DYNAMIC BUDGET ALLOCATOR ENGINE (MATEMATIKA FINANSIAL)
   ========================================================================== */
const inputIncome = document.getElementById('inputIncome');

function calculateBudgetDistribution() {
    if (!inputIncome) return;
    
    const incomeValue = parseFloat(inputIncome.value) || 0;
    
    // Rumus Matematika Alokasi 50% Kebutuhan, 30% Keinginan, 20% Tabungan
    const needs = Math.round(incomeValue * 0.5);
    const wants = Math.round(incomeValue * 0.3);
    const savings = Math.round(incomeValue * 0.2);

    // Format mata uang Rupiah lokal Indonesia secara rapi ke layar
    document.getElementById('allocNeeds').innerText = `Rp ${needs.toLocaleString('id-ID')}`;
    document.getElementById('allocWants').innerText = `Rp ${wants.toLocaleString('id-ID')}`;
    document.getElementById('allocSavings').innerText = `Rp ${savings.toLocaleString('id-ID')}`;

    // REVISI KEDUA: Sinkronisasi nominal sisa tabungan (20%) ke data wallet global
    // Data wallet ini yang nantinya akan otomatis dibaca oleh halaman Travel Planner!
    financeData.wallet = savings;
    sessionStorage.setItem('zenithSessionData', JSON.stringify(financeData));
}

if (inputIncome) {
    inputIncome.addEventListener('input', calculateBudgetDistribution);
}

/* ==========================================================================
   3. EXPENSE TRACKER TABLE ENGINE (CRUD TABEL LOGIK)
   ========================================================================== */
const expenseForm = document.getElementById('expenseForm');
const filterSelect = document.getElementById('filterCategorySelect');

window.renderExpenseTable = function(filteredArray = financeData.savedExpenses) {
    const tableBody = document.getElementById('expenseTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = "";

    // Jika riwayat kosong, tampilkan baris informasi khusus murni HTML
    if (filteredArray.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="padding: 24px; text-align: center; color: var(--text-light); font-style: italic;">
                    Belum ada catatan riwayat transaksi pengeluaran.
                </td>
            </tr>`;
        return;
    }

    // Perulangan Array Methods untuk membangun baris-baris data tabel
    filteredArray.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid rgba(15,23,42,0.04)";
        
        // Cek label warna kustom tag berdasarkan jenis pengeluaran
        const badgeClass = item.category === 'Kebutuhan' ? 'tag-Umum' : 'tag-Penting';
        
        tr.innerHTML = `
            <td style="padding: 14px; font-weight: 600; color: var(--text-dark);">${escapeHTML(item.name)}</td>
            <td style="padding: 14px;"><span class="note-tag ${badgeClass}" style="margin:0;">${item.category}</span></td>
            <td style="padding: 14px; font-weight: 700; color: var(--text-dark);">Rp ${item.amount.toLocaleString('id-ID')}</td>
            <td style="padding: 14px; text-align: right;">
                <button onclick="deleteExpense(${index})" style="background: none; color: #EF4444; border: none; font-weight: 700; cursor: pointer; font-size: 13px;">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
};

// Handler Tambah Item Transaksi Baru (Create)
if (expenseForm) {
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('expName').value.trim();
        const category = document.getElementById('expCategory').value;
        const amount = parseFloat(document.getElementById('expAmount').value) || 0;

        if (amount <= 0) {
            alert("Nominal transaksi pengeluaran harus di atas Rp 0!");
            return;
        }

        // Masukkan data baru ke dalam baris array teratas
        financeData.savedExpenses.unshift({ name, category, amount });
        
        addFinanceXP(10); // Hadiah +10 XP karena rajin mencatat uang
        expenseForm.reset(); // Kosongkan form isian
        
        // Kembalikan seleksi filter ke status "Semua" agar item baru langsung terlihat
        if (filterSelect) filterSelect.value = "Semua";
        renderExpenseTable();
    });
}

// Handler Hapus Item Transaksi (Delete)
window.deleteExpense = function(index) {
    if (confirm("Hapus catatan transaksi pengeluaran ini?")) {
        financeData.savedExpenses.splice(index, 1);
        saveFinanceData();
        renderExpenseTable();
    }
};

/* ==========================================================================
   4. LIVE FILTER ENGINE (Algoritma Array Filter)
   ========================================================================== */
if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        
        if (selectedCategory === "Semua") {
            renderExpenseTable(financeData.savedExpenses);
        } else {
            // Saring array hanya yang memiliki kategori yang cocok
            const filteredData = financeData.savedExpenses.filter(item => item.category === selectedCategory);
            renderExpenseTable(filteredData);
        }
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   5. AUTO INITIALIZER ON LOAD (KHUSUS HALAMAN KEUANGAN)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    calculateBudgetDistribution();
    renderExpenseTable();
});