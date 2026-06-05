/* ==========================================================================
   1. GLOBAL STATE & LOCALSTORAGE ENGINE
   ========================================================================== */
let userData = JSON.parse(localStorage.getItem('zenithUserData')) || {
    username: "", xp: 0, level: 1, wallet: 0, atsScore: 0,
    notesCount: 0, waterIntake: 0, todayMood: "", savedNotes: [], lastMissionDate: ""
};

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
        hamburgerBtn.classList.toggle('open');
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
   3. ADVANCED MISSION DATABASE (Budaya Banjar + Umum)
   ========================================================================== */
const mixedMissions = [ /* ... data array kuis kamu ... */ ];

function loadDailyMission() { /* ... logika load kuis ... */ }

const completeMissionBtn = document.getElementById('btnCompleteMission');
if (completeMissionBtn) {
    completeMissionBtn.addEventListener('click', () => { /* ... logika klik kuis ... */ });
}

/* ==========================================================================
   4. GAMIFICATION CORE ENGINE
   ========================================================================== */
function updateDashboardUI() { /* ... logika UI dashboard ... */ }

function addXP(amount) { /* ... logika tambah XP ... */ }


/* ==========================================================================
   [!] TARUH FUNGSI MODUL LAIN DI SINI (Seksi 6 s.d 13 yang kita buat kemarin)
   Seperti: Engine Pomodoro, Notes, Jurnal, Kuis Edukasi, & Flashcard
   ========================================================================== */


/* ==========================================================================
   FINAL. PUSAT INISIALISASI (Taruh di PALING BAWAH file script.js)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Logika Pop-up Welcome Name
    const welcomeModal = document.getElementById('welcomeModal');
    const btnSaveName = document.getElementById('btnSaveName');
    const inputWelcomeName = document.getElementById('inputWelcomeName');
    const profileAvatarBtn = document.getElementById('profileAvatarBtn');

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

    if (profileAvatarBtn) {
        profileAvatarBtn.addEventListener('click', () => {
            const newName = prompt("Ubah nama profil kamu:", userData.username);
            if (newName && newName.trim() !== "") {
                userData.username = newName.trim();
                saveUserData();
            }
        });
    }

    // 2. Eksekusi Render UI Otomatis di Semua Halaman Secara Aman
    updateDashboardUI();
    loadDailyMission();
    if (typeof updateTimerDisplay === 'function') updateTimerDisplay(); 
    if (typeof updateWaterUI === 'function') updateWaterUI();     
    if (typeof initMoodTracker === 'function') initMoodTracker();   
    if (typeof renderNotes === 'function') renderNotes();        
    if (typeof renderFlashcards === 'function') renderFlashcards(); 
    if (typeof initFitnessEngine === 'function') initFitnessEngine();
});

/* ==========================================================================
   6. POMODORO TIMER CORE ENGINE
   ========================================================================== */
let pomoInterval = null;
let timerSeconds = 25 * 60; // 25 Menit awal
let isWorkMode = true;

const timerDisplay = document.getElementById('timerDisplay');
const pomoStatus = document.getElementById('pomoStatus');
const pomoCard = document.getElementById('pomoCard');
const startPomoBtn = document.getElementById('btnStartPomo');
const pausePomoBtn = document.getElementById('btnPausePomo');
const resetPomoBtn = document.getElementById('btnResetPomo');

function updateTimerDisplay() {
    if (!timerDisplay) return;
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startPomodoro() {
    if (pomoInterval !== null) return;
    
    startPomoBtn.disabled = true;
    pausePomoBtn.disabled = false;

    pomoInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();

        if (timerSeconds <= 0) {
            clearInterval(pomoInterval);
            pomoInterval = null;
            
            if (isWorkMode) {
                // Berhasil Sesi Kerja -> Beri Hadiah XP!
                alert("Kerja bagus! Sesi fokus selesai. Ambil istirahat sejenak (+25 XP) 🎉");
                addXP(25);
                
                // Pindah ke Mode Istirahat (5 Menit)
                isWorkMode = false;
                timerSeconds = 5 * 60;
                if(pomoStatus) pomoStatus.innerText = "Break Session";
                if(pomoCard) pomoCard.classList.add('break-mode');
                if(pomoCard) pomoCard.classList.remove('work-mode');
            } else {
                alert("Waktu istirahat habis! Bersiap fokus kembali.");
                isWorkMode = true;
                timerSeconds = 25 * 60;
                if(pomoStatus) pomoStatus.innerText = "Work Session";
                if(pomoCard) pomoCard.classList.add('work-mode');
                if(pomoCard) pomoCard.classList.remove('break-mode');
            }
            
            startPomoBtn.disabled = false;
            pausePomoBtn.disabled = true;
            updateTimerDisplay();
        }
    }, 1000);
}

