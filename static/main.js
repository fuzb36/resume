// Logik Utama Web-Based ATS Resume Builder

// Pemegang Data Negeri (State)
let educationData = [];
let workData = [];
let certData = [];
let gambarBase64 = "";

// ==========================================
// LOGIK DRAG AND DROP (REORDERING)
// ==========================================
let draggedIndex = null;
let dragType = null;

function setDraggable(handleEl, canDrag) {
    const card = handleEl.closest('.draggable-card');
    if (card) {
        card.setAttribute('draggable', canDrag ? 'true' : 'false');
    }
}

function dragStart(event, index, type) {
    draggedIndex = index;
    dragType = type;
    event.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        event.target.classList.add('opacity-30', 'border-brand-500');
    }, 0);
}

function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function drop(event, targetIndex, type) {
    event.preventDefault();
    if (dragType !== type || draggedIndex === null || draggedIndex === targetIndex) return;
    
    let arr;
    if (type === 'edu') arr = educationData;
    else if (type === 'work') arr = workData;
    else if (type === 'cert') arr = certData;
    
    if (!arr) return;
    
    // Pindahkan item dalam array
    const [movedItem] = arr.splice(draggedIndex, 1);
    arr.splice(targetIndex, 0, movedItem);
    
    // Render semula borang yang terjejas
    if (type === 'edu') renderEduForm();
    else if (type === 'work') renderWorkForm();
    else if (type === 'cert') renderCertForm();
    
    updatePreview();
}

function dragEnd(event) {
    event.target.classList.remove('opacity-30', 'border-brand-500');
    draggedIndex = null;
    dragType = null;
}

// ==========================================
// TEMA PREVIEW: KLASIK VS FUTURISTIK
// ==========================================
function toggleTheme() {
    const paper = document.getElementById("ats-resume-paper");
    const btn = document.getElementById("theme-btn");
    if (!paper || !btn) return;
    
    if (paper.classList.contains("theme-futuristic")) {
        paper.classList.remove("theme-futuristic");
        btn.innerHTML = `
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Tukar Tema: Klasik
        `;
        localStorage.setItem("resume-preview-theme", "classic");
    } else {
        paper.classList.add("theme-futuristic");
        btn.innerHTML = `
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Tukar Tema: Futuristik
        `;
        localStorage.setItem("resume-preview-theme", "futuristic");
    }
}

// ==========================================
// TEMA & LOGIK DETIL PERMOHONAN SYARIKAT
// ==========================================
function updateApplicationDetails() {
    const syarikatInput = document.getElementById("preview-syarikat");
    const jawatanInput = document.getElementById("preview-jawatan");
    const tagline = document.getElementById("preview-tagline");
    if (!syarikatInput || !jawatanInput || !tagline) return;

    const syarikat = syarikatInput.value || "Syarikat Sasaran";
    const jawatan = jawatanInput.value || "Jawatan Sasaran";
    
    tagline.textContent = `Permohonan ${jawatan} di ${syarikat}`;
    
    localStorage.setItem("resume-target-syarikat", syarikat);
    localStorage.setItem("resume-target-jawatan", jawatan);
    
    // Kemas kini kandungan kertas resume dengan segera
    updatePreview();
}

