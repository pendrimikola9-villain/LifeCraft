document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // A. LOGIKA KALKULATOR KALORI BERSIH
    // ==========================================================================
    const btnCountCal = document.getElementById('btnCountCal');
    const lblNetCalories = document.getElementById('lblNetCalories');
    let savedNetCal = sessionStorage.getItem('netCalories') || 0;
    if (lblNetCalories) lblNetCalories.innerText = savedNetCal;

    if (btnCountCal) {
        btnCountCal.addEventListener('click', () => {
            const calIn = parseInt(document.getElementById('numCalIn').value) || 0;
            const calOut = parseInt(document.getElementById('numCalOut').value) || 0;
            const netCalories = calIn - calOut;
            lblNetCalories.innerText = netCalories;
            sessionStorage.setItem('netCalories', netCalories);
            alert(`Kalori tercatat! Net Kalori: ${netCalories} kcal 🥗`);
        });
    }

    // ==========================================================================
    // B. WATER TRACKER
    // ==========================================================================
    const btnAddWater = document.getElementById('btnAddWater');
    const lblWaterAmount = document.getElementById('lblWaterAmount');
    const lblGlassCount = document.getElementById('lblGlassCount');
    const waterFluid = document.getElementById('waterFluid');
    let currentWater = parseInt(sessionStorage.getItem('currentWaterAmount')) || 0;

    function updateWaterUI() {
        if (!lblWaterAmount || !waterFluid) return;
        lblWaterAmount.innerText = `${currentWater} / 2000 ml`;
        lblGlassCount.innerText = `Kamu baru minum ${Math.floor(currentWater / 250)} gelas`;
        let percentage = (currentWater / 2000) * 100;
        if (percentage > 100) percentage = 100;
        waterFluid.style.height = `${percentage}%`;

        const chkWater = document.getElementById('chkWater');
        if (currentWater >= 2000 && chkWater && !chkWater.checked) {
            chkWater.checked = true;
            chkWater.dispatchEvent(new Event('change'));
        }
    }

    if (btnAddWater) {
        btnAddWater.addEventListener('click', () => {
            currentWater += 250;
            sessionStorage.setItem('currentWaterAmount', currentWater);
            updateWaterUI();
            addGlobalXP(5);
        });
    }

    // ==========================================================================
    // C. LOGIKA MONITORING BERAT BADAN + PREDIKSI & SARAN IDEAL (BMI)
    // ==========================================================================
    const btnSaveWeight = document.getElementById('btnSaveWeight');
    const bmiResultBox = document.getElementById('bmiResultBox');
    const lblBmiStatus = document.getElementById('lblBmiStatus');
    const lblBmiPrediction = document.getElementById('lblBmiPrediction');
    const lblBmiAdvice = document.getElementById('lblBmiAdvice');

    function calculateBMI() {
        const weight = parseFloat(document.getElementById('numWeight').value);
        const heightCm = parseFloat(document.getElementById('numHeight').value);

        if (!weight || !heightCm) return;

        const heightM = heightCm / 100;
        const bmi = (weight / (heightM * heightM)).toFixed(1);
        
        const idealMin = (18.5 * (heightM * heightM)).toFixed(1);
        const idealMax = (24.9 * (heightM * heightM)).toFixed(1);

        bmiResultBox.style.display = 'block';
        sessionStorage.setItem('userWeight', weight);
        sessionStorage.setItem('userHeight', heightCm);

        if (bmi < 18.5) {
            lblBmiStatus.innerText = "Kurang Berat Badan (Underweight)";
            lblBmiStatus.style.color = "#eab308";
            lblBmiPrediction.innerText = `Skor BMI kamu adalah ${bmi}. Tubuhmu terdeteksi kurang proporsional karena berada di bawah ambang batas ideal harian.`;
            lblBmiAdvice.innerText = `💡 Saran: Berat badan ideal untuk tinggi badanmu adalah ${idealMin} kg - ${idealMax} kg. Yuk, tingkatkan konsumsi nutrisi protein dan kalori bersih harianmu!`;
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            lblBmiStatus.innerText = "Berat Badan Ideal (Normal)";
            lblBmiStatus.style.color = "#10b981";
            lblBmiPrediction.innerText = `Skor BMI kamu adalah ${bmi}. Selamat! Postur tubuhmu saat ini sudah berada di titik seimbang dan sangat proporsional.`;
            lblBmiAdvice.innerText = `💡 Saran: Pertahankan pola makan sehatmu saat ini dan tetap konsisten olahraga harian bersama ZenithLife!`;
        } else {
            lblBmiStatus.innerText = "Kelebihan Berat Badan (Overweight)";
            lblBmiStatus.style.color = "#ef4444";
            lblBmiPrediction.innerText = `Skor BMI kamu adalah ${bmi}. Tubuhmu terdeteksi melebihi ambang batas ideal proporsional standar.`;
            lblBmiAdvice.innerText = `💡 Saran: Berat badan ideal untuk tinggi badanmu adalah ${idealMin} kg - ${idealMax} kg. Yuk, kurangi makanan berminyak/gorengan dan optimalkan porsi olahraga aktivitas fisikmu!`;
        }
    }

    if (btnSaveWeight) {
        document.getElementById('numWeight').value = sessionStorage.getItem('userWeight') || '';
        document.getElementById('numHeight').value = sessionStorage.getItem('userHeight') || '';
        if (sessionStorage.getItem('userWeight')) calculateBMI();

        btnSaveWeight.addEventListener('click', () => {
            calculateBMI();
            alert('Analisis profil tubuh berhasil diperbarui secara akurat! ⚖️');
        });
    }

    // ==========================================================================
    // D. LOGIKA MULTI-CHALLENGE INPUT BERKALI-KALI & BERKATEGORI
    // ==========================================================================
    const txtCustomChallenge = document.getElementById('txtCustomChallenge');
    const selChallengeType = document.getElementById('selChallengeType');
    const btnSaveChallenge = document.getElementById('btnSaveChallenge');
    const customChallengesContainer = document.getElementById('customChallengesContainer');

    function renderCustomChallenges() {
        if (!customChallengesContainer) return;
        
        let challengesList = JSON.parse(sessionStorage.getItem('zenithMultiChallenges')) || [];
        
        if (challengesList.length === 0) {
            customChallengesContainer.innerHTML = `<p style="color: var(--text-light); font-size: 13px; text-align: center;">Belum ada tantangan kustom yang dibuat.</p>`;
            return;
        }

        customChallengesContainer.innerHTML = '';

        challengesList.forEach((challenge, index) => {
            const card = document.createElement('div');
            const badgeColors = { "Harian": "#10b981", "Mingguan": "#A855F7", "Bulanan": "#f59e0b" };
            const badgeColor = badgeColors[challenge.type] || "var(--primary)";

            card.style.cssText = "background: var(--bg-navbar); padding: 14px; border-radius: var(--radius-md); border-left: 4px solid " + badgeColor + "; box-shadow: var(--shadow-sm); position: relative;";
            
            let completedUnits = challenge.progress.filter(p => p === true).length;
            let isAllDone = completedUnits === challenge.progress.length;

            let progressHtml = '';
            challenge.progress.forEach((status, pIdx) => {
                const labelName = challenge.type === "Harian" ? "Hari" : (challenge.type === "Mingguan" ? `H-${pIdx+1}` : `M-${pIdx+1}`);
                progressHtml += `
                    <label style="display:flex; flex-direction:column; align-items:center; font-size:10px; font-weight:700; color:var(--text-dark); cursor:pointer;">
                        <span>${labelName}</span>
                        <input type="checkbox" class="challenge-unit-chk" data-c-idx="${index}" data-p-idx="${pIdx}" ${status?'checked':''} ${challenge.claimed?'disabled':''} style="cursor:pointer; width:15px; height:15px;">
                    </label>
                `;
            });

            const xpRewards = { "Harian": 20, "Mingguan": 100, "Bulanan": 300 };
            const xpReward = xpRewards[challenge.type] || 50;

            card.innerHTML = `
                <div style="flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <span style="font-size: 10px; background: ${badgeColor}20; color: ${badgeColor}; padding: 2px 8px; border-radius: 4px; font-weight: 700;">${challenge.type}</span>
                    <button class="btn-delete-challenge" data-index="${index}" style="background:transparent; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:12px;">✕ Hapus</button>
                </div>
                <h4 style="color: var(--text-dark); margin-bottom: 8px; font-size:13px;">${challenge.title}</h4>
                
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.01); padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                    ${progressHtml}
                </div>

                <button class="btn-claim-multi-xp" data-index="${index}" style="width:100%; padding: 6px; font-size:12px; border-radius:6px; border:none; font-weight:700; background:${badgeColor}; color:white; cursor:pointer;" 
                    ${(!isAllDone || challenge.claimed) ? 'disabled style="background:var(--border-color); color:var(--text-light); cursor:not-allowed; opacity:0.5;"' : ''}>
                    ${challenge.claimed ? '✅ Reward Telah Diklaim' : `🎁 Klaim Hadiah (+${xpReward} XP)`}
                </button>
            `;

            customChallengesContainer.appendChild(card);
        });

        document.querySelectorAll('.challenge-unit-chk').forEach(chk => {
            chk.addEventListener('change', () => {
                const cIdx = parseInt(chk.getAttribute('data-c-idx'));
                const pIdx = parseInt(chk.getAttribute('data-p-idx'));
                
                challengesList[cIdx].progress[pIdx] = chk.checked;
                sessionStorage.setItem('zenithMultiChallenges', JSON.stringify(challengesList));
                renderCustomChallenges();
            });
        });

        document.querySelectorAll('.btn-claim-multi-xp').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                if (challengesList[idx].claimed) return;

                const xpRewards = { "Harian": 20, "Mingguan": 100, "Bulanan": 300 };
                const xpReward = xpRewards[challengesList[idx].type] || 50;

                challengesList[idx].claimed = true;
                sessionStorage.setItem('zenithMultiChallenges', JSON.stringify(challengesList));
                
                addGlobalXP(xpReward);
                alert(`Luar biasa! Sukses menuntaskan target ${challengesList[idx].type} dan meraih +${xpReward} XP 🏆`);
                renderCustomChallenges();
            });
        });

        document.querySelectorAll('.btn-delete-challenge').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                challengesList.splice(idx, 1);
                sessionStorage.setItem('zenithMultiChallenges', JSON.stringify(challengesList));
                renderCustomChallenges();
            });
        });
    }

    if (btnSaveChallenge) {
        btnSaveChallenge.addEventListener('click', () => {
            const title = txtCustomChallenge.value.trim();
            const type = selChallengeType.value;

            if (!title) {
                alert('Tolong ketikkan isi nama tantangan kustom kamu dulu!');
                return;
            }

            let length = 1;
            if (type === "Mingguan") length = 5;
            if (type === "Bulanan") length = 4;

            let progressArray = Array(length).fill(false);

            let challengesList = JSON.parse(sessionStorage.getItem('zenithMultiChallenges')) || [];
            challengesList.push({
                title: title,
                type: type,
                progress: progressArray,
                claimed: false
            });

            sessionStorage.setItem('zenithMultiChallenges', JSON.stringify(challengesList));
            txtCustomChallenge.value = '';
            
            alert(`Berhasil menambahkan tantangan baru kategori ${type}! 🔥`);
            renderCustomChallenges();
        });
    }

    // ==========================================================================
    // E. MISI HARIAN DAN KONEKTOR TARGET KESEHATAN AKTIF
    // ==========================================================================
    const chkJournalMission = document.getElementById('chkJournalMission');
    const healthCheckboxes = document.querySelectorAll('.health-checkbox');
    let savedMissions = JSON.parse(sessionStorage.getItem('zenithSavedMissions')) || {};

    if (chkJournalMission) {
        if (sessionStorage.getItem('missionJournalComplete') === 'true') {
            chkJournalMission.checked = true;
            if (sessionStorage.getItem('missionJournalXpClaimed') !== 'true') {
                addGlobalXP(10);
                sessionStorage.setItem('missionJournalXpClaimed', 'true');
            }
        }
    }

    // Deteksi interaksi klik pada checkbox kesehatan bawaan halamanmu
    healthCheckboxes.forEach(chk => {
        if (savedMissions[chk.id]) chk.checked = true;
        chk.addEventListener('change', () => {
            savedMissions = JSON.parse(sessionStorage.getItem('zenithSavedMissions')) || {};
            const xpValue = parseInt(chk.getAttribute('data-xp')) || 0;
            
            if (chk.checked) {
                savedMissions[chk.id] = true;
                addGlobalXP(xpValue);
                console.log(`Target ${chk.id} Berhasil Selesai: +${xpValue} XP dikirim`);
            } else {
                savedMissions[chk.id] = false;
                addGlobalXP(-xpValue);
                console.log(`Target ${chk.id} Dibatalkan: -${xpValue} XP dikurangi`);
            }
            sessionStorage.setItem('zenithSavedMissions', JSON.stringify(savedMissions));
        });
    });

    // ==========================================================================
    // F. ENGINE UTILITY GLOBAL XP SINKRONISASI TOTAL (SINKRON DASHBOARD UTAMA)
    // ==========================================================================
    function addGlobalXP(amount) {
        // Ambil penampung data utama ZenithLife agar level di index.html ikut bergerak maju
        let sessionData = JSON.parse(sessionStorage.getItem('zenithSessionData')) || { username: "Pendri Mikola", xp: 0, level: 1 };
        
        sessionData.xp = parseInt(sessionData.xp) || 0;
        sessionData.level = parseInt(sessionData.level) || 1;

        // Tambahkan XP
        sessionData.xp += amount;
        if (sessionData.xp < 0) sessionData.xp = 0;

        // Logika naik level otomatis jika menyentuh 100 XP
        if (sessionData.xp >= 100) {
            sessionData.level += 1;
            sessionData.xp -= 100;
            alert(`Luar Biasa, Pendri! Karakter ZenithLife Kamu Naik ke Level ${sessionData.level}! 🚀`);
        }

        // Amankan penyimpanan ke data internal dan eksternal halaman kesehatan
        sessionStorage.setItem('zenithSessionData', JSON.stringify(sessionData));
        sessionStorage.setItem('userXP', sessionData.xp); // Tetap simpan untuk cadangan visual bar halaman lama

        // Memicu pembaharuan visual grafik atau dashboard jika tersedia
        if (typeof updateUserStats === 'function') updateUserStats();
        if (typeof updateDashboardUI === 'function') updateDashboardUI();
    }

    // Pemicu eksekusi komponen awal saat halaman dimuat
    updateWaterUI();
    renderCustomChallenges();
});