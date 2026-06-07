/* ==========================================================================
   1. CORE DATABASE (Menggunakan sessionStorage agar Pop-Up muncul tiap refresh)
   ========================================================================== */
let userData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {
    username: "",
    xp: 0,
    level: 1,
    waterIntake: 0,
    notesCount: 0,
    atsScore: 0,
    lastMissionDate: ""
};

function saveUserData() {
    sessionStorage.setItem('zenithSessionData', JSON.stringify(userData));
    updateDashboardUI();
}

/* ==========================================================================
   2. MOBILE NAV RESPONSIVE (Hamburger Menu)
   ========================================================================== */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');

if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburgerBtn.classList.toggle('open');
    });
}

/* ==========================================================================
   3. SYSTEM MISI HARIAN (Budaya Banjar & Umum)
   ========================================================================== */
const mixedMissions = [
    {
        type: "Budaya Lokal",
        badgeColor: "#F59E0B",
        title: "Kearifan Lokal Banjar: Kain Sasirangan",
        desc: "Kain Sasirangan awalnya digunakan sebagai kain pamular (penyembuh penyakit) bagi suku Banjar. Ragam motifnya melambangkan kedalaman filosofi alam."
    },
    {
        type: "Pengetahuan Umum / IT",
        badgeColor: "#4F46E5",
        title: "Logika Pemrograman: Mengenal Clean Code",
        desc: "Clean Code adalah prinsip penulisan kode yang rapi dan mudah dibaca. Memisahkan file HTML, CSS, dan JS adalah salah satu langkah utamanya."
    }
];