// Muat data dari server semasa fail dimulakan
document.addEventListener("DOMContentLoaded", () => {
    try {
        const eduRaw = document.getElementById("server-data-edu").textContent;
        educationData = eduRaw ? JSON.parse(eduRaw) : [];
    } catch (e) { educationData = []; }

    try {
        const workRaw = document.getElementById("server-data-work").textContent;
        workData = workRaw ? JSON.parse(workRaw) : [];
    } catch (e) { workData = []; }

    try {
        const certRaw = document.getElementById("server-data-cert").textContent;
        certData = certRaw ? JSON.parse(certRaw) : [];
    } catch (e) { certData = []; }

    try {
        const otherRaw = document.getElementById("server-data-other").textContent;
        const otherData = otherRaw ? JSON.parse(otherRaw) : {};
        gambarBase64 = otherData.gambar_base64 || "";
        if (gambarBase64) {
            document.getElementById("gambar-status").textContent = "Gambar sedia ada dimuatkan";
            document.getElementById("btn-buang-gambar").classList.remove("hidden");
        }
    } catch (e) {
        gambarBase64 = "";
    }

    // Render Borang Dinamik
    renderEduForm();
    renderWorkForm();
    renderCertForm();
    
    // Kemas kini Pratonton Kertas Resume
    updatePreview();

    // Muat tema simpanan dari localStorage
    const savedTheme = localStorage.getItem("resume-preview-theme");
    if (savedTheme === "futuristic") {
        const paper = document.getElementById("ats-resume-paper");
        const btn = document.getElementById("theme-btn");
        if (paper && btn) {
            paper.classList.add("theme-futuristic");
            btn.innerHTML = `
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Tukar Tema: Futuristik
            `;
        }
    }

    // Muat butiran permohonan sasaran dari localStorage
    const savedSyarikat = localStorage.getItem("resume-target-syarikat");
    const savedJawatan = localStorage.getItem("resume-target-jawatan");
    
    const inputSyarikat = document.getElementById("preview-syarikat");
    const inputJawatan = document.getElementById("preview-jawatan");
    
    if (inputSyarikat && savedSyarikat !== null) {
        inputSyarikat.value = savedSyarikat;
    }
    if (inputJawatan && savedJawatan !== null) {
        inputJawatan.value = savedJawatan;
    }
    updateApplicationDetails();
});

// ==========================================
// PENGENDALIAN MUAT NAIK GAMBAR
// ==========================================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Had saiz: 2MB
    if (file.size > 2 * 1024 * 1024) {
        alert("Ralat: Saiz gambar profil tidak boleh melebihi 2MB!");
        event.target.value = "";
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        gambarBase64 = e.target.result;
        document.getElementById("gambar-status").textContent = "Gambar baru dimuatkan (" + file.name.substring(0, 15) + "...)";
        document.getElementById("btn-buang-gambar").classList.remove("hidden");
        updatePreview();
    };
    reader.readAsDataURL(file);
}

function clearImage() {
    gambarBase64 = "";
    document.getElementById("input-gambar").value = "";
    document.getElementById("gambar-status").textContent = "Tiada gambar dipilih";
    document.getElementById("btn-buang-gambar").classList.add("hidden");
    updatePreview();
}

// ==========================================
// PENGENDALIAN ACCORDION
// ==========================================
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(`arrow-${sectionId}`);
    
    if (section.classList.contains("hidden")) {
        section.classList.remove("hidden");
        arrow.classList.remove("rotate-180");
    } else {
        section.classList.add("hidden");
        arrow.classList.add("rotate-180");
    }
}

// ==========================================
// LOGIK DINAMIK: PENDIDIKAN
// ==========================================
function renderEduForm() {
    const container = document.getElementById("edu-list");
    container.innerHTML = "";
    
    educationData.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "draggable-card p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 relative transition space-y-3";
        div.setAttribute("draggable", "false");
        div.setAttribute("ondragstart", `dragStart(event, ${index}, 'edu')`);
        div.setAttribute("ondragover", "dragOver(event)");
        div.setAttribute("ondrop", `drop(event, ${index}, 'edu')`);
        div.setAttribute("ondragend", "dragEnd(event)");
        
        div.innerHTML = `
            <!-- Kawalan: Drag Handle & Padam -->
            <div class="absolute top-3 right-3 flex items-center gap-3">
                <div onmouseenter="setDraggable(this, true)" onmouseleave="setDraggable(this, false)" class="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition p-1">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </div>
                <button type="button" onclick="removeEduItem(${index})" class="text-slate-500 hover:text-rose-400 text-xs">Padam</button>
            </div>
            
            <div class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pr-20">
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-400 uppercase">Institusi (Sekolah/Universiti)</label>
                        <input type="text" value="${item.institusi || ''}" oninput="updateEduItem(${index}, 'institusi', this.value)" placeholder="Cth: Universiti Malaya" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-400 uppercase">Bidang Pengajian</label>
                        <input type="text" value="${item.bidang || ''}" oninput="updateEduItem(${index}, 'bidang', this.value)" placeholder="Cth: Ijazah Sarjana Muda Sains Komputer" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3 pr-20">
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-400 uppercase">Tahun Mula</label>
                        <input type="text" value="${item.tahun_mula || ''}" oninput="updateEduItem(${index}, 'tahun_mula', this.value)" placeholder="Cth: 2018" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-400 uppercase">Tahun Tamat</label>
                        <input type="text" value="${item.tahun_tamat || ''}" oninput="updateEduItem(${index}, 'tahun_tamat', this.value)" placeholder="Cth: 2022" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function addEduItem() {
    educationData.push({ institusi: "", bidang: "", tahun_mula: "", tahun_tamat: "" });
    renderEduForm();
    updatePreview();
}

function removeEduItem(index) {
    educationData.splice(index, 1);
    renderEduForm();
    updatePreview();
}

function updateEduItem(index, field, value) {
    educationData[index][field] = value;
    updatePreview();
}

// ==========================================
// LOGIK DINAMIK: PENGALAMAN KERJA
// ==========================================
function renderWorkForm() {
    const container = document.getElementById("work-list");
    container.innerHTML = "";
    
    workData.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "draggable-card p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 relative transition space-y-3";
        div.setAttribute("draggable", "false");
        div.setAttribute("ondragstart", `dragStart(event, ${index}, 'work')`);
        div.setAttribute("ondragover", "dragOver(event)");
        div.setAttribute("ondrop", `drop(event, ${index}, 'work')`);
        div.setAttribute("ondragend", "dragEnd(event)");
        
        div.innerHTML = `
            <!-- Kawalan: Drag Handle & Padam -->
            <div class="absolute top-3 right-3 flex items-center gap-3">
                <div onmouseenter="setDraggable(this, true)" onmouseleave="setDraggable(this, false)" class="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition p-1">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </div>
                <button type="button" onclick="removeWorkItem(${index})" class="text-slate-500 hover:text-rose-400 text-xs">Padam</button>
            </div>
            
            <div class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pr-20">
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-400 uppercase">Jawatan Pekerjaan</label>
                        <input type="text" value="${item.jawatan || ''}" oninput="updateWorkItem(${index}, 'jawatan', this.value)" placeholder="Cth: Senior Software Engineer" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-400 uppercase">Syarikat & Lokasi Bekerja</label>
                        <input type="text" value="${item.lokasi || ''}" oninput="updateWorkItem(${index}, 'lokasi', this.value)" placeholder="Cth: Tech Solutions Sdn Bhd, Kuala Lumpur" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                    </div>
                </div>
                <div class="grid grid-cols-1 gap-3 pr-20">
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-400 uppercase">Tempoh Waktu (Dari Tahun sehingga)</label>
                        <input type="text" value="${item.dari_hingga || ''}" oninput="updateWorkItem(${index}, 'dari_hingga', this.value)" placeholder="Cth: 2022 - Kini atau 2020 - 2022" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-400 uppercase">Tanggungjawab / Pencapaian Utama</label>
                        <textarea rows="2" oninput="updateWorkItem(${index}, 'pencapaian', this.value)" placeholder="Cth: Membina API backend menggunakan Python yang mengurangkan masa tindak balas pelayan sebanyak 30%." class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">${item.pencapaian || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function addWorkItem() {
    workData.push({ jawatan: "", lokasi: "", dari_hingga: "", pencapaian: "" });
    renderWorkForm();
    updatePreview();
}

function removeWorkItem(index) {
    workData.splice(index, 1);
    renderWorkForm();
    updatePreview();
}

function updateWorkItem(index, field, value) {
    workData[index][field] = value;
    updatePreview();
}

// ==========================================
// LOGIK DINAMIK: SIJIL
// ==========================================
function renderCertForm() {
    const container = document.getElementById("cert-list");
    container.innerHTML = "";
    
    certData.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "draggable-card flex items-center gap-3 bg-slate-800/20 p-2 rounded-xl border border-slate-700/40 transition";
        div.setAttribute("draggable", "false");
        div.setAttribute("ondragstart", `dragStart(event, ${index}, 'cert')`);
        div.setAttribute("ondragover", "dragOver(event)");
        div.setAttribute("ondrop", `drop(event, ${index}, 'cert')`);
        div.setAttribute("ondragend", "dragEnd(event)");
        
        div.innerHTML = `
            <input type="text" value="${item.nama || ''}" oninput="updateCertItem(${index}, this.value)" placeholder="Cth: AWS Certified Cloud Practitioner (2024)" class="block flex-grow rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
            <div class="flex items-center gap-2 shrink-0">
                <div onmouseenter="setDraggable(this, true)" onmouseleave="setDraggable(this, false)" class="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition p-1">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </div>
                <button type="button" onclick="removeCertItem(${index})" class="text-xs text-rose-400 hover:text-rose-300 px-1">Padam</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function addCertItem() {
    certData.push({ nama: "" });
    renderCertForm();
    updatePreview();
}

function removeCertItem(index) {
    certData.splice(index, 1);
    renderCertForm();
    updatePreview();
}

function updateCertItem(index, value) {
    certData[index].nama = value;
    updatePreview();
}

// ==========================================
// VALIDASI FORMAT IC (######-##-####)
// ==========================================
function validateIC(icValue) {
    const icError = document.getElementById("ic-error");
    const regex = /^\d{6}-\d{2}-\d{4}$/;
    
    if (icValue && !regex.test(icValue)) {
        icError.classList.remove("hidden");
        return false;
    } else {
        icError.classList.add("hidden");
        return true;
    }
}

// ==========================================
// KEMAS KINI PRATONTON (LIVE PREVIEW SYNC)
// ==========================================
function updatePreview() {
    const nama = document.getElementById("input-nama").value || "NAMA PENUH ANDA";
    const ic = document.getElementById("input-ic").value || "XXXXXX-XX-XXXX";
    const email = document.getElementById("input-email").value || "email@domain.com";
    const telefon = document.getElementById("input-telefon").value || "+601X-XXXXXXX";
    const alamat = document.getElementById("input-alamat").value || "Alamat kediaman anda.";
    const ulasan = document.getElementById("input-ulasan").value || "Ulasan profil profesional anda.";
    
    const kemahiran = document.getElementById("input-kemahiran").value || "";
    const bahasa = document.getElementById("input-bahasa").value || "";
    const portfolio = document.getElementById("input-portfolio").value || "";

    validateIC(ic);

    // Ambil info permohonan untuk diletakkan pada kertas resume
    const syarikatEl = document.getElementById("preview-syarikat");
    const jawatanEl = document.getElementById("preview-jawatan");
    const syarikat = syarikatEl ? syarikatEl.value : "";
    const jawatan = jawatanEl ? jawatanEl.value : "";
    
    let permohonanHtml = "";
    if (syarikat || jawatan) {
        const rawText = `Permohonan ${jawatan || 'Jawatan'} di ${syarikat || 'Syarikat'}`;
        const uppercaseText = rawText.toUpperCase();
        permohonanHtml = `
            <div style="text-align: center; font-size: 11pt; font-weight: 800; color: #000000; margin: 12px 0 16px 0; padding-bottom: 10px; border-bottom: 2px solid #000000; font-family: 'Outfit', 'Arial', sans-serif; letter-spacing: 0.5px;">
                ${uppercaseText}
            </div>
        `;
    }

    let headerHtml = "";
    if (gambarBase64) {
        headerHtml = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000000; padding-bottom: 12px;">
                <div style="flex-grow: 1; padding-right: 20px; text-align: left;">
                    <h1 style="font-size: 22pt; font-weight: 800; color: #0f172a; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', 'Arial', sans-serif;">${nama}</h1>
                    <div style="font-size: 9.5pt; color: #475569; margin-bottom: 6px;">
                        Nombor IC: <strong>${ic}</strong>
                    </div>
                    <div style="font-size: 9.5pt; color: #334155; display: flex; flex-wrap: wrap; gap: 8px;">
                        <span>E-mel: <strong>${email}</strong></span> |
                        <span>Telefon: <strong>${telefon}</strong></span>
                    </div>
                    <div style="font-size: 9pt; color: #64748b; margin-top: 6px; line-height: 1.4;">
                        ${alamat}
                    </div>
                </div>
                <div style="flex-shrink: 0; width: 105px; height: 135px; border: 1.5px solid #cbd5e1; padding: 2px; background: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-top: 5px;">
                    <img src="${gambarBase64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 2px;" alt="Foto Profil">
                </div>
            </div>
        `;
    } else {
        headerHtml = `
            <div style="text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000000; padding-bottom: 12px;">
                <h1 style="font-size: 22pt; font-weight: 800; color: #0f172a; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', 'Arial', sans-serif;">${nama}</h1>
                <div style="font-size: 9.5pt; color: #475569; margin-bottom: 6px;">
                    Nombor IC: <strong>${ic}</strong>
                </div>
                <div style="font-size: 9.5pt; color: #334155; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;">
                    <span>E-mel: <strong>${email}</strong></span> |
                    <span>Telefon: <strong>${telefon}</strong></span>
                </div>
                <div style="font-size: 9pt; color: #64748b; margin-top: 6px; line-height: 1.4;">
                    ${alamat}
                </div>
            </div>
        `;
    }

    let paperHtml = `
        <div style="font-family: 'Inter', 'Arial', sans-serif; line-height: 1.5; color: #0f172a; font-size: 10.5pt; padding: 10px;">
            <!-- Header Resume -->
            ${headerHtml}

            <!-- Tagline Permohonan -->
            ${permohonanHtml}

            <!-- Ulasan Profesional -->
            <div class="resume-section" style="margin-bottom: 20px;">
                <h2 style="font-size: 11pt; font-weight: bold; color: #000000; border-bottom: 2px solid #000000; margin: 0 0 8px 0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', 'Arial', sans-serif;">Ulasan Profesional</h2>
                <p style="margin: 0; text-align: justify; font-size: 9.5pt; color: #334155; line-height: 1.5;">${ulasan}</p>
            </div>
    `;

    // Pendidikan
    if (educationData.length > 0) {
        paperHtml += `
            <div class="resume-section" style="margin-bottom: 20px;">
                <h2 style="font-size: 11pt; font-weight: bold; color: #000000; border-bottom: 2px solid #000000; margin: 0 0 10px 0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', 'Arial', sans-serif;">Pendidikan</h2>
        `;
        
        educationData.forEach(item => {
            if (item.institusi || item.bidang) {
                paperHtml += `
                    <div class="resume-item" style="margin-bottom: 10px; font-size: 9.5pt;">
                        <div style="display: flex; justify-content: space-between; font-weight: bold; color: #0f172a;">
                            <span>${item.institusi || 'Nama Institusi'}</span>
                            <span style="font-weight: normal; color: #475569;">${item.tahun_mula || 'Tahun'} &ndash; ${item.tahun_tamat || 'Tahun'}</span>
                        </div>
                        <div style="font-style: italic; color: #475569; margin-top: 1px;">${item.bidang || 'Bidang Pengajian'}</div>
                    </div>
                `;
            }
        });
        
        paperHtml += `</div>`;
    }

    // Pengalaman Kerja
    if (workData.length > 0) {
        paperHtml += `
            <div class="resume-section" style="margin-bottom: 20px;">
                <h2 style="font-size: 11pt; font-weight: bold; color: #000000; border-bottom: 2px solid #000000; margin: 0 0 10px 0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', 'Arial', sans-serif;">Pengalaman Kerja</h2>
        `;
        
        workData.forEach(item => {
            if (item.jawatan || item.lokasi || item.dari_hingga) {
                // FORMAT ATS WAJIB KRONOLOGI TERBALIK:
                // <Dari Tahun sehingga> - <Lokasi bekerja> - <Jawatan>
                const formatLabel = `<strong style="color: #0f172a;">${item.dari_hingga || 'Tahun'}</strong> &ndash; <span style="color: #475569;">${item.lokasi || 'Lokasi'}</span> &ndash; <strong style="color: #1e3a8a; font-family: 'Outfit', 'Arial', sans-serif;">${item.jawatan || 'Jawatan'}</strong>`;
                
                paperHtml += `
                    <div class="resume-item" style="margin-bottom: 12px; font-size: 9.5pt;">
                        <div style="margin-bottom: 4px;">
                            ${formatLabel}
                        </div>
                        ${item.pencapaian ? `<p style="margin: 0 0 0 12px; text-align: justify; color: #334155; font-size: 9pt; line-height: 1.4;">• ${item.pencapaian}</p>` : ''}
                    </div>
                `;
            }
        });
        
        paperHtml += `</div>`;
    }

    // Sijil
    const validCerts = certData.filter(c => c.nama.trim() !== "");
    if (validCerts.length > 0) {
        paperHtml += `
            <div class="resume-section" style="margin-bottom: 20px;">
                <h2 style="font-size: 11pt; font-weight: bold; color: #000000; border-bottom: 2px solid #000000; margin: 0 0 10px 0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', 'Arial', sans-serif;">Sijil & Pentauliahan</h2>
                <ul style="margin: 0; padding-left: 15px; font-size: 9.5pt; color: #334155;">
        `;
        
        validCerts.forEach(item => {
            paperHtml += `<li style="margin-bottom: 4px; line-height: 1.4;">${item.nama}</li>`;
        });
        
        paperHtml += `</ul></div>`;
    }

    // Kemahiran & Lain-lain
    if (kemahiran || bahasa || portfolio) {
        paperHtml += `
            <div class="resume-section" style="margin-bottom: 20px;">
                <h2 style="font-size: 11pt; font-weight: bold; color: #000000; border-bottom: 2px solid #000000; margin: 0 0 8px 0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', 'Arial', sans-serif;">Maklumat Tambahan</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
        `;
        
        if (kemahiran) {
            paperHtml += `
                <tr>
                    <td style="width: 150px; font-weight: bold; color: #0f172a; vertical-align: top; padding: 4px 0;">Kemahiran Utama:</td>
                    <td style="padding: 4px 0; color: #334155; line-height: 1.4;">${kemahiran}</td>
                </tr>
            `;
        }
        if (bahasa) {
            paperHtml += `
                <tr>
                    <td style="width: 150px; font-weight: bold; color: #0f172a; vertical-align: top; padding: 4px 0;">Penguasaan Bahasa:</td>
                    <td style="padding: 4px 0; color: #334155; line-height: 1.4;">${bahasa}</td>
                </tr>
            `;
        }
        if (portfolio) {
            paperHtml += `
                <tr>
                    <td style="width: 150px; font-weight: bold; color: #0f172a; vertical-align: top; padding: 4px 0;">Pautan & Portfolio:</td>
                    <td style="padding: 4px 0; color: #1e3a8a; font-weight: 500; line-height: 1.4;">${portfolio}</td>
                </tr>
            `;
        }
        
        paperHtml += `</table></div>`;
    }

    paperHtml += `</div>`;
    
    // Terapkan ke dalam kertas preview
    document.getElementById("ats-resume-paper").innerHTML = paperHtml;
}

// ==========================================
// SIMPAN DATA RESUME (AJAX POST)
// ==========================================
function saveResumeData() {
    const nama = document.getElementById("input-nama").value;
    const ic = document.getElementById("input-ic").value;
    const email = document.getElementById("input-email").value;
    const telefon = document.getElementById("input-telefon").value;
    const alamat = document.getElementById("input-alamat").value;
    const ulasan = document.getElementById("input-ulasan").value;
    
    const kemahiran = document.getElementById("input-kemahiran").value;
    const bahasa = document.getElementById("input-bahasa").value;
    const portfolio = document.getElementById("input-portfolio").value;

    // Pastikan validasi IC dilepasi
    if (!validateIC(ic)) {
        alert("Ralat! Nombor IC tidak menepati format XXXXXX-XX-XXXX.");
        return;
    }

    const payload = {
        nama_penuh: nama,
        no_ic: ic,
        email: email,
        no_telefon: telefon,
        alamat: alamat,
        ulasan: ulasan,
        pendidikan: educationData,
        pengalaman_kerja: workData,
        sijil: certData,
        kemahiran: kemahiran,
        bahasa: bahasa,
        portfolio: portfolio,
        gambar_base64: gambarBase64
    };

    // Tentukan Endpoint API sama ada mod Admin atau User biasa
    let apiEndpoint = "/api/resume/save";
    if (window.is_admin_mode && window.resume_id) {
        apiEndpoint = `/api/admin/resume/save/${window.resume_id}`;
    }

    // Hantar request
    const btn = document.getElementById("btn-save");
    btn.disabled = true;
    btn.textContent = "Menyimpan...";

    fetch(apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        btn.disabled = false;
        btn.textContent = window.is_admin_mode ? "Simpan (Admin)" : "Simpan Data";
        
        if (data.status === "success") {
            alert(data.message);
        } else {
            alert("Ralat: " + data.message);
        }
    })
    .catch(error => {
        btn.disabled = false;
        btn.textContent = window.is_admin_mode ? "Simpan (Admin)" : "Simpan Data";
        console.error("Error saving resume:", error);
        alert("Gagal menghubungi server untuk menyimpan data resume.");
    });
}

// ==========================================
// CETAK / DOWNLOAD PDF RESUME
// ==========================================
function triggerPrint() {
    // Jalankan pencetakan asli pelayar.
    // CSS @media print akan menyembunyikan panel borang secara automatik,
    // menjadikan hanya kertas resume di cetak sebagai PDF tulen digital.
    window.print();
}
