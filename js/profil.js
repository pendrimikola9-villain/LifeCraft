/* ==========================================================================
   1. DATABASE LINK SINKRONISASI DATA SESSIONSTORAGE
   ========================================================================== */
let profileData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {
    username: "", xp: 0, level: 1, waterIntake: 0, notesCount: 0, atsScore: 0, savedFlashcards: [], savedTrips: []
};

/* ==========================================================================
   2. MATRIKS EVALUASI 5 TINGKATAN KARAKTER EMOJI BERGERAK
   ========================================================================== */
function updateCharacterEvolution() {
    const level = profileData.level || 1;
    
    const avatarContainer = document.getElementById('charAvatarContainer');
    const titleText = document.getElementById('charTitleText');
    const levelBadge = document.getElementById('charLevelBadge');
    
    if (!avatarContainer || !titleText || !levelBadge) return;

    // Default Inisialisasi Data Karakter Atas
    let emoji = "🥚";
    let title = "Beginner Explorer";
    let animationClass = "emoji-level-1";

    // Aturan Algoritma Percabangan Kondisional Evaluasi 5 Tingkat
    if (level >= 1 && level <= 2) {
        emoji = "🥚";
        title = "Beginner Explorer";
        animationClass = "emoji-level-1"; // Telur Bergetar (Wobble)
    } else if (level >= 3 && level <= 5) {
        emoji = "🐣";
        title = "Productivity Knight";
        animationClass = "emoji-level-2"; // Anak Ayam Melompat (Bounce)
    } else if (level >= 6 && level <= 7) {
        emoji = "🐥";
        title = "Code Warrior";
        animationClass = "emoji-level-3"; // Ayam Senior Goyang (Giggle)
    } else if (level >= 8 && level <= 9) {
        emoji = "🦅";
        title = "Zenith Elite";
        animationClass = "emoji-level-4"; // Elang Berdenyut (Pulse)
    } else if (level >= 10) {
        emoji = "👑🦅";
        title = "Zenith Mythic Master";
        animationClass = "emoji-level-5"; // Raja Elang Melayang (Float Glow)
    }

    // Suntikkan teks dan class animasi murni CSS ke elemen HTML
    avatarContainer.innerHTML = `<span class="${animationClass}">${emoji}</span>`;
    titleText.innerText = title;
    levelBadge.innerText = `LEVEL ${level}`;
}

/* ==========================================================================
   3. RENDER DATA STATISTIK PENCAPAIAN REAL-TIME
   ========================================================================== */
function renderStatsData() {
    // A. Hitung progres XP lingkaran kiri
    const xp = profileData.xp || 0;
    const xpText = document.getElementById('charXpText');
    const xpFill = document.getElementById('charXpFill');
    
    if (xpText) xpText.innerText = `${xp} / 100 XP`;
    if (xpFill) xpFill.style.width = `${xp}%`;

    // B. Ambil dan tampilkan statistik akumulasi aktivitas dari halaman lain
    const statsWater = document.getElementById('statsWater');
    const statsNotes = document.getElementById('statsNotes');
    const statsAts = document.getElementById('statsAts');
    const statsFlashcards = document.getElementById('statsFlashcards');
    const statsTrips = document.getElementById('statsTrips');

    if (statsWater) statsWater.innerText = `${profileData.waterIntake || 0} Gelas`;
    if (statsNotes) statsNotes.innerText = `${profileData.notesCount || 0} Catatan`;
    
    const ats = profileData.atsScore || 0;
    if (statsAts) {
        statsAts.innerText = `${ats}%`;
        // Atur warna teks skor secara dinamis
        if (ats >= 80) statsAts.style.color = "#10B981";
        else if (ats >= 40) statsAts.style.color = "#F59E0B";
        else statsAts.style.color = "#EF4444";
    }

    // Hitung panjang array data bawaan jika ada isi
    const flashcardsCount = profileData.savedFlashcards ? profileData.savedFlashcards.length : 0;
    if (statsFlashcards) statsFlashcards.innerText = `${flashcardsCount} Kartu`;

    const tripsCount = profileData.savedTrips ? profileData.savedTrips.length : 0;
    if (statsTrips) statsTrips.innerText = `${tripsCount} Destinasi`;
}

/* ==========================================================================
   4. AUTO INITIALIZER ON LOAD
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    updateCharacterEvolution();
    renderStatsData();
});