function loadDailyMission() {
    const titleEl = document.getElementById('cultureTitle');
    const descEl = document.getElementById('cultureDesc');
    const badgeEl = document.getElementById('missionBadge');
    const missionBtn = document.getElementById('btnCompleteMission');
    
    if (!titleEl || !descEl || !missionBtn) return;

    // Ambil misi berdasarkan hari ini
    const dateNum = new Date().getDate();
    const missionIndex = dateNum % mixedMissions.length;
    
    const todaysMission = mixedMissions[missionIndex];
    titleEl.innerText = todaysMission.title;
    descEl.innerText = todaysMission.desc;
    
    if (badgeEl) {
        badgeEl.innerText = todaysMission.type;
        badgeEl.style.color = todaysMission.badgeColor;
        badgeEl.style.backgroundColor = `${todaysMission.badgeColor}1A`;
    }

    // Cek apakah misi sudah diklik di sesi ini
    if (userData.lastMissionDate === "done") {
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

const completeMissionBtn = document.getElementById('btnCompleteMission');
if (completeMissionBtn) {
    completeMissionBtn.addEventListener('click', () => {
        if (userData.lastMissionDate !== "done") {
            userData.lastMissionDate = "done";
            addXP(50);
            loadDailyMission();
        }
    });
}

/* ==========================================================================
   4. ENGINE LEVEL & REWARD XP (INTEGRASI REAL-TIME AVATAR)
   ========================================================================== */
function updateDashboardUI() {
    // A. Update Teks Nama dan Level Atas
    if (document.getElementById('userName')) {
        document.getElementById('userName').innerText = userData.username ? `Halo, ${userData.username}!` : "Halo, Penjelajah!";
    }
    if (document.getElementById('userLevel')) document.getElementById('userLevel').innerText = userData.level;
    if (document.getElementById('xpText')) document.getElementById('xpText').innerText = `${userData.xp} / 100 XP`;
    if (document.getElementById('xpProgress')) document.getElementById('xpProgress').style.width = `${userData.xp}%`;

    // B. Update Data Ringkasan di Widget Kanan Dashboard
    if (document.getElementById('summaryWater')) document.getElementById('summaryWater').innerText = `${userData.waterIntake || 0} ml`;
    if (document.getElementById('summaryNotes')) document.getElementById('summaryNotes').innerText = `${userData.notesCount || 0} Catatan`;
    if (document.getElementById('summaryATS')) document.getElementById('summaryATS').innerText = `${userData.atsScore || 0}% ATS`;

    // C. FIX LOGIKA: EVOLUSI AVATAR REAL-TIME DI DASHBOARD
    const dashboardAvatarBtn = document.getElementById('profileAvatarBtn');
    if (dashboardAvatarBtn) {
        const currentLevel = userData.level || 1; // FIX: Menggunakan userData, bukan dashboardData
        let currentEmoji = "🥚";
        let currentAnimClass = "emoji-level-1";

        // Percabangan 5 tingkat sesuai aturan file profil.js
        if (currentLevel >= 1 && currentLevel <= 2) {
            currentEmoji = "🥚";
            currentAnimClass = "emoji-level-1";
        } else if (currentLevel >= 3 && currentLevel <= 5) {
            currentEmoji = "🐣";
            currentAnimClass = "emoji-level-2";
        } else if (currentLevel >= 6 && currentLevel <= 7) {
            currentEmoji = "🐥";
            currentAnimClass = "emoji-level-3";
        } else if (currentLevel >= 8 && currentLevel <= 9) {
            currentEmoji = "🦅";
            currentAnimClass = "emoji-level-4";
        } else if (currentLevel >= 10) {
            currentEmoji = "👑🦅";
            currentAnimClass = "emoji-level-5";
        }

        // Terapkan perubahan kelas animasi dan icon emoji secara dinamis
        dashboardAvatarBtn.className = "profile-avatar " + currentAnimClass;
        dashboardAvatarBtn.innerText = currentEmoji;
    }
}

function addXP(amount) {
    userData.xp += amount;
    if (userData.xp >= 100) {
        userData.level += 1;
        userData.xp = userData.xp - 100;
        alert(`Selamat! Kamu naik ke Level ${userData.level}! 🚀`);
    }
    saveUserData();
}

/* ==========================================================================
   5. PUSAT INITIALIZER DOM
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const welcomeModal = document.getElementById('welcomeModal');
    const btnSaveName = document.getElementById('btnSaveName');
    const inputWelcomeName = document.getElementById('inputWelcomeName');

    // Cek pop-up nama berdasarkan session browser
    if (!userData.username) {
        if (welcomeModal) welcomeModal.style.display = 'flex';
    } else {
        if (welcomeModal) welcomeModal.style.display = 'none';
    }

    if (btnSaveName && inputWelcomeName) {
        btnSaveName.addEventListener('click', () => {
            const nameInput = inputWelcomeName.value.trim();
            if (nameInput) {
                userData.username = nameInput;
                saveUserData();
                if (welcomeModal) welcomeModal.style.display = 'none';
            } else {
                alert("Silakan masukkan nama kamu terlebih dahulu!");
            }
        });
    }

    // Jalankan pembaruan data dan misi harian saat halaman dimuat
    updateDashboardUI();
    loadDailyMission();
});

// ==========================================================================
    // KEMBALIKAN: LOGIKA GLOBAL DARK/LIGHT MODE SYSTEM (MURNI TANPA TRANSLATE)
    // ==========================================================================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    if (sessionStorage.getItem('themeMode') === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.innerText = '🌙';
    } else {
        document.body.classList.remove('dark-mode');
        if (themeToggleBtn) themeToggleBtn.innerText = '☀️';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                sessionStorage.setItem('themeMode', 'dark');
                themeToggleBtn.innerText = '🌙';
            } else {
                sessionStorage.setItem('themeMode', 'light');
                themeToggleBtn.innerText = '☀️';
            }
        });
    }

    // ==========================================================================
    // ==========================================================================
    // LOGIKA GLOBAL MULTI-LANGUAGE SYSTEM (TARGETING SPAN TEXT - ANTI BENTROK)
    // ==========================================================================
    const langSelect = document.getElementById('langSelect');

    const translations = {
        id: {
            navDashboard: "Dashboard",
            navKesehatan: "Kesehatan",
            navJurnal: "Jurnal",
            navEdukasi: "Edukasi",
            navKarir: "Karir",
            navKeuangan: "Keuangan",
            navTravel: "Travel"
        },
        en: {
            navDashboard: "Dashboard",
            navKesehatan: "Health",
            navJurnal: "Sanctuary",
            navEdukasi: "EduInnova",
            navKarir: "CareerCraft",
            navKeuangan: "WealthLab",
            navTravel: "Wanderlust"
        }
    };

    function applyLanguage(lang) {
        // JavaScript akan mendeteksi isi tag span khusus nav-text
        const navTexts = document.querySelectorAll('.nav-menu .nav-text');
        
        if (navTexts.length >= 7) {
            // Mengubah isi text di dalam span tanpa merusak element luar (.nav-link) maupun animasi ungunya!
            navTexts[0].innerText = translations[lang].navDashboard;
            navTexts[1].innerText = translations[lang].navKesehatan;
            navTexts[2].innerText = translations[lang].navJurnal;
            navTexts[3].innerText = translations[lang].navEdukasi;
            navTexts[4].innerText = translations[lang].navKarir;
            navTexts[5].innerText = translations[lang].navKeuangan;
            navTexts[6].innerText = translations[lang].navTravel;
        }
    }

    // Ambil preferensi bahasa yang tersimpan di memori browser juri
    const savedLang = sessionStorage.getItem('appLanguage') || 'id';
    
    // Berikan jeda sangat singkat agar DOM HTML terbaca sempurna oleh browser
    setTimeout(() => {
        if (langSelect) langSelect.value = savedLang;
        applyLanguage(savedLang);
    }, 50);

    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            sessionStorage.setItem('appLanguage', selectedLang);
            applyLanguage(selectedLang);
        });
    }