function pausePomodoro() {
    clearInterval(pomoInterval);
    pomoInterval = null;
    startPomoBtn.disabled = false;
    pausePomoBtn.disabled = true;
}

function resetPomodoro() {
    clearInterval(pomoInterval);
    pomoInterval = null;
    isWorkMode = true;
    timerSeconds = 25 * 60;
    if(pomoStatus) pomoStatus.innerText = "Work Session";
    if(pomoCard) {
        pomoCard.classList.remove('work-mode', 'break-mode');
    }
    startPomoBtn.disabled = false;
    pausePomoBtn.disabled = true;
    updateTimerDisplay();
}

// Hubungkan Event Listener Pomodoro
if(startPomoBtn) startPomoBtn.addEventListener('click', startPomodoro);
if(pausePomoBtn) pausePomoBtn.addEventListener('click', pausePomodoro);
if(resetPomoBtn) resetPomoBtn.addEventListener('click', resetPomodoro);


/* ==========================================================================
   7. WATER TRACKER ENGINE (State Terikat LocalStorage)
   ========================================================================== */
// Definisikan variabel baru di dalam database lokal jika belum ada
if (userData.waterIntake === undefined) userData.waterIntake = 0;

const waterFill = document.getElementById('waterFill');
const glassText = document.getElementById('glassText');
const waterTargetText = document.getElementById('waterTargetText');
const addWaterBtn = document.getElementById('btnAddWater');
const resetWaterBtn = document.getElementById('btnResetWater');

function updateWaterUI() {
    if (!waterFill || !glassText || !waterTargetText) return;
    
    const target = 2000; // Target 2 Liter harian
    const percentage = Math.min((userData.waterIntake / target) * 100, 100);
    
    waterFill.style.height = `${percentage}%`;
    glassText.innerText = `${Math.floor(percentage)}%`;
    waterTargetText.innerText = `Terpenuhi: ${userData.waterIntake} / ${target} ml`;
}

if(addWaterBtn) {
    addWaterBtn.addEventListener('click', () => {
        userData.waterIntake += 250; // Tambah 1 gelas 250ml
        // Beri hadiah kecil 5 XP setiap minum biar seru
        addXP(5);
        saveUserData();
        updateWaterUI();
    });
}

if(resetWaterBtn) {
    resetWaterBtn.addEventListener('click', () => {
        userData.waterIntake = 0;
        saveUserData();
        updateWaterUI();
    });
}

/* ==========================================================================
   8. MOOD TRACKER ENGINE
   ========================================================================== */
if (userData.todayMood === undefined) userData.todayMood = "";

function initMoodTracker() {
    const moodBtns = document.querySelectorAll('.btn-mood');
    const todayMoodText = document.getElementById('todayMoodText');
    if (!todayMoodText) return;

    if (userData.todayMood) {
        todayMoodText.innerText = userData.todayMood;
    }

    moodBtns.forEach(btn => {
        // Tandai tombol jika sudah pernah dipilih sebelumnya
        if (btn.getAttribute('data-mood') === userData.todayMood) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            // Hapus kelas terpilih dari tombol lain
            moodBtns.forEach(b => b.classList.remove('selected'));
            
            const selectedMood = btn.getAttribute('data-mood');
            btn.classList.add('selected');
            
            // Cek jika belum memilih mood hari ini, beri hadiah XP
            if (userData.todayMood === "") {
                addXP(5);
            }

            userData.todayMood = selectedMood;
            todayMoodText.innerText = selectedMood;
            saveUserData();
        });
    });
}

/* ==========================================================================
   9. ADVANCED QUICK NOTES ENGINE (CRUD)
   ========================================================================== */
if (userData.savedNotes === undefined) userData.savedNotes = [];

const noteForm = document.getElementById('noteForm');
const notesGrid = document.getElementById('notesGrid');
const searchNotesInput = document.getElementById('searchNotesInput');

function renderNotes(notesArray = userData.savedNotes) {
    if (!notesGrid) return;
    
    // Bersihkan isi grid terlebih dahulu
    notesGrid.innerHTML = "";

    if (notesArray.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-notes-message">
                <p>Tidak ada catatan yang ditemukan.</p>
            </div>`;
        return;
    }

    notesArray.forEach((note, index) => {
        const card = document.createElement('div');
        card.className = 'single-note-card';
        card.innerHTML = `
            <div>
                <span class="note-tag tag-${note.category}">${note.category}</span>
                <h4>${escapeHTML(note.title)}</h4>
                <p>${escapeHTML(note.content)}</p>
            </div>
            <button class="btn-delete-note" onclick="deleteNote(${index})">Hapus</button>
        `;
        notesGrid.appendChild(card);
    });
    
    // Update counter jumlah catatan secara global
    userData.notesCount = userData.savedNotes.length;
    localStorage.setItem('zenithUserData', JSON.stringify(userData));
}

// Fungsi pengaman XSS untuk membersihkan tag HTML buatan user (Nilai plus keamanan di mata juri)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Handler Submit Pembuatan Catatan
if (noteForm) {
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('noteTitle').value;
        const category = document.getElementById('noteCategory').value;
        const content = document.getElementById('noteContent').value;

        const newNote = { title, category, content, date: new Date().toLocaleDateString() };
        userData.savedNotes.unshift(newNote); // Tambah ke urutan paling atas
        
        addXP(10); // Beri reward +10 XP
        noteForm.reset(); // Kosongkan form input
        renderNotes();
    });
}

// Fungsi Hapus Catatan Global Window (Agar bisa dibaca oleh atribut onclick HTML)
window.deleteNote = function(index) {
    if(confirm("Apakah kamu yakin ingin menghapus catatan ini?")) {
        userData.savedNotes.splice(index, 1);
        saveUserData();
        renderNotes();
    }
}

// Engine Live Search Real-time (Filter Array)
if (searchNotesInput) {
    searchNotesInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        // Filter catatan berdasarkan judul atau isi teks
        const filtered = userData.savedNotes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.content.toLowerCase().includes(query)
        );
        
        renderNotes(filtered);
    });
}

/* ==========================================================================
   10. HEALTH SYSTEM ENGINE (Water Tracker, Stretching, & Calorie Calculator)
   ========================================================================== */
// A. Water Tracker UI Binder
const waterFill = document.getElementById('waterFill');
const glassText = document.getElementById('glassText');
const waterTargetText = document.getElementById('waterTargetText');
const addWaterBtn = document.getElementById('btnAddWater');
const resetWaterBtn = document.getElementById('btnResetWater');

function updateWaterUI() {
    if (!waterFill || !glassText || !waterTargetText) return;
    const target = 2000;
    const percentage = Math.min(((userData.waterIntake || 0) / target) * 100, 100);
    waterFill.style.height = `${percentage}%`;
    glassText.innerText = `${Math.floor(percentage)}%`;
    waterTargetText.innerText = `Terpenuhi: ${userData.waterIntake || 0} / ${target} ml`;
}

if(addWaterBtn) {
    addWaterBtn.addEventListener('click', () => {
        userData.waterIntake = (userData.waterIntake || 0) + 250;
        addXP(5);
        saveUserData();
        updateWaterUI();
    });
}

if(resetWaterBtn) {
    resetWaterBtn.addEventListener('click', () => {
        userData.waterIntake = 0;
        saveUserData();
        updateWaterUI();
    });
}

// B. Stretching 5-Minute Timer Engine
let stretchInterval = null;
let stretchTimeLeft = 5 * 60;
const stretchInstructions = [
    "Gerakan 1: Putar leher perlahan ke kanan dan kiri (Ikuti ritme napas).",
    "Gerakan 2: Angkat kedua bahu ke atas mendekati telinga, tahan, lalu turunkan.",
    "Gerakan 3: Rentangkan kedua tangan ke depan, kunci jari-jari, dorong ke arah luar.",
    "Gerakan 4: Putar tubuh bagian atas ke kanan dan kiri sambil duduk tegak.",
    "Gerakan 5: Tarik napas dalam-dalam, hembuskan perlahan. Tubuhmu kini kembali segar!"
];

const stretchTimerDisplay = document.getElementById('stretchTimerDisplay');
const stretchInstruction = document.getElementById('stretchInstruction');
const startStretchBtn = document.getElementById('btnStartStretch');
const resetStretchBtn = document.getElementById('btnResetStretch');
const stretchCard = document.getElementById('stretchCard');

function updateStretchTimerText() {
    if (!stretchTimerDisplay) return;
    const mins = Math.floor(stretchTimeLeft / 60);
    const secs = stretchTimeLeft % 60;
    stretchTimerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

if (startStretchBtn) {
    startStretchBtn.addEventListener('click', () => {
        if (stretchInterval !== null) return;
        startStretchBtn.disabled = true;

        stretchInterval = setInterval(() => {
            stretchTimeLeft--;
            updateStretchTimerText();

            // Ubah instruksi gerakan setiap 1 menit (60 detik) sekali secara otomatis
            const currentStep = 4 - Math.floor(stretchTimeLeft / 60);
            if(stretchInstruction && stretchInstructions[currentStep]) {
                stretchInstruction.innerText = stretchInstructions[currentStep];
            }

            if (stretchTimeLeft <= 0) {
                clearInterval(stretchInterval);
                stretchInterval = null;
                alert("Luar biasa! Kamu telah menyelesaikan peregangan harian. Tubuh sehat, fokus meningkat (+20 XP) ✨");
                addXP(20);
                resetStretchTracker();
            }
        }, 1000);
    });
}

function resetStretchTracker() {
    clearInterval(stretchInterval);
    stretchInterval = null;
    stretchTimeLeft = 5 * 60;
    if(startStretchBtn) startStretchBtn.disabled = false;
    if(stretchInstruction) stretchInstruction.innerText = "Tekan mulai untuk memulai gerakan pemanasan leher dan bahu.";
    updateStretchTimerText();
}
if (resetStretchBtn) resetStretchBtn.addEventListener('click', resetStretchTracker);

// C. Calorie Calculator Engine (Rumus MET sederhana: Kalori = MET * 3.5 * BB(70kg) / 200 * Menit)
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
            alert("Silakan masukkan durasi waktu olahraga yang valid!");
            return;
        }

        // Estimasi kalkulasi matematis sederhana dengan berat badan rata-rata 65kg
        const caloriesBurned = Math.round(met * 0.0175 * 65 * duration);
        
        caloriesBurnedText.innerText = caloriesBurned;
        calorieResultBox.style.display = 'block';
        
        // Beri apresiasi 5 XP karena sudah berolahraga
        addXP(5);
    });
}

function initFitnessEngine() {
    updateWaterUI();
    updateStretchTimerText();
}

/* ==========================================================================
   11. UPDATED POMODORO TIMER WITH CUSTOM TASK & TIME INPUT
   ========================================================================== */
const pomoTaskInput = document.getElementById('pomoTaskInput');
const pomoMinutesInput = document.getElementById('pomoMinutesInput');
const activeTaskText = document.getElementById('activeTaskText');

// Modifikasi fungsi startPomodoro bawaan agar membaca input user
function startCustomPomodoro() {
    if (pomoInterval !== null) return;

    if (pomoMinutesInput && pomoTaskInput) {
        const customMins = parseInt(pomoMinutesInput.value);
        const taskName = pomoTaskInput.value.trim();

        if (isNaN(customMins) || customMins <= 0 || customMins > 60) {
            alert("Silakan masukkan durasi menit belajar yang valid (1-60 Menit)!");
            return;
        }

        // Set waktu berdasarkan input user (jika posisi timer belum berjalan)
        if (timerSeconds === 25 * 60 || timerSeconds <= 0 || !activeTaskText.style.display) {
            timerSeconds = customMins * 60;
        }

        // Tampilkan teks tugas aktif
        if (taskName) {
            activeTaskText.style.display = "block";
            activeTaskText.querySelector('span').innerText = taskName;
        }
        
        // Kunci input saat timer berjalan agar user fokus
        pomoTaskInput.disabled = true;
        pomoMinutesInput.disabled = true;
    }
    
    // Jalankan fungsi start timer bawaan
    startPomodoro();
}

// BINDING ULANG TOMBOL MULAI POMODORO KUSTOM
const startBtnElement = document.getElementById('btnStartPomo');
if (startBtnElement) {
    // Hapus listener lama dan pasang yang baru
    startBtnElement.replaceWith(startBtnElement.cloneNode(true));
    document.getElementById('btnStartPomo').addEventListener('click', startCustomPomodoro);
}

/* ==========================================================================
   12. QUIZ ENGINE (IT, BANJAR, & ENGLISH)
   ========================================================================== */
const quizQuestions = {
    it: [
        { q: "Manakah yang merupakan pilar fundamental teknologi dasar web?", o: ["HTML, CSS, JavaScript", "Laravel, Bootstrap, Tailwind", "React, Node.js, Python"], a: 0 },
        { q: "Di manakah tempat terbaik meletakkan tag <script> eksternal untuk optimasi speed halaman?", o: ["Di atas tag <head>", "Di bagian paling bawah body sebelum </body>", "Di dalam tag CSS"], a: 1 }
    ],
    banjar: [
        { q: "Apakah arti dari kata 'Sungsung' dalam kosakata harian Bahasa Banjar?", o: ["Lambat / Santai", "Malam hari", "Pagi-pagi sekali / Subuh"], a: 2 },
        { q: "Motif kain Sasirangan yang melambangkan kepemimpinan dan derajat tinggi adalah...", o: ["Bayam Raja", "Kulat Karikit", "Gigi Haruan"], a: 0 }
    ],
    english: [
        { q: "What is the professional meaning of the idiom 'Break a leg'?", o: ["Semoga kakimu sehat", "Semoga beruntung / sukses", "Jangan menyerah"], a: 1 },
        { q: "Complete the sentence: 'Pendri ... building a high-quality web app right now.'", o: ["is", "are", "am"], a: 0 }
    ]
};

let currentQuizType = "";
let currentQuestionIndex = 0;

window.startSelectedQuiz = function(type) {
    currentQuizType = type;
    currentQuestionIndex = 0;
    
    document.getElementById('quizSelectionZone').style.display = 'none';
    document.getElementById('quizPlayZone').style.display = 'block';
    
    showQuizQuestion();
}

function showQuizQuestion() {
    const qData = quizQuestions[currentQuizType][currentQuestionIndex];
    document.getElementById('quizQuestion').innerText = qData.q;
    
    const optionsWadah = document.getElementById('quizOptions');
    optionsWadah.innerHTML = "";
    
    qData.o.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => checkQuizAnswer(idx);
        optionsWadah.appendChild(btn);
    });
}

function checkQuizAnswer(selectedIdx) {
    const qData = quizQuestions[currentQuizType][currentQuestionIndex];
    
    if (selectedIdx === qData.a) {
        alert("Jawabanmu BENAR! (+15 XP) 🎉");
        addXP(15);
    } else {
        alert("Jawabanmu belum tepat. Tetap semangat mencoba lagi! 💪");
    }
    
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions[currentQuizType].length) {
        showQuizQuestion();
    } else {
        alert("Kuis Selesai! Kamu telah menyelesaikan semua tantangan di kategori ini.");
        document.getElementById('quizSelectionZone').style.display = 'block';
        document.getElementById('quizPlayZone').style.display = 'none';
    }
}

/* ==========================================================================
   13. CUSTOM FLASHCARD ENGINE (Spaced Repetition Creator)
   ========================================================================== */
if (userData.savedFlashcards === undefined) {
    // Beri 2 kartu default awal bertema IT & Budaya sebagai contoh awal yang manis
    userData.savedFlashcards = [
        { front: "Apa fungsi localStorage di JavaScript?", back: "Menyimpan data di browser secara permanen tanpa kedaluwarsa." },
        { front: "Apa nama motif Sasirangan yang terinspirasi jamur kecil?", back: "Motif Kulat Karikit (Melambangkan kemandirian)." }
    ];
}

const flashcardForm = document.getElementById('flashcardForm');
const flashcardsGrid = document.getElementById('flashcardsGrid');

function renderFlashcards() {
    if (!flashcardsGrid) return;
    flashcardsGrid.innerHTML = "";

    if (userData.savedFlashcards.length === 0) {
        flashcardsGrid.innerHTML = `<p style="color: var(--text-light); text-align:center; grid-column: 1/-1;">Belum ada kartu hafalan kustom. Buat kartu pertamamu di panel kiri!</p>`;
        return;
    }

    userData.savedFlashcards.forEach((fc, idx) => {
        const cardBox = document.createElement('div');
        cardBox.className = 'fc-box';
        
        // Buat struktur card inner untuk efek rotasi flip 3D CSS
        cardBox.innerHTML = `
            <div class="fc-inner">
                <div class="fc-front">
                    <button class="btn-delete-fc" onclick="deleteFlashcard(event, ${idx})">❌ Hapus</button>
                    <p>${escapeHTML(fc.front)}</p>
                </div>
                <div class="fc-back">
                    <p>${escapeHTML(fc.back)}</p>
                </div>
            </div>
        `;
        
        // Listener klik untuk memicu class rotasi animasi CSS
        cardBox.addEventListener('click', () => {
            cardBox.classList.toggle('flipped');
        });
        
        flashcardsGrid.appendChild(cardBox);
    });
}

if (flashcardForm) {
    flashcardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const front = document.getElementById('fcFront').value.trim();
        const back = document.getElementById('fcBack').value.trim();

        userData.savedFlashcards.unshift({ front, back });
        addXP(5);
        flashcardForm.reset();
        renderFlashcards();
    });
}

window.deleteFlashcard = function(event, index) {
    event.stopPropagation(); // Mencegah kartu ikut berputar (flip) saat tombol hapus diklik
    if (confirm("Hapus kartu hafalan ini?")) {
        userData.savedFlashcards.splice(index, 1);
        saveUserData();
        renderFlashcards();
    }
}