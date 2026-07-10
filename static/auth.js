// static/auth.js - LocalStorage Database & User Session Management

// Initialize Database in LocalStorage
function initStaticDB() {
    // 1. Initialize Users
    if (!localStorage.getItem('static_users')) {
        const defaultUsers = [
            { id: '1', username: 'admin', email: 'admin@ats.com', role: 'admin', password: 'admin123' },
            { id: '2', username: 'user', email: 'user@ats.com', role: 'user', password: 'user123' }
        ];
        localStorage.setItem('static_users', JSON.stringify(defaultUsers));
    }

    // 2. Initialize Resume for default User (ID: 2)
    if (!localStorage.getItem('resume_2')) {
        const sampleEdu = [
            { institusi: "Universiti Malaya", bidang: "Ijazah Sarjana Muda Sains Komputer", tahun_mula: "2018", tahun_tamat: "2022" }
        ];
        const sampleWork = [
            { dari_hingga: "2022 - Kini", lokasi: "Tech Solutions Sdn Bhd, Kuala Lumpur", jawatan: "Senior Software Engineer", pencapaian: "Membangunkan API backend menggunakan Python yang mengurangkan masa tindak balas pelayan sebanyak 30%." },
            { dari_hingga: "2020 - 2022", lokasi: "WebCorp Ltd, Petaling Jaya", jawatan: "Junior Developer", pencapaian: "Membina dan mengoptimumkan modul-modul frontend menggunakan React dan Tailwind CSS." }
        ];
        const sampleCert = [
            { nama: "AWS Certified Solutions Architect - Associate", tahun: "2024" },
            { nama: "Scrum Alliance Certified ScrumMaster", tahun: "2023" }
        ];
        const sampleResume = {
            id: '2',
            user_id: '2',
            nama_penuh: "Ahmad Haikal Bin Ramli",
            alamat: "No. 12, Jalan Putra 4/2, Bandar Putra, 43000 Kajang, Selangor",
            no_ic: "991212-14-5679",
            email: "haikal.ramli@email.com",
            no_telefon: "+6012-3456789",
            ulasan: "Jurutera Perisian Kanan dengan pengalaman lebih daripada 4 tahun dalam membangunkan aplikasi web berskala besar menggunakan Python dan ekosistem moden. Berpengalaman luas dalam mengoptimumkan pangkalan data hubungan dan membina API berprestasi tinggi.",
            pendidikan: sampleEdu,
            pengalaman_kerja: sampleWork,
            sijil: sampleCert,
            kemahiran: "Python, JavaScript, Flask, React, SQL, Git, REST API, Agile Methodology",
            bahasa: "Bahasa Melayu (Ibu), Bahasa Inggeris (Profesional)",
            portfolio: "github.com/ats-demo-user",
            gambar_base64: ""
        };
        localStorage.setItem('resume_2', JSON.stringify(sampleResume));
    }
}

// Check current logged in user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if user is logged in
function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
    }
    return user;
}

// Check if admin is logged in
function checkAdminAuth() {
    const user = checkAuth();
    if (user.role !== 'admin') {
        alert('Akses ditolak! Sila log masuk sebagai pentadbir.');
        window.location.href = 'dashboard.html';
    }
    return user;
}

// Log out user
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Render dynamic navigation bar links
function renderNavbar() {
    const navContainer = document.getElementById('navbar-links');
    if (!navContainer) return;
    
    const user = getCurrentUser();
    if (user) {
        let adminBadge = user.role === 'admin' 
            ? '<a href="admin.html" class="text-sm font-medium text-slate-300 hover:text-white transition">Admin Panel</a>' 
            : '<a href="dashboard.html" class="text-sm font-medium text-slate-300 hover:text-white transition">Dashboard</a>';
        
        navContainer.innerHTML = `
            ${adminBadge}
            <span class="text-slate-600">|</span>
            <div class="flex items-center gap-3">
                <span class="text-xs text-slate-400">Log masuk: <strong class="text-slate-200">${user.username}</strong></span>
                <button onclick="logout()" class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-4 text-xs font-semibold text-white shadow hover:bg-slate-700 transition">Log Keluar</button>
            </div>
        `;
    } else {
        navContainer.innerHTML = `
            <a href="login.html" class="text-sm font-medium text-slate-300 hover:text-white transition">Log Masuk</a>
            <a href="register.html" class="inline-flex h-9 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/10 hover:bg-brand-500 hover:shadow-brand-500/20 transition">Daftar Percuma</a>
        `;
    }
}

// Initialize on script load
initStaticDB();
document.addEventListener('DOMContentLoaded', renderNavbar);
