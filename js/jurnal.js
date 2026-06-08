document.addEventListener('DOMContentLoaded', () => {
    // 1. Array Inspirasi Menulis (Prompt) adaptif berdasarkan kategori
    const prompts = [
        "Materi IT/kuliah apa yang paling menantang hari ini? Bagaimana kamu mengatasinya?",
        "Tuliskan baris kode atau logika pemrograman baru yang berhasil kamu pelajari hari ini!",
        "Apa satu hal sederhana yang membuatmu sangat bersyukur hari ini?",
        "Progres projek aplikasi apa yang berhasil kamu selesaikan atau cicil hari ini?",
        "Pelajaran berharga apa yang kamu dapatkan dari aktivitas harimu?"
    ];

    // Acak prompt setiap kali halaman dimuat
    const promptBox = document.getElementById('journalPromptBox');
    if (promptBox) {
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        promptBox.innerText = `💡 Inspirasi Menulis: "${randomPrompt}"`;
    }

    // 2. State Pilihan Jurnal
    let selectedMood = '';
    let selectedTags = [];

    // Logika Klik Mood Emoji
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset semua border tombol mood
            moodButtons.forEach(b => {
                b.style.borderColor = 'var(--border-color)';
                b.style.background = 'transparent';
            });
            // Aktifkan tombol yang diklik
            btn.style.borderColor = 'var(--primary)';
            btn.style.background = 'rgba(99, 102, 241, 0.05)';
            btn.style.transform = 'scale(1.05)';
            setTimeout(() => btn.style.transform = 'scale(1)', 150);
            selectedMood = btn.getAttribute('data-mood');
        });
    });

    // Logika Klik Multi-select Tag Status
    const tagButtons = document.querySelectorAll('.tag-btn');
    tagButtons.forEach(tag => {
        // Gaya dasar tag tombol agar estetik
        tag.style.cssText = "padding: 6px 14px; border: 1px solid var(--border-color); border-radius: 20px; font-size: 13px; cursor: pointer; transition: var(--transition); user-select: none; color: var(--text-dark); background: transparent;";
        
        tag.addEventListener('click', () => {
            const tagName = tag.getAttribute('data-tag');
            if (selectedTags.includes(tagName)) {
                selectedTags = selectedTags.filter(t => t !== tagName);
                tag.style.background = 'transparent';
                tag.style.color = 'var(--text-dark)';
                tag.style.borderColor = 'var(--border-color)';
            } else {
                selectedTags.push(tagName);
                tag.style.background = 'var(--primary)';
                tag.style.color = 'white';
                tag.style.borderColor = 'var(--primary)';
            }
        });
    });

    // ==========================================================================
    // 3. HANDLER SUBMIT FORM JURNAL (SINKRONISASI REAL-TIME DASHBOARD FIX)
    // ==========================================================================
    const journalForm = document.getElementById('journalForm');
    if (journalForm) {
        journalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const category = document.getElementById('journalCategory').value;
            const content = document.getElementById('journalContent').value;
            const today = new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

            // Ambil riwayat lama dari sessionStorage
            let journalData = JSON.parse(sessionStorage.getItem('zenithJournals')) || [];
            
            // Buat objek data jurnal baru
            const newJournal = {
                date: today,
                category: category,
                mood: selectedMood || 'none',
                tags: [...selectedTags],
                text: content
            };

            journalData.unshift(newJournal); // Masukkan ke urutan paling atas
            sessionStorage.setItem('zenithJournals', JSON.stringify(journalData));

            // --------------------------------------------------------------------------
            // KUNCI SINKRONISASI: Hitung total panjang array & tembak ke key widget dashboard
            // --------------------------------------------------------------------------
            sessionStorage.setItem('zenithJournalNotesCount', journalData.length);

            // Update juga object local data jika terpasang di file script dashboard utamamu
            if (typeof userData !== 'undefined') {
                userData.notesCount = journalData.length;
                if (typeof saveUserData === 'function') saveUserData();
            }

            // Picu misi kesehatan mental selesai otomatis jika menulis kategori Refleksi Diri
            if (category === "Refleksi Diri") {
                sessionStorage.setItem('missionJournalComplete', 'true');
            }

            // TAMBAH XP GLOBAL (+10 XP)
            let currentXP = parseInt(sessionStorage.getItem('userXP')) || 0;
            currentXP += 10;
            sessionStorage.setItem('userXP', currentXP);

            // Reset Form & State
            document.getElementById('journalContent').value = '';
            selectedTags = [];
            selectedMood = '';
            moodButtons.forEach(b => {
                b.style.borderColor = 'var(--border-color)';
                b.style.background = 'transparent';
            });
            tagButtons.forEach(tag => {
                tag.style.background = 'transparent';
                tag.style.color = 'var(--text-dark)';
                tag.style.borderColor = 'var(--border-color)';
            });

            alert(`Jurnal ${category} berhasil disimpan! Kamu mendapatkan +10 XP ⚡`);
            
            // Render ulang grafik dan log histori
            renderMoodChart();
            renderJournalLogs();
            
            // Trigger fungsi update stats global agar halaman dashboard utama langsung berubah real-time
            if (typeof updateUserStats === 'function') updateUserStats();
            if (typeof updateDashboardUI === 'function') updateDashboardUI();
        });
    }

    // 4. Fungsi Menggambar Grafik Batang Riwayat Mood (Murni CSS Dinamis)
    function renderMoodChart() {
        const chartBox = document.getElementById('moodChart');
        if (!chartBox) return;

        let journalData = JSON.parse(sessionStorage.getItem('zenithJournals')) || [];
        const moodEntries = journalData.filter(d => d.mood !== 'none').slice(0, 7).reverse();

        if (moodEntries.length === 0) {
            chartBox.innerHTML = `<p style="color:var(--text-light); font-size:13px; text-align:center; width:100%; margin: auto;">Isi jurnal dengan kategori 'Refleksi Diri' untuk melihat grafik mood harian.</p>`;
            return;
        }

        chartBox.innerHTML = '';
        
        const moodValues = { happy: 100, neutral: 60, sad: 25 };
        const moodEmojis = { happy: '😊', neutral: '😐', sad: '😔' };

        moodEntries.forEach(data => {
            const barHeight = moodValues[data.mood] || 50;
            const emoji = moodEmojis[data.mood] || '📝';
            
            const barWrapper = document.createElement('div');
            barWrapper.style.cssText = "display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; width: 40px;";
            
            barWrapper.innerHTML = `
                <span style="font-size: 14px;">${emoji}</span>
                <div style="width: 12px; height: ${barHeight}%; background: var(--primary); border-radius: 6px 6px 0 0; animation: growUp 0.5s ease-out; box-shadow: 0 4px 10px rgba(99,102,241,0.2);"></div>
                <span style="font-size: 10px; color: var(--text-light); font-weight:600;">${data.date.split(',')[1] || data.date}</span>
            `;
            chartBox.appendChild(barWrapper);
        });
    }

    // 5. Fungsi Memasang Log List History Jurnal Berdasarkan Kategori
    function renderJournalLogs() {
        const logsContainer = document.getElementById('journalLogs');
        if (!logsContainer) return;

        let journalData = JSON.parse(sessionStorage.getItem('zenithJournals')) || [];

        if (journalData.length === 0) {
            logsContainer.innerHTML = `<p style="color: var(--text-light); font-size: 13px;">Belum ada riwayat jurnal belajar atau refleksi.</p>`;
            return;
        }

        const moodEmojis = { happy: '😊', neutral: '😐', sad: '😔', none: '' };
        
        const catColors = {
            "IT & Coding": { bg: "rgba(99, 102, 241, 0.1)", text: "var(--primary)" },
            "Kuliah": { bg: "rgba(234, 179, 8, 0.1)", text: "#B45309" },
            "Refleksi Diri": { bg: "rgba(168, 85, 247, 0.1)", text: "#7E22CE" },
            "Umum": { bg: "rgba(100, 116, 139, 0.1)", text: "#475569" }
        };

        logsContainer.innerHTML = journalData.map(data => {
            const colors = catColors[data.category] || catColors["Umum"];
            return `
                <div style="background: var(--bg-navbar); padding: 14px; border-radius: var(--radius-md); border-left: 4px solid var(--primary); box-shadow: var(--shadow-sm); margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 11px; background: ${colors.bg}; color: ${colors.text}; padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid transparent;">
                            ${data.category}
                        </span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: 600; font-size: 12px; color: var(--text-light);">${data.date}</span>
                            <span style="font-size: 16px;">${moodEmojis[data.mood]}</span>
                        </div>
                    </div>
                    <p style="font-size: 13px; margin: 6px 0; line-height: 1.5; color: var(--text-dark); white-space: pre-line;">${data.text}</p>
                    <div style="display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap;">
                        ${data.tags.map(t => `<span style="font-size: 10px; background: rgba(0,0,0,0.04); color: var(--text-light); padding: 2px 8px; border-radius: 10px; font-weight: 600;">#${t}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Jalankan render saat halaman terbuka pertama kali
    renderMoodChart();
    renderJournalLogs();
});