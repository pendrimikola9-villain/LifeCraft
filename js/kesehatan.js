/* ==========================================================================
   1. DATABASE LINK SINKRONISASI SESSIONSTORAGE
   ========================================================================== */
// Mengambil data dari script.js utama agar sinkron tingkat level dan datanya
let healthData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {
    username: "", xp: 0, level: 1, waterIntake: 0, notesCount: 0, atsScore: 0, lastMissionDate: ""
};

function saveHealthData() {
    sessionStorage.setItem('zenithSessionData', JSON.stringify(healthData));
    // Jika ada fungsi update UI dashboard di halaman ini (dipanggil via script.js global)
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
}

// Fungsi pembantu menambah XP secara mandiri di halaman kesehatan
function addHealthXP(amount) {
    healthData.xp += amount;
    if (healthData.xp >= 100) {
        healthData.level += 1;
        healthData.xp = healthData.xp - 100;
        alert(`Selamat! Kamu naik ke Level ${healthData.level}! 🚀`);
    }
    saveHealthData();
}

/* ==========================================================================
   2. INTERACTIVE WATER TRACKER ENGINE
   ========================================================================== */
const waterFill = document.getElementById('waterFill');
const glassText = document.getElementById('glassText');
const waterTargetText = document.getElementById('waterTargetText');
const addWaterBtn = document.getElementById('btnAddWater');
const resetWaterBtn = document.getElementById('btnResetWater');

function updateWaterUI() {
    if (!waterFill || !glassText || !waterTargetText) return;
    
    const target = 2000; // Target 2 Liter
    const currentIntake = healthData.waterIntake || 0;
    const percentage = Math.min((currentIntake / target) * 100, 100);
    
    // Animasi menaikkan tinggi air murni CSS
    waterFill.style.height = `${percentage}%`;
    glassText.innerText = `${Math.floor(percentage)}%`;
    waterTargetText.innerText = `Terpenuhi: ${currentIntake} / ${target} ml`;
}

if (addWaterBtn) {
    addWaterBtn.addEventListener('click', () => {
        healthData.waterIntake = (healthData.waterIntake || 0) + 250; // Tambah 1 gelas
        addHealthXP(5); // Reward +5 XP
        updateWaterUI();
    });
}

if (resetWaterBtn) {
    resetWaterBtn.addEventListener('click', () => {
        healthData.waterIntake = 0;
        saveHealthData();
        updateWaterUI();
    });
}

/* ==========================================================================
   3. DESK STRETCHING TIMER ENGINE (OLAHRAGA LAPTOP)
   ========================================================================== */
let stretchInterval = null;
let stretchTimeLeft = 5 * 60; // 5 Menit

// Daftar urutan gerakan otomatis yang akan berganti tiap menit
const stretchSteps = [
    "Gerakan 1: Putar leher perlahan ke kanan dan kiri (Ikuti ritme napas).",
    "Gerakan 2: Angkat kedua bahu ke atas mendekati telinga, tahan, lalu turunkan.",
    "Gerakan 3: Rentangkan kedua tangan ke depan, kunci jari-jari, dorong ke luar.",
    "Gerakan 4: Pejamkan mata rapat-rapat selama 5 detik, lalu buka lebar (Relaksasi saraf mata).",
    "Gerakan 5: Tarik napas dalam-dalam dari hidung, hembuskan perlahan lewat mulut. Selesai!"
];

const stretchTimerDisplay = document.getElementById('stretchTimerDisplay');
const stretchInstruction = document.getElementById('stretchInstruction');
const startStretchBtn = document.getElementById('btnStartStretch');
const resetStretchBtn = document.getElementById('btnResetStretch');

function updateStretchTimerText() {
    if (!stretchTimerDisplay) return;
    const mins = Math.floor(stretchTimeLeft / 60);
    const secs = stretchTimeLeft % 60;
    stretchTimerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

if (startStretchBtn) {
    startStretchBtn.addEventListener('click', () => {
        if (stretchInterval !== null) return; // Mencegah klik ganda merusak timer
        startStretchBtn.disabled = true;
        startStretchBtn.style.opacity = "0.5";

        stretchInterval = setInterval(() => {
            stretchTimeLeft--;
            updateStretchTimerText();

            // Ubah instruksi gerakan secara otomatis setiap 60 detik sekali
            const stepIndex = 4 - Math.floor(stretchTimeLeft / 60);
            if (stretchInstruction && stretchSteps[stepIndex]) {
                stretchInstruction.innerText = stretchSteps[stepIndex];
            }

            // Kondisi jika waktu peregangan habis
            if (stretchTimeLeft <= 0) {
                clearInterval(stretchInterval);
                stretchInterval = null;
                alert("Luar biasa! Peregangan selesai. Tubuh segar kembali! (+20 XP) ✨");
                addHealthXP(20);
                resetStretchEngine();
            }
        }, 1000);
    });
}

function resetStretchEngine() {
    clearInterval(stretchInterval);
    stretchInterval = null;
    stretchTimeLeft = 5 * 60;
    if (startStretchBtn) {
        startStretchBtn.disabled = false;
        startStretchBtn.style.opacity = "1";
    }
    if (stretchInstruction) {
        stretchInstruction.innerText = "Tekan tombol mulai untuk memulai pemanasan leher, bahu, dan mata.";
    }
    updateStretchTimerText();
}

if (resetStretchBtn) resetStretchBtn.addEventListener('click', resetStretchEngine);

/* ==========================================================================
   4. INTERACTIVE CALORIE BURNED CALCULATOR
   ========================================================================== */
const btnCalcCalorie = document.getElementById('btnCalcCalorie');
const workoutType = document.getElementById('workoutType');
const workoutDuration = document.getElementById('workoutDuration');
const calorieResultBox = document.getElementById('calorieResultBox');
const caloriesBurnedText = document.getElementById('caloriesBurnedText');

if (btnCalcCalorie && workoutType && workoutDuration && calorieResultBox && caloriesBurnedText) {
    btnCalcCalorie.addEventListener('click', () => {
        const met = parseFloat(workoutType.value);
        const duration = parseInt(workoutDuration.value);
        
        if (!duration || duration <= 0) {
            alert("Silakan masukkan jumlah durasi menit yang valid!");
            return;
        }

        // Rumus MET Olahraga Ringan skala Berat Badan Rata-rata 65kg
        const finalCalories = Math.round(met * 0.0175 * 65 * duration);
        
        caloriesBurnedText.innerText = finalCalories;
        calorieResultBox.style.display = 'block'; // Munculkan kotak hasil
        
        addHealthXP(5); // Beri bonus +5 XP karena sudah berolahraga
    });
}

/* ==========================================================================
   5. AUTO INITIALIZER ON LOAD (KHUSUS HALAMAN KESEHATAN)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    updateWaterUI();
    updateStretchTimerText();
});