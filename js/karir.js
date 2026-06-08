/* ==========================================================================
   1. DATABASE LINK SINKRONISASI SESSIONSTORAGE
   ========================================================================== */
// Samakan key penyimpanan dengan dashboard utama: 'zenithSessionData'
let careerData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {
    username: "", xp: 0, level: 1, waterIntake: 0, notesCount: 0, atsScore: 0, lastMissionDate: ""
};

function saveCareerData() {
    sessionStorage.setItem('zenithSessionData', JSON.stringify(careerData));
    
    // Sinkronkan ke objek global userData milik dashboard jika file script.js termuat
    if (typeof userData !== 'undefined') {
        userData.atsScore = careerData.atsScore;
        userData.xp = careerData.xp;
        userData.level = careerData.level;
        if (typeof saveUserData === 'function') saveUserData();
    }
    
    // Pemicu pembaruan visual dashboard utama secara langsung
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
}

function addCareerXP(amount) {
    careerData.xp += amount;
    if (careerData.xp >= 100) {
        careerData.level += 1;
        careerData.xp = careerData.xp - 100;
        alert(`Selamat! Kamu naik ke Level ${careerData.level}! 🚀`);
    }
    saveCareerData();
}

/* ==========================================================================
   2. CAREERCRAFT CORE ENGINE (Live CV Builder & ATS Scanner)
   ========================================================================== */
// Daftar Kata Kunci Industri IT Populer untuk Basis Penilaian Skor ATS Lokal
const atsKeywords = ["laravel", "javascript", "html", "css", "php", "flutter", "dart", "responsive", "bootstrap", "database", "api"];

function initCareerCraft() {
    const inputName = document.getElementById('cvInputName');
    const inputTitle = document.getElementById('cvInputTitle');
    const inputSkills = document.getElementById('cvInputSkills');
    const inputExperience = document.getElementById('cvInputExperience');
    const btnSaveCV = document.getElementById('btnSaveCVData');

    if (!inputName || !inputTitle || !inputSkills || !inputExperience) return;

    // Load nama pengguna dari database global jika sudah diisi di pop-up awal
    if (careerData.username) {
        inputName.value = careerData.username;
    }
    
    // Fungsi Utama: Membaca input secara real-time dan merender ke kertas putih CV
    const liveUpdateCV = () => {
        // A. Render Nama & Judul
        document.getElementById('cvViewName').innerText = inputName.value.trim() || "Nama Lengkap";
        document.getElementById('cvViewTitle').innerText = inputTitle.value.trim() || "Profesi / Jabatan Target";
        
        // B. Render Pengalaman
        document.getElementById('cvViewExperience').innerText = inputExperience.value.trim() || "Rincian penjelasan proyek dan rekam jejak karyamu akan otomatis dirender di area kertas ini secara langsung.";
        
        // C. Render Keahlian berupa badge murni CSS lokal
        const skillsWadah = document.getElementById('cvViewSkills');
        skillsWadah.innerHTML = "";
        
        // Memecah teks keahlian berdasarkan tanda koma
        const skillsArr = inputSkills.value.split(',').map(s => s.trim()).filter(s => s !== "");
        
        if (skillsArr.length === 0) {
            skillsWadah.innerHTML = `<span style="color: #94A3B8; font-style: italic;">Belum ada keahlian yang ditambahkan.</span>`;
        } else {
            skillsArr.forEach(skill => {
                const badge = document.createElement('span');
                // Styling lokal kertas CV agar terlihat formal di mata juri
                badge.style.cssText = "background: #F1F5F9; color: #334155; padding: 4px 10px; border-radius: 4px; font-weight: 600; border: 1px solid #CBD5E1;";
                badge.innerText = skill;
                skillsWadah.appendChild(badge);
            });
        }

        // D. Jalankan Mesin Hitung Skor ATS
        calculateATSScore(inputSkills.value + " " + inputExperience.value);
    };

    // Pasang Event Listener Input Real-time di semua kolom form
    inputName.addEventListener('input', liveUpdateCV);
    inputTitle.addEventListener('input', liveUpdateCV);
    inputSkills.addEventListener('input', liveUpdateCV);
    inputExperience.addEventListener('input', liveUpdateCV);

    // Jalankan sekali di awal agar data langsung tersinkronisasi saat halaman dimuat
    liveUpdateCV();

    // Handler Tombol Simpan Progres Kunci Data
    if (btnSaveCV) {
        btnSaveCV.addEventListener('click', () => {
            if (inputName.value.trim()) {
                careerData.username = inputName.value.trim();
            }
            addCareerXP(15); // Bonus +15 XP karena mengelola portofolio karir profesional
            alert("Data resume dan skor ATS kamu berhasil dikunci ke penyimpanan sistem! 💼");
        });
    }
}

/* ==========================================================================
   3. ATS KEYWORD SCANNER LOGIC (Algoritma Pencocokan String)
   ========================================================================== */
function calculateATSScore(fullText) {
    const textLower = fullText.toLowerCase();
    let matches = 0;

    // Hitung berapa banyak kata kunci industri IT yang masuk ke teks resume user
    atsKeywords.forEach(keyword => {
        if (textLower.includes(keyword)) {
            matches++;
        }
    });

    // Kalkulasi persentase skor (Maksimal 100% jika menemukan minimal 5 kata kunci)
    const finalScore = Math.min(Math.round((matches / 5) * 100), 100);
    
    // Update data ke memori utama karir
    careerData.atsScore = finalScore;
    sessionStorage.setItem('zenithSessionData', JSON.stringify(careerData));
    
    // KUNCI EMAS SINKRONISASI: Set item mandiri untuk dibaca langsung oleh widget dashboard
    sessionStorage.setItem('zenithATSScore', finalScore);

    // Update elemen visual angka skor ATS di halaman karir
    const scoreDisplay = document.getElementById('atsScoreDisplay');
    if (scoreDisplay) {
        scoreDisplay.innerText = `${finalScore}%`;
        
        // Mengubah warna teks skor secara dinamis berdasarkan tinggi rendahnya skor
        if (finalScore >= 80) {
            scoreDisplay.style.color = "#10B981"; // Hijau jika aman sistem ATS
        } else if (finalScore >= 40) {
            scoreDisplay.style.color = "#F59E0B"; // Oranye jika lumayan/standar
        } else {
            scoreDisplay.style.color = "#EF4444"; // Merah jika terlalu rendah
        }
    }
    
    // Pemicu update dashboard waktu nyata saat user mengetik resume
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
}
/* ==========================================================================
   4. AUTO INITIALIZER ON LOAD (KHUSUS HALAMAN KARIR)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initCareerCraft();
});