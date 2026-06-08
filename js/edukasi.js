document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. ENGINE UPGRADE POMODORO (AUTO-BREAK + SYNTH AUDIO ALARM & INSTRUMEN)
    // ==========================================================================
    let timerInterval = null;
    let totalSeconds = 25 * 60;
    let isRunning = false;
    let currentMode = "fokus"; 

    const timerDisplay = document.getElementById('timerDisplay');
    const btnStartPomo = document.getElementById('btnStartPomo');
    const btnResetPomo = document.getElementById('btnResetPomo');
    const pomoMinutesInput = document.getElementById('pomoMinutesInput');
    const pomoTaskInput = document.getElementById('pomoTaskInput');
    const activeTaskText = document.getElementById('activeTaskText');
    const pomoSessionStatus = document.getElementById('pomoSessionStatus');

    let audioCtx = null;
    let instrumentInterval = null;

    function playLocalBellSound() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 1);
    }

    function startSynthInstruments() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        instrumentInterval = setInterval(() => {
            if (currentMode !== "istirahat") return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            const notes = [261.63, 329.63, 392.00, 523.25]; 
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            
            osc.frequency.setValueAtTime(randomNote, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 1.5);
        }, 2000);
    }

    function stopSynthInstruments() {
        if (instrumentInterval) {
            clearInterval(instrumentInterval);
            instrumentInterval = null;
        }
    }

    function updateTimerUI() {
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
    }

    function switchPomodoroMode() {
        if (currentMode === "fokus") {
            currentMode = "istirahat";
            totalSeconds = 5 * 60; 
            pomoSessionStatus.innerText = "☕ MODE ISTIRAHAT";
            pomoSessionStatus.style.cssText = "font-size:11px; font-weight:800; padding:2px 8px; border-radius:4px; background:rgba(59,130,246,0.1); color:#3b82f6;";
            
            playLocalBellSound();
            startSynthInstruments(); 
            alert("Sesi Fokus Selesai! Kerja bagus, Pendri. Waktunya istirahat 5 menit (Musik instrumen menyala) ☕");
        } else {
            currentMode = "fokus";
            totalSeconds = (parseInt(pomoMinutesInput.value) || 25) * 60;
            pomoSessionStatus.innerText = "💻 MODE FOKUS";
            pomoSessionStatus.style.cssText = "font-size:11px; font-weight:800; padding:2px 8px; border-radius:4px; background:rgba(16,185,129,0.1); color:#10b981;";
            
            playLocalBellSound();
            stopSynthInstruments(); 
            alert("Waktu istirahat habis! Yuk, fokus kembali koding dan belajar 🚀");
        }
        updateTimerUI();
    }

    if (btnStartPomo) {
        btnStartPomo.addEventListener('click', () => {
            if (isRunning) {
                clearInterval(timerInterval);
                btnStartPomo.innerText = "Lanjut";
                isRunning = false;
                stopSynthInstruments();
            } else {
                isRunning = true;
                btnStartPomo.innerText = "Pause";
                
                if (pomoTaskInput && pomoTaskInput.value.trim() !== "" && currentMode === "fokus") {
                    activeTaskText.style.display = "block";
                    activeTaskText.querySelector('span').innerText = pomoTaskInput.value.trim();
                }

                if (currentMode === "istirahat") startSynthInstruments();

                timerInterval = setInterval(() => {
                    if (totalSeconds > 0) {
                        totalSeconds--;
                        updateTimerUI();
                    } else {
                        clearInterval(timerInterval);
                        isRunning = false;
                        btnStartPomo.innerText = "Mulai";
                        switchPomodoroMode();
                    }
                }, 1000);
            }
        });
    }

    if (btnResetPomo) {
        btnResetPomo.addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
            currentMode = "fokus";
            totalSeconds = (parseInt(pomoMinutesInput.value) || 25) * 60;
            btnStartPomo.innerText = "Mulai";
            if (activeTaskText) activeTaskText.style.display = "none";
            pomoSessionStatus.innerText = "💻 MODE FOKUS";
            pomoSessionStatus.style.cssText = "font-size:11px; font-weight:800; padding:2px 8px; border-radius:4px; background:rgba(16,185,129,0.1); color:#10b981;";
            stopSynthInstruments();
            updateTimerUI();
        });
    }

    // ==========================================================================
    // 2. ENGINE INTERACTIVE TRIVIA KUIS (BAWAAN SINKRONISASI XP)
    // ==========================================================================
    const staticQuizzes = {
        it: [
            { q: "Manakah yang merupakan framework PHP untuk backend?", o: ["Laravel", "Flutter", "Bootstrap"], a: 0 },
            { q: "Apa kepanjangan dari singkatan bahasa tag HTML?", o: ["Hyper Link Text Markup", "Hypertext Markup Language", "Home Tool Markup"], a: 1 }
        ],
        banjar: [
            { q: "Rumah adat tradisional khas suku Banjar adalah?", o: ["Bubungan Tinggi", "Joglo", "Gadang"], a: 0 },
            { q: "Pasar terapung yang terkenal di kota Banjarmasin terletak di?", o: ["Pantai Batakan", "Lok Baintan", "Kandangan"], a: 1 }
        ],
        english: [
            { q: "What is the past tense form of the verb 'Write'?", o: ["Written", "Wrote", "Writing"], a: 1 }
        ]
    };

    let activeQuizData = [];
    let currentQuizIdx = 0;

    window.startSelectedQuiz = function(category) {
        const playZone = document.getElementById('quizPlayZone');
        if (!playZone) return;

        if (category === 'custom') {
            activeQuizData = JSON.parse(sessionStorage.getItem('zenithCustomQuizzes')) || [];
        } else {
            activeQuizData = staticQuizzes[category] || [];
        }

        if (activeQuizData.length === 0) {
            alert('Belum ada bank kuis yang tersedia untuk kelompok ini!');
            return;
        }

        currentQuizIdx = 0;
        playZone.style.display = 'block';
        showQuizQuestion();
    };

    function showQuizQuestion() {
        const qText = document.getElementById('quizQuestion');
        const qOptions = document.getElementById('quizOptions');
        
        if (currentQuizIdx >= activeQuizData.length) {
            alert('Luar biasa! Kamu berhasil menuntaskan seluruh tantangan trivia kuis ini! 🎉');
            document.getElementById('quizPlayZone').style.display = 'none';
            return;
        }

        const data = activeQuizData[currentQuizIdx];
        qText.innerText = `${currentQuizIdx + 1}. ${data.q}`;
        qOptions.innerHTML = '';

        data.o.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = "btn-primary";
            btn.style.cssText = "background:var(--bg-main); color:var(--text-dark); border:1px solid var(--border-color); text-align:left; box-shadow:none; padding:12px;";
            btn.innerText = opt;
            
            btn.addEventListener('click', () => {
                if (idx === data.a) {
                    alert('Jawabanmu BENAR! (+5 XP) 🧠');
                    addEduGlobalXP(5);
                } else {
                    alert('Jawaban kurang tepat. Coba baca modul lagi! ❌');
                }
                currentQuizIdx++;
                showQuizQuestion();
            });
            qOptions.appendChild(btn);
        });
    }

    const customQuizForm = document.getElementById('customQuizForm');
    if (customQuizForm) {
        customQuizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = document.getElementById('cqQuestion').value.trim();
            const o0 = document.getElementById('cqOpt0').value.trim();
            const o1 = document.getElementById('cqOpt1').value.trim();
            const o2 = document.getElementById('cqOpt2').value.trim();
            const a = parseInt(document.getElementById('cqAnswer').value);

            let customList = JSON.parse(sessionStorage.getItem('zenithCustomQuizzes')) || [];
            customList.push({ q, o: [o0, o1, o2], a });
            sessionStorage.setItem('zenithCustomQuizzes', JSON.stringify(customList));

            const btnCust = document.getElementById('btnCustomQuizSelect');
            if (btnCust) btnCust.style.display = 'inline-block';
            customQuizForm.reset();
            
            alert('Soal kuis baru berhasil ditambahkan! (+20 XP) 🧠');
            addEduGlobalXP(20);
        });
    }

    if (JSON.parse(sessionStorage.getItem('zenithCustomQuizzes'))) {
        const btnCust = document.getElementById('btnCustomQuizSelect');
        if (btnCust) btnCust.style.display = 'inline-block';
    }

    // ==========================================================================
    // 3. ENGINE FLASHCARD MEMORIZATION (INTERAKTIF FLIP CATATAN)
    // ==========================================================================
    const flashcardForm = document.getElementById('flashcardForm');
    const flashcardsGrid = document.getElementById('flashcardsGrid');

    function renderFlashcards() {
        if (!flashcardsGrid) return;
        let fcList = JSON.parse(sessionStorage.getItem('zenithFlashcards')) || [
            { f: "Apa kepanjangan dari singkatan ATS?", b: "Applicant Tracking System (Sistem Penyaring Karyawan Otomatis)" }
        ];

        flashcardsGrid.innerHTML = '';
        fcList.forEach((fc) => {
            const card = document.createElement('div');
            card.style.cssText = "background:var(--bg-navbar); border:1px solid var(--border-color); border-radius:var(--radius-md); height:120px; display:flex; justify-content:center; align-items:center; padding:16px; cursor:pointer; text-align:center; font-weight:700; color:var(--text-dark); transition:transform 0.3s ease; box-shadow:var(--shadow-sm); font-size:13px; user-select:none;";
            card.innerText = fc.f;
            
            let isFront = true;
            card.addEventListener('click', () => {
                card.style.transform = "rotateY(180deg)";
                setTimeout(() => {
                    if (isFront) {
                        card.innerText = fc.b;
                        card.style.color = "var(--primary)";
                        isFront = false;
                    } else {
                        card.innerText = fc.f;
                        card.style.color = "var(--text-dark)";
                        isFront = true;
                    }
                    card.style.transform = "rotateY(0deg)";
                }, 150);
            });
            flashcardsGrid.appendChild(card);
        });
    }

    if (flashcardForm) {
        flashcardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const f = document.getElementById('fcFront').value.trim();
            const b = document.getElementById('fcBack').value.trim();

            let fcList = JSON.parse(sessionStorage.getItem('zenithFlashcards')) || [
                { f: "Apa kepanjangan dari singkatan ATS?", b: "Applicant Tracking System (Sistem Penyaring Karyawan Otomatis)" }
            ];
            fcList.push({ f, b });
            sessionStorage.setItem('zenithFlashcards', JSON.stringify(fcList));

            flashcardForm.reset();
            alert('Kartu hafalan flashcard berhasil dibuat! (+5 XP) 📑');
            addEduGlobalXP(5);
            renderFlashcards();
        });
    }

    // ==========================================================================
    // 4. ENGINE SINKRONISASI XP EDUKASI KE DASHBOARD UTAMA (VANILLA ONLY)
    // ==========================================================================
    function addEduGlobalXP(amount) {
        let sessionData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || { username: "Pendri Mikola", xp: 0, level: 1 };
        
        sessionData.xp = parseInt(sessionData.xp) || 0;
        sessionData.level = parseInt(sessionData.level) || 1;

        sessionData.xp += amount;
        if (sessionData.xp < 0) sessionData.xp = 0;

        if (sessionData.xp >= 100) {
            sessionData.level += 1;
            sessionData.xp -= 100;
            alert(`Luar Basa, Pendri! Karakter ZenithLife Kamu Naik ke Level ${sessionData.level}! 🚀`);
        }

        sessionStorage.setItem('zenithSessionData', JSON.stringify(sessionData));
        sessionStorage.setItem('userXP', sessionData.xp); 

        if (typeof updateUserStats === 'function') updateUserStats();
        if (typeof updateDashboardUI === 'function') updateDashboardUI();
        
        console.log(`XP Edukasi Masuk! Skor Global Pendri: ${sessionData.xp} XP (Level ${sessionData.level})`);
    }

    // Inisialisasi visual awal komponen pelacakan
    updateTimerUI();
    renderFlashcards();

}); // <-- SEKARANG DIKUNCI AMAN DI BAGIAN PALING AKHIR FILE