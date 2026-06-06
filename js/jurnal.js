/* ==========================================================================
   1. DATABASE LINK SINKRONISASI SESSIONSTORAGE
   ========================================================================== */
let journalData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || {
    username: "", xp: 0, level: 1, waterIntake: 0, notesCount: 0, atsScore: 0, todayMood: "", savedNotes: [], lastMissionDate: ""
};

// Pastikan array catatan sudah terdefinisi di memori browser
if (journalData.savedNotes === undefined) journalData.savedNotes = [];
if (journalData.todayMood === undefined) journalData.todayMood = "";

function saveJournalData() {
    sessionStorage.setItem('zenithSessionData', JSON.stringify(journalData));
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
}

function addJournalXP(amount) {
    journalData.xp += amount;
    if (journalData.xp >= 100) {
        journalData.level += 1;
        journalData.xp = journalData.xp - 100;
        alert(`Selamat! Kamu naik ke Level ${journalData.level}! 🚀`);
    }
    saveJournalData();
}

/* ==========================================================================
   2. INTERACTIVE MOOD TRACKER ENGINE
   ========================================================================== */
function initMoodTracker() {
    const moodBtns = document.querySelectorAll('.btn-mood');
    const todayMoodText = document.getElementById('todayMoodText');
    if (!todayMoodText) return;

    // Load mood yang sebelumnya sudah tersimpan di sesi ini (jika ada)
    if (journalData.todayMood) {
        todayMoodText.innerText = journalData.todayMood;
    }

    moodBtns.forEach(btn => {
        const currentMood = btn.getAttribute('data-mood');
        
        // Tandai tombol jika emosinya cocok dengan data memori
        if (currentMood === journalData.todayMood) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            // Bersihkan status aktif dari semua tombol mood terlebih dahulu
            moodBtns.forEach(b => b.classList.remove('selected'));
            
            // Aktifkan tombol yang baru diklik
            btn.classList.add('selected');
            
            // Beri bonus +5 XP jika baru pertama kali memilih mood di sesi ini
            if (journalData.todayMood === "") {
                addJournalXP(5);
            }

            journalData.todayMood = currentMood;
            todayMoodText.innerText = currentMood;
            saveJournalData();
        });
    });
}

/* ==========================================================================
   3. ADVANCED QUICK NOTES ENGINE (CRUD)
   ========================================================================== */
const noteForm = document.getElementById('noteForm');
const notesGrid = document.getElementById('notesGrid');
const searchNotesInput = document.getElementById('searchNotesInput');

function renderNotes(notesArray = journalData.savedNotes) {
    if (!notesGrid) return;
    
    notesGrid.innerHTML = "";

    // Jika catatan kosong, tampilkan pesan informatif murni HTML
    if (notesArray.length === 0) {
        notesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-light); padding: 40px; border: 2px dashed rgba(99,102,241,0.2); border-radius: var(--radius-lg); background: rgba(255,255,255,0.2);">
                <p style="font-weight: 600;">Belum ada catatan yang cocok atau tersimpan. Mulai tulis ide pertamamu!</p>
            </div>`;
        return;
    }

    // Lakukan perulangan array untuk merender kartu catatan
    notesArray.forEach((note, index) => {
        const card = document.createElement('div');
        card.className = 'dash-card';
        card.style.cssText = "min-height: auto; padding: 24px; text-align: left; display: flex; flex-direction: column; justify-content: space-between;";
        
        card.innerHTML = `
            <div>
                <span class="note-tag tag-${note.category}">${note.category}</span>
                <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">${escapeHTML(note.title)}</h4>
                <p style="font-size: 14px; color: var(--text-light); white-space: pre-line; margin-bottom: 16px;">${escapeHTML(note.content)}</p>
            </div>
            <button class="btn-primary" onclick="deleteNote(${index})" style="background: none; color: #EF4444; box-shadow: none; padding: 0; font-size: 13px; font-weight: 700; text-align: right; width: fit-content; align-self: flex-end;">Hapus Catatan</button>
        `;
        notesGrid.appendChild(card);
    });
    
    // Update counter jumlah total catatan ke database global
    journalData.notesCount = journalData.savedNotes.length;
    sessionStorage.setItem('zenithSessionData', JSON.stringify(journalData));
}

// Pengaman enkripsi string teks input (Poin keamanan validasi data)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Handler Aksi Form Submit (Create)
if (noteForm) {
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('noteTitle').value.trim();
        const category = document.getElementById('noteCategory').value;
        const content = document.getElementById('noteContent').value.trim();

        const newNote = { title, category, content };
        journalData.savedNotes.unshift(newNote); // Masukkan ke urutan teratas array
        
        addJournalXP(10); // Beri reward +10 XP
        noteForm.reset(); // Reset form isian teks
        renderNotes();
    });
}

// Handler Aksi Hapus Catatan (Delete) yang diikat ke objek Window luar
window.deleteNote = function(index) {
    if (confirm("Apakah kamu yakin ingin menghapus catatan ide ini?")) {
        journalData.savedNotes.splice(index, 1);
        saveJournalData();
        renderNotes();
    }
}

/* ==========================================================================
   4. LIVE SEARCH FILTER ENGINE (Murni Algoritma Array Match)
   ========================================================================== */
if (searchNotesInput) {
    searchNotesInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Memfilter array berdasarkan kecocokan judul atau konten teks
        const filtered = journalData.savedNotes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.content.toLowerCase().includes(query)
        );
        
        renderNotes(filtered); // Render ulang isi tabel grid hanya dengan data hasil filter
    });
}

/* ==========================================================================
   5. AUTO INITIALIZER ON LOAD (KHUSUS HALAMAN JURNAL)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initMoodTracker();
    renderNotes();
});

