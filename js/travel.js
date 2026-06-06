/* ==========================================================================
   1. DATABASE LINK SINKRONISASI SESSIONSTORAGE
   ========================================================================== */
let travelData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {
    username: "", xp: 0, level: 1, waterIntake: 0, notesCount: 0, atsScore: 0, wallet: 0, savedTrips: [], lastMissionDate: ""
};

// Pastikan array rencana perjalanan sudah siap di memori
if (travelData.savedTrips === undefined) travelData.savedTrips = [];

function saveTravelData() {
    sessionStorage.setItem('zenithSessionData', JSON.stringify(travelData));
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
}

function addTravelXP(amount) {
    travelData.xp += amount;
    if (travelData.xp >= 100) {
        travelData.level += 1;
        travelData.xp = travelData.xp - 100;
        alert(`Selamat! Kamu naik ke Level ${travelData.level}! 🚀`);
    }
    saveTravelData();
}

/* ==========================================================================
   2. TRAVEL WORKSPACE ENGINE (CRUD + MATEMATIKA KALKULASI TANGGAL & VALIDASI)
   ========================================================================== */
const travelForm = document.getElementById('travelForm');
const travelGrid = document.getElementById('travelGrid');
const travelWalletText = document.getElementById('travelWalletText');
const budgetStatusAlert = document.getElementById('budgetStatusAlert');

function renderTravelPlanner() {
    // A. TAMPILKAN INTERKONEKSI DANA TABUNGAN DARI WEALTHLAB
    const tabunganTersedia = travelData.wallet || 0;
    if (travelWalletText) {
        travelWalletText.innerText = `Rp ${tabunganTersedia.toLocaleString('id-ID')}`;
    }

    if (!travelGrid) return;
    travelGrid.innerHTML = "";

    let totalTravelCost = 0;

    if (travelData.savedTrips.length === 0) {
        travelGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-light); padding: 40px; border: 2px dashed rgba(99,102,241,0.2); border-radius: var(--radius-lg); background: rgba(255,255,255,0.2);">
                <p style="font-weight: 600;">Belum ada rencana rute wisata. Tambahkan destinasi impianmu di form kiri!</p>
            </div>`;
        
        if (budgetStatusAlert) {
            budgetStatusAlert.innerText = "⚠️ Belum ada rencana destinasi dibuat.";
            budgetStatusAlert.style.cssText = "min-height: auto; padding: 16px 24px; background: rgba(15,23,42,0.04); border: 1px dashed var(--text-light); width: 300px; justify-content: center; align-items: center; text-align: center; font-weight: 700; color: var(--text-light); box-shadow: none; margin: 0;";
        }
        return;
    }

    // B. RENDER KARTU DESTINASI LIST
    travelData.savedTrips.forEach((trip, index) => {
        totalTravelCost += trip.cost; // Jumlahkan total biaya pengeluaran wisata

        const card = document.createElement('div');
        card.className = 'dash-card';
        card.style.cssText = "min-height: auto; padding: 24px; text-align: left; display: flex; flex-direction: column; justify-content: space-between;";
        
        card.innerHTML = `
            <div>
                <span class="note-tag tag-Umum" style="background: rgba(99,102,241,0.08); color: var(--primary);">📍 Destinasi</span>
                <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 6px;">${escapeHTML(trip.destination)}</h4>
                
                <div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
                    <span>📅 <strong>Berangkat:</strong> ${trip.dateStart}</span>
                    <span>⌛ <strong>Durasi:</strong> ${trip.duration} Hari</span>
                    <span>🏁 <strong>Perkiraan Pulang:</strong> ${trip.dateEnd}</span>
                </div>

                <p style="font-size: 14px; color: var(--text-dark); margin-bottom: 14px;">🎯 <em>${escapeHTML(trip.activity)}</em></p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(15,23,42,0.05); padding-top: 12px; margin-top: 8px;">
                <span style="font-weight: 800; color: var(--text-dark); font-size: 14px;">Rp ${trip.cost.toLocaleString('id-ID')}</span>
                <button onclick="deleteTrip(${index})" style="background: none; color: #EF4444; border: none; font-weight: 700; cursor: pointer; font-size: 13px;">Hapus</button>
            </div>
        `;
        travelGrid.appendChild(card);
    });

    // C. LOGIKA MATEMATIKA DETEKTOR KELAYAKAN ISI DOMPET FINANSIAL
    if (budgetStatusAlert) {
        if (totalTravelCost <= tabunganTersedia) {
            budgetStatusAlert.innerText = `✅ DANA AMAN! Total estimasi biaya wisata (Rp ${totalTravelCost.toLocaleString('id-ID')}) tercukupi oleh isi dompet tabunganmu.`;
            budgetStatusAlert.style.cssText = "min-height: auto; padding: 16px 24px; background: rgba(16,185,129,0.08); border: 1px solid #10B981; width: 330px; justify-content: center; align-items: center; text-align: center; font-weight: 700; color: #10B981; box-shadow: none; margin: 0; border-radius: var(--radius-md); font-size: 13px; line-height: 1.4;";
        } else {
            const minus = totalTravelCost - tabunganTersedia;
            budgetStatusAlert.innerText = `❌ DANA KURANG! Biaya wisata membengkak. Tabunganmu kurang sebesar Rp ${minus.toLocaleString('id-ID')}.`;
            budgetStatusAlert.style.cssText = "min-height: auto; padding: 16px 24px; background: rgba(239, 68, 68, 0.08); border: 1px solid #EF4444; width: 330px; justify-content: center; align-items: center; text-align: center; font-weight: 700; color: #EF4444; box-shadow: none; margin: 0; border-radius: var(--radius-md); font-size: 13px; line-height: 1.4;";
        }
    }
}

// Handler Aksi Submit Rute Wisata Baru
if (travelForm) {
    travelForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const destination = document.getElementById('travelDestination').value.trim();
        const dateStartInput = document.getElementById('travelDateStart').value;
        const duration = parseInt(document.getElementById('travelDurationDays').value) || 1;
        const cost = parseFloat(document.getElementById('travelCost').value) || 0;
        const activity = document.getElementById('travelActivity').value.trim();

        if (cost <= 0) {
            alert("Estimasi biaya perjalanan tidak boleh Rp 0!");
            return;
        }

        // --- ALGORITMA INTEGRASI RUMUS HITUNG TANGGAL PULANG ---
        const startDateObj = new Date(dateStartInput);
        
        // Rumus Tambah Hari Matematika JS: Tanggal Berangkat + Jumlah Hari Durasi
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + duration);

        // Format tampilan tanggal Indonesia (DD-MM-YYYY)
        const formatIDDate = (dateObj) => {
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const dateStartFormatted = formatIDDate(startDateObj);
        const dateEndFormatted = formatIDDate(endDateObj);

        // Masukkan objek data rute liburan lengkap ke memori sesi
        travelData.savedTrips.unshift({
            destination,
            dateStart: dateStartFormatted,
            duration,
            dateEnd: dateEndFormatted,
            cost,
            activity
        });

        addTravelXP(10); // Reward +10 XP karena cerdas merancang refreshing diri
        travelForm.reset();
        renderTravelPlanner();
    });
}

// Handler Hapus Rencana Perjalanan Wisata
window.deleteTrip = function(index) {
    if (confirm("Hapus rencana liburan ke destinasi ini?")) {
        travelData.savedTrips.splice(index, 1);
        saveTravelData();
        renderTravelPlanner();
    }
};

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   3. AUTO INITIALIZER ON LOAD (KHUSUS HALAMAN TRAVEL)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    renderTravelPlanner();
});