// Logik Utama Web-Based ATS Resume Builder

// Pemegang Data Negeri (State)
let educationData = [];
let workData = [];
let certData = [];

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

    // Render Borang Dinamik
    renderEduForm();
    renderWorkForm();
    renderCertForm();
    
    // Kemas kini Pratonton Kertas Resume
    updatePreview();
});

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
        div.className = "p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 relative space-y-3";
        div.innerHTML = `
            <button type="button" onclick="removeEduItem(${index})" class="absolute top-3 right-3 text-slate-500 hover:text-rose-400 text-xs">Padam</button>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase">Institusi (Sekolah/Universiti)</label>
                    <input type="text" value="${item.institusi || ''}" oninput="updateEduItem(${index}, 'institusi', this.value)" placeholder="Cth: Universiti Malaya" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                </div>
                <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase">Bidang Pengajian</label>
                    <input type="text" value="${item.bidang || ''}" oninput="updateEduItem(${index}, 'bidang', this.value)" placeholder="Cth: Ijazah Sarjana Muda Sains Komputer" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase">Tahun Mula</label>
                    <input type="text" value="${item.tahun_mula || ''}" oninput="updateEduItem(${index}, 'tahun_mula', this.value)" placeholder="Cth: 2018" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                </div>
                <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase">Tahun Tamat</label>
                    <input type="text" value="${item.tahun_tamat || ''}" oninput="updateEduItem(${index}, 'tahun_tamat', this.value)" placeholder="Cth: 2022" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
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
        div.className = "p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 relative space-y-3";
        div.innerHTML = `
            <button type="button" onclick="removeWorkItem(${index})" class="absolute top-3 right-3 text-slate-500 hover:text-rose-400 text-xs">Padam</button>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase">Jawatan Pekerjaan</label>
                    <input type="text" value="${item.jawatan || ''}" oninput="updateWorkItem(${index}, 'jawatan', this.value)" placeholder="Cth: Senior Software Engineer" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                </div>
                <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase">Syarikat & Lokasi Bekerja</label>
                    <input type="text" value="${item.lokasi || ''}" oninput="updateWorkItem(${index}, 'lokasi', this.value)" placeholder="Cth: Tech Solutions Sdn Bhd, Kuala Lumpur" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                </div>
            </div>
            <div class="grid grid-cols-1 gap-3">
                <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase">Tempoh Waktu (Dari Tahun sehingga)</label>
                    <input type="text" value="${item.dari_hingga || ''}" oninput="updateWorkItem(${index}, 'dari_hingga', this.value)" placeholder="Cth: 2022 - Kini atau 2020 - 2022" class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
                </div>
                <div>
                    <label class="block text-[10px] font-semibold text-slate-400 uppercase">Tanggungjawab / Pencapaian Utama</label>
                    <textarea rows="2" oninput="updateWorkItem(${index}, 'pencapaian', this.value)" placeholder="Cth: Membina API backend menggunakan Python yang mengurangkan masa tindak balas pelayan sebanyak 30%." class="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">${item.pencapaian || ''}</textarea>
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
        div.className = "flex items-center gap-2";
        div.innerHTML = `
            <input type="text" value="${item.nama || ''}" oninput="updateCertItem(${index}, this.value)" placeholder="Cth: AWS Certified Cloud Practitioner (2024)" class="block flex-grow rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-500 transition">
            <button type="button" onclick="removeCertItem(${index})" class="text-xs text-rose-400 hover:text-rose-300 px-2">Padam</button>
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
    const alamat = document.getElementById("input-alamat").value || "Alamat kediaman anda akan dipaparkan di sini secara tersusun.";
    const ulasan = document.getElementById("input-ulasan").value || "Tulis ringkasan profil profesional anda yang menekankan kemahiran utama dan pencapaian kerjaya utama.";
    
    const kemahiran = document.getElementById("input-kemahiran").value || "";
    const bahasa = document.getElementById("input-bahasa").value || "";
    const portfolio = document.getElementById("input-portfolio").value || "";

    validateIC(ic);

    let paperHtml = `
        <div style="font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.5; color: #000; font-size: 11pt;">
            <!-- Header Resume -->
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 12px;">
                <h1 style="font-size: 20pt; font-weight: bold; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">${nama}</h1>
                <div style="font-size: 9.5pt; color: #333; margin-bottom: 6px;">
                    Nombor IC: ${ic}
                </div>
                <div style="font-size: 9.5pt; color: #333; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;">
                    <span>Email: <strong>${email}</strong></span> |
                    <span>Telefon: <strong>${telefon}</strong></span>
                </div>
                <div style="font-size: 9pt; color: #555; margin-top: 4px;">
                    ${alamat}
                </div>
            </div>

            <!-- Ulasan Profesional -->
            <div class="resume-section" style="margin-bottom: 20px;">
                <h2 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #aaa; margin: 0 0 8px 0; padding-bottom: 2px; text-transform: uppercase;">Ulasan Profesional</h2>
                <p style="margin: 0; text-align: justify; font-size: 10pt;">${ulasan}</p>
            </div>
    `;

    // Pendidikan
    if (educationData.length > 0) {
        paperHtml += `
            <div class="resume-section" style="margin-bottom: 20px;">
                <h2 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #aaa; margin: 0 0 10px 0; padding-bottom: 2px; text-transform: uppercase;">Pendidikan</h2>
        `;
        
        educationData.forEach(item => {
            if (item.institusi || item.bidang) {
                paperHtml += `
                    <div class="resume-item" style="margin-bottom: 8px; font-size: 10pt;">
                        <div style="display: flex; justify-content: space-between; font-weight: bold;">
                            <span>${item.institusi || 'Nama Institusi'}</span>
                            <span>${item.tahun_mula || 'Tahun'} - ${item.tahun_tamat || 'Tahun'}</span>
                        </div>
                        <div style="font-style: italic; color: #333;">${item.bidang || 'Bidang Pengajian'}</div>
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
                <h2 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #aaa; margin: 0 0 10px 0; padding-bottom: 2px; text-transform: uppercase;">Pengalaman Kerja</h2>
        `;
        
        workData.forEach(item => {
            if (item.jawatan || item.lokasi || item.dari_hingga) {
                // PAPARAN DALAM FORMAT WAJIB ATS KRONOLOGI TERBALIK:
                // <Dari Tahun sehingga> - <Lokasi bekerja> - <Jawatan>
                const formatLabel = `${item.dari_hingga || 'Tahun'} - ${item.lokasi || 'Syarikat/Lokasi'} - ${item.jawatan || 'Jawatan'}`;
                
                paperHtml += `
                    <div class="resume-item" style="margin-bottom: 12px; font-size: 10pt;">
                        <div style="font-weight: bold; margin-bottom: 4px; color: #000; font-size: 10pt;">
                            ${formatLabel}
                        </div>
                        ${item.pencapaian ? `<p style="margin: 0 0 0 15px; text-align: justify; color: #333; font-size: 9.5pt; list-style-type: disc;">• ${item.pencapaian}</p>` : ''}
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
                <h2 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #aaa; margin: 0 0 10px 0; padding-bottom: 2px; text-transform: uppercase;">Sijil & Pentauliahan</h2>
                <ul style="margin: 0; padding-left: 20px; font-size: 10pt;">
        `;
        
        validCerts.forEach(item => {
            paperHtml += `<li style="margin-bottom: 4px;">${item.nama}</li>`;
        });
        
        paperHtml += `</ul></div>`;
    }

    // Kemahiran & Lain-lain
    if (kemahiran || bahasa || portfolio) {
        paperHtml += `
            <div class="resume-section" style="margin-bottom: 20px;">
                <h2 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #aaa; margin: 0 0 8px 0; padding-bottom: 2px; text-transform: uppercase;">Maklumat Tambahan</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
        `;
        
        if (kemahiran) {
            paperHtml += `
                <tr>
                    <td style="width: 150px; font-weight: bold; vertical-align: top; padding: 2px 0;">Kemahiran:</td>
                    <td style="padding: 2px 0; color: #222;">${kemahiran}</td>
                </tr>
            `;
        }
        if (bahasa) {
            paperHtml += `
                <tr>
                    <td style="width: 150px; font-weight: bold; vertical-align: top; padding: 2px 0;">Bahasa:</td>
                    <td style="padding: 2px 0; color: #222;">${bahasa}</td>
                </tr>
            `;
        }
        if (portfolio) {
            paperHtml += `
                <tr>
                    <td style="width: 150px; font-weight: bold; vertical-align: top; padding: 2px 0;">Pautan & Portfolio:</td>
                    <td style="padding: 2px 0; color: #222;">${portfolio}</td>
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
        portfolio: portfolio
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
