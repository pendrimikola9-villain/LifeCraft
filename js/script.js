/* ==========================================================================
   1. GLOBAL STATE & LOCALSTORAGE ENGINE (Sesuai Kriteria Penilaian)
   ========================================================================== */
// Mengambil data dari localStorage atau set data awal jika user baru pertama kali buka
let userData = JSON.parse(localStorage.getItem('zenithUserData')) || {
    username: "Penjelajah Banua",
    xp: 0,
    level: 1,
    wallet: 0,
    atsScore: 0,
    notesCount: 0,
    lastMissionDate: "" // Untuk mengecek apakah misi hari ini sudah diambil
};

// Fungsi global untuk menyimpan setiap perubahan data ke localStorage
function saveUserData() {
    localStorage.setItem('zenithUserData', JSON.stringify(userData));
    updateDashboardUI();
}

/* ==========================================================================
   2. RESPONSIVE NAVBAR LOGIC (Hamburger Menu)
   ========================================================================== */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');

if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Animasi tombol hamburger jadi huruf 'X'
        hamburgerBtn.classList.toggle('open');
        
        // Opsional: Ubah bentuk garis hamburger murni CSS via class
        const bars = hamburgerBtn.querySelectorAll('.bar');
        if(hamburgerBtn.classList.contains('open')) {
            bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });
}

/* ==========================================================================
   3. BANJAR CODES & CULTURE DATA (Database Array Lokal)
   ========================================================================== */
const cultureMissions = [
    {
        title: "Belajar Bahasa Banjar: 'Sanggam'",
        desc: "Kata 'Sanggam' dalam Bahasa Banjar berarti kokoh, berani, atau berwibawa. Sering digunakan untuk memuji kerangka bangunan atau karakter seseorang."
    },
    {
        title: "Eksplorasi Sasirangan: Motif Bayam Raja",
        desc: "Motif Bayam Raja adalah motif tradisional Sasirangan yang melambangkan martabat, kepemimpinan, dan derajat yang tinggi seperti seorang raja."
    },
    {
        title: "Belajar Bahasa Banjar: 'Sungsung'",
        desc: "Kata 'Sungsung' artinya adalah pagi-pagi sekali atau subuh. Contoh kalimat: 'Guringan sungsung gasan tulak kuliah' (Tidur lebih awal untuk berangkat kuliah pagi)."
    },
    {
        title: "Eksplorasi Sasirangan: Motif Kulat Karikit",
        desc: "Motif Kulat Karikit terinspirasi dari jamur kecil yang hidup menempel di batang pohon, melambangkan kemandirian, ketahanan hidup, dan adaptasi."
    },
    {
        title: "Belajar Bahasa Banjar: 'Wara'",
        desc: "Kata 'Wara' dalam percakapan sehari-hari bahasa Banjar sering berarti 'hanya' atau 'saja'. Contoh: 'Satu wara' bermakna 'Cuma satu'."
    }
];

// Logika mengacak misi berdasarkan hari ini
function loadDailyMission() {
    const titleEl = document.getElementById('cultureTitle');
    const descEl = document.getElementById('cultureDesc');
    const missionBtn = document.getElementById('btnCompleteMission');
    
    if (!titleEl || !descEl || !missionBtn) return;

    // Ambil tanggal hari ini format YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);
    
    // Gunakan panjang array untuk mengacak indeks misi berdasarkan tanggal agar seragam seharian
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();
    const missionIndex = (currentYear + currentMonth + currentDate) % cultureMissions.length;
    
    const todaysMission = cultureMissions[missionIndex];
    titleEl.innerText = todaysMission.title;
    descEl.innerText = todaysMission.desc;

    // Jika user sudah menyelesaikan misi hari ini, kunci tombolnya
    if (userData.lastMissionDate === today) {
        missionBtn.innerText = "Misi Hari Ini Selesai! 🎉";
        missionBtn.disabled = true;
        missionBtn.style.background = "var(--success)";
        missionBtn.style.cursor = "not-allowed";
    } else {
        missionBtn.innerText = "Selesaikan Misi (+50 XP)";
        missionBtn.disabled = false;
        missionBtn.style.background = "var(--primary)";
        missionBtn.style.cursor = "pointer";
    }
}

/* ==========================================================================
   4. GAMIFICATION CORE ENGINE (XP, Level, & UI Updater)
   ========================================================================== */
function updateDashboardUI() {
    // Pastikan element ada di halaman sebelum diisi agar tidak memicu error JS (Sesuai Poin F.3 Lomba)
    if (document.getElementById('userName')) document.getElementById('userName').innerText = `Halo, ${userData.username}!`;
    if (document.getElementById('userLevel')) document.getElementById('userLevel').innerText = userData.level;
    if (document.getElementById('xpText')) document.getElementById('xpText').innerText = `${userData.xp} / 100 XP`;
    
    // Update progress bar
    if (document.getElementById('xpProgress')) {
        document.getElementById('xpProgress').style.width = `${userData.xp}%`;
    }

    // Update ringkasan widget data dari halaman lain
    if (document.getElementById('summaryWallet')) document.getElementById('summaryWallet').innerText = `Rp ${userData.wallet.toLocaleString('id-ID')}`;
    if (document.getElementById('summaryATS')) document.getElementById('summaryATS').innerText = `${userData.atsScore}% ATS`;
    if (document.getElementById('summaryNotes')) document.getElementById('summaryNotes').innerText = `${userData.notesCount} Catatan`;
}

// Fungsi untuk menambah XP pengguna dari aksi mana pun di website
function addXP(amount) {
    userData.xp += amount;
    
    // Logika Naik Level (Tiap 100 XP)
    if (userData.xp >= 100) {
        userData.level += 1;
        userData.xp = userData.xp - 100; // Sisa XP dibawa ke level berikutnya
        alert(`Selamat! Kamu naik ke Level ${userData.level}! 🚀`);
    }
    
    saveUserData();
}

// Event Listener Tombol Selesai Misi Budaya
const completeMissionBtn = document.getElementById('btnCompleteMission');
if (completeMissionBtn) {
    completeMissionBtn.addEventListener('click', () => {
        const today = new Date().toISOString().slice(0, 10);
        
        if (userData.lastMissionDate !== today) {
            userData.lastMissionDate = today;
            addXP(50); // Beri reward 50 XP
            loadDailyMission(); // Reload tampilan tombol
        }
    });
}

/* ==========================================================================
   5. INITIALIZER ON LOAD
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardUI();
    loadDailyMission();
});