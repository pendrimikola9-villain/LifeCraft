/* ==========================================================================
   1. DATABASE LINK SINKRONISASI SESSIONSTORAGE
   ========================================================================== */
let eduData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {
    username: "", xp: 0, level: 1, waterIntake: 0, notesCount: 0, atsScore: 0, savedFlashcards: [], customQuizArray: [], lastMissionDate: ""
};

// Pastikan array kuis kustom sudah terdefinisi di memori browser
if (eduData.customQuizArray === undefined) {
    eduData.customQuizArray = [];
}

// Ambil data flashcards bawaan awal (default) jika belum ada isi di memori
if (eduData.savedFlashcards === undefined || eduData.savedFlashcards.length === 0) {
    eduData.savedFlashcards = [
        { front: "Apa fungsi localStorage di JavaScript?", back: "Menyimpan data di browser secara permanen tanpa batas kedaluwarsa." },
        { front: "Apa motif Sasirangan yang melambangkan kepemimpinan?", back: "Motif Bayam Raja (Filosofi derajat tinggi dan dihormati)." }
    ];
}

function saveEduData() {
    sessionStorage.setItem('zenithSessionData', JSON.stringify(eduData));
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
}

function addEduXP(amount) {
    eduData.xp += amount;
    if (eduData.xp >= 100) {
        eduData.level += 1;
        eduData.xp = eduData.xp - 100;
        alert(`Selamat! Kamu naik ke Level ${eduData.level}! 🚀`);
    }
    saveEduData();
}

/* ==========================================================================
   2. CUSTOM POMODORO TIMER ENGINE
   ========================================================================== */
let pomoInterval = null;
let pomoTimeLeft = 25 * 60;

const pomoTaskInput = document.getElementById('pomoTaskInput');
const pomoMinutesInput = document.getElementById('pomoMinutesInput');
const activeTaskText = document.getElementById('activeTaskText');
const timerDisplay = document.getElementById('timerDisplay');
const startPomoBtn = document.getElementById('btnStartPomo');
const resetPomoBtn = document.getElementById('btnResetPomo');

function updatePomoTimerText() {
    if (!timerDisplay) return;
    const mins = Math.floor(pomoTimeLeft / 60);
    const secs = pomoTimeLeft % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

if (startPomoBtn) {
    startPomoBtn.addEventListener('click', () => {
        if (pomoInterval !== null) return;

        const customMins = parseInt(pomoMinutesInput.value);
        const taskName = pomoTaskInput.value.trim();

        if (isNaN(customMins) || customMins <= 0 || customMins > 60) {
            alert("Silakan masukkan durasi menit belajar yang valid (1-60 Menit)!");
            return;
        }

        if (pomoTimeLeft === 25 * 60) {
            pomoTimeLeft = customMins * 60;
        }

        if (taskName && activeTaskText) {
            activeTaskText.style.display = "block";
            activeTaskText.querySelector('span').innerText = taskName;
        }

        pomoTaskInput.disabled = true;
        pomoMinutesInput.disabled = true;
        startPomoBtn.disabled = true;
        startPomoBtn.style.opacity = "0.5";

        pomoInterval = setInterval(() => {
            pomoTimeLeft--;
            updatePomoTimerText();

            if (pomoTimeLeft <= 0) {
                clearInterval(pomoInterval);
                pomoInterval = null;
                alert(`Sesi fokus selesai! Hebat kamu telah menyelesaikan target belajarmu. (+25 XP) 🎯`);
                addEduXP(25);
                resetPomoEngine();
            }
        }, 1000);
    });
}

function resetPomoEngine() {
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoTimeLeft = 25 * 60;
    
    if (pomoTaskInput) pomoTaskInput.disabled = false;
    if (pomoMinutesInput) pomoMinutesInput.disabled = false;
    if (startPomoBtn) {
        startPomoBtn.disabled = false;
        startPomoBtn.style.opacity = "1";
    }
    if (activeTaskText) activeTaskText.style.display = "none";
    
    updatePomoTimerText();
}

if (resetPomoBtn) resetPomoBtn.addEventListener('click', resetPomoEngine);

/* ==========================================================================
   3. INTERACTIVE TRIVIA QUIZ ENGINE (DENGAN REVISI KUIS KUSTOM DINAMIS)
   ========================================================================== */
const quizQuestions = {
    it: [
        { q: "Manakah yang merupakan bahasa pemrograman utama untuk membuat aplikasi mobile lintas platform dengan Flutter?", o: ["Java", "Kotlin", "Dart"], a: 2 },
        { q: "Manakah komponen dasar web yang bertugas mengatur struktur pondasi konten halaman?", o: ["HTML", "CSS", "JavaScript"], a: 0 }
    ],
    banjar: [
        { q: "Apakah arti dari kata 'Sungsung' dalam kosakata harian Bahasa Banjar?", o: ["Pagi-pagi sekali / Subuh", "Malam hari", "Lambat / Santai"], a: 0 },
        { q: "Motif kain Sasirangan yang terinspirasi dari bentuk jamur kecil adalah...", o: ["Bayam Raja", "Kulat Karikit", "Gigi Haruan"], a: 1 }
    ],
    english: [
        { q: "What is the true meaning of the English idiom 'Break a leg'?", o: ["Good luck / Wish you success", "To feel sick", "To break your bone"], a: 0 },
        { q: "Complete the sentence: 'Pendri ... developing a professional web design today.'", o: ["am", "are", "is"], a: 2 }
    ],
    custom: [] // Akan diisi dinamis dari eduData.customQuizArray
};

let currentQuizType = "";
let currentQuestionIndex = 0;

function checkCustomQuizButtonVisibility() {
    const customBtn = document.getElementById('btnCustomQuizSelect');
    if (!customBtn) return;
    
    // Jika user sudah pernah membuat kuis kustom, munculkan tombol pilihannya
    if (eduData.customQuizArray && eduData.customQuizArray.length > 0) {
        customBtn.style.display = "block";
    } else {
        customBtn.style.display = "none";
    }
}

window.startSelectedQuiz = function(type) {
    // Jika memilih kuis kustom, isi pertanyaannya dari data sessionStorage
    if (type === 'custom') {
        quizQuestions.custom = eduData.customQuizArray;
    }

    currentQuizType = type;
    currentQuestionIndex = 0;
    
    document.getElementById('quizSelectionZone').style.display = 'none';
    document.getElementById('quizPlayZone').style.display = 'block';
    
    showQuizQuestion();
}

function showQuizQuestion() {
    const qData = quizQuestions[currentQuizType][currentQuestionIndex];
    document.getElementById('quizQuestion').innerText = `${currentQuestionIndex + 1}. ${qData.q}`;
    
    const optionsWadah = document.getElementById('quizOptions');
    optionsWadah.innerHTML = "";
    
    qData.o.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.innerText = opt;
        btn.onclick = () => checkQuizAnswer(idx);
        optionsWadah.appendChild(btn);
    });
}

function checkQuizAnswer(selectedIdx) {
    const qData = quizQuestions[currentQuizType][currentQuestionIndex];
    
    if (selectedIdx === qData.a) {
        alert("Jawabanmu BENAR! Semangat (+15 XP) 🎉");
        addEduXP(15);
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
        
        // Sediakan fitur reset kuis kustom jika sudah selesai biar bisa buat baru lagi
        if (currentQuizType === 'custom' && confirm("Apakah kamu ingin mengosongkan bank soal kuis kustom ini untuk membuat soal baru?")) {
            eduData.customQuizArray = [];
            saveEduData();
            checkCustomQuizButtonVisibility();
        }
    }
}

// --- LOGIKA BARU: INPUT FORM KUIS KUSTOM DINAMIS ---
const customQuizForm = document.getElementById('customQuizForm');
if (customQuizForm) {
    customQuizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const qText = document.getElementById('cqQuestion').value.trim();
        const opt0 = document.getElementById('cqOpt0').value.trim();
        const opt1 = document.getElementById('cqOpt1').value.trim();
        const opt2 = document.getElementById('cqOpt2').value.trim();
        const answerIdx = parseInt(document.getElementById('cqAnswer').value);

        // Masukkan objek soal baru ke dalam database lokal
        eduData.customQuizArray.push({
            q: qText,
            o: [opt0, opt1, opt2],
            a: answerIdx
        });

        addEduXP(20); // Hadiah +20 XP karena berkontribusi membuat soal kuis kustom
        customQuizForm.reset();
        alert("Soal berhasil disuntikkan ke daftar kuis! Tombol '🧠 Kuis Kustom Kamu' sekarang aktif.");
        
        checkCustomQuizButtonVisibility();
    });
}

/* ==========================================================================
   4. CUSTOM FLASHCARD ENGINE
   ========================================================================== */
const flashcardForm = document.getElementById('flashcardForm');
const flashcardsGrid = document.getElementById('flashcardsGrid');

function renderFlashcards() {
    if (!flashcardsGrid) return;
    flashcardsGrid.innerHTML = "";

    eduData.savedFlashcards.forEach((fc, idx) => {
        const cardBox = document.createElement('div');
        cardBox.className = 'fc-box';
        
        cardBox.innerHTML = `
            <div class="fc-inner">
                <div class="fc-front">
                    <button onclick="deleteFlashcard(event, ${idx})" style="position: absolute; top: 8px; right: 8px; background: rgba(239,68,68,0.1); color: #EF4444; border: none; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; z-index: 10;">❌ Hapus</button>
                    <p>${escapeHTML(fc.front)}</p>
                </div>
                <div class="fc-back">
                    <p>${escapeHTML(fc.back)}</p>
                </div>
            </div>
        `;
        
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

        eduData.savedFlashcards.unshift({ front, back });
        addEduXP(5);
        flashcardForm.reset();
        renderFlashcards();
    });
}

window.deleteFlashcard = function(event, index) {
    event.stopPropagation();
    if (confirm("Hapus kartu hafalan ini?")) {
        eduData.savedFlashcards.splice(index, 1);
        saveEduData();
        renderFlashcards();
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   5. AUTO INITIALIZER ON LOAD
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    updatePomoTimerText();
    renderFlashcards();
    checkCustomQuizButtonVisibility(); // Pastikan tombol kuis kustom diperiksa saat halaman dibuka
});