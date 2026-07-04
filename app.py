import re
import json
import os
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from peewee import SqliteDatabase, Model, CharField, TextField, ForeignKeyField, DateTimeField
from werkzeug.security import generate_password_hash, check_password_hash

# Inisialisasi Aplikasi Flask
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'ats-builder-secret-key-129847129')

# Inisialisasi Database SQLite
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.db')
db = SqliteDatabase(db_path)

# ==========================================
# MODEL PANGKALAN DATA (DATABASE MODELS)
# ==========================================

class BaseModel(Model):
    class Meta:
        database = db

class User(BaseModel):
    username = CharField(unique=True, max_length=50)
    email = CharField(unique=True, max_length=100)
    password_hash = CharField(max_length=255)
    role = CharField(max_length=10, default='user') # 'user' atau 'admin'
    created_at = DateTimeField(default=datetime.now)

class Resume(BaseModel):
    user = ForeignKeyField(User, backref='resumes', on_delete='CASCADE')
    nama_penuh = CharField(max_length=150)
    alamat = TextField()
    no_ic = CharField(max_length=14) # Validasi format: 123456-12-1234
    email = CharField(max_length=100)
    no_telefon = CharField(max_length=20)
    pendidikan = TextField() # Disimpan sebagai string JSON
    pengalaman_kerja = TextField() # Disimpan sebagai string JSON
    sijil = TextField() # Disimpan sebagai string JSON
    ulasan = TextField() # Summary profesional
    lain_lain = TextField() # Disimpan sebagai string JSON (Skills, Bahasa, Portfolio)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

# Sambungkan & Cipta Jadual jika belum wujud
def init_db():
    db.connect()
    db.create_tables([User, Resume], safe=True)
    
    # Seeding data pengguna lalai untuk tujuan ujian & demo
    if User.select().count() == 0:
        # Cipta Admin
        admin_pass = generate_password_hash('admin123')
        User.create(username='admin', email='admin@ats.com', password_hash=admin_pass, role='admin')
        
        # Cipta User Biasa
        user_pass = generate_password_hash('user123')
        test_user = User.create(username='user', email='user@ats.com', password_hash=user_pass, role='user')
        
        # Cipta Resume Contoh untuk User Biasa
        sample_edu = [
            {"institusi": "Universiti Malaya", "bidang": "Ijazah Sarjana Muda Sains Komputer", "tahun_mula": "2018", "tahun_tamat": "2022"}
        ]
        sample_work = [
            {"dari_hingga": "2022 - Kini", "lokasi": "Tech Solutions Sdn Bhd, Kuala Lumpur", "jawatan": "Senior Software Engineer"},
            {"dari_hingga": "2020 - 2022", "lokasi": "WebCorp Ltd, Petaling Jaya", "jawatan": "Junior Developer"}
        ]
        sample_cert = [
            {"nama": "AWS Certified Solutions Architect - Associate (2024)"},
            {"nama": "Scrum Alliance Certified ScrumMaster (2023)"}
        ]
        sample_other = {
            "kemahiran": "Python, JavaScript, Flask, React, SQL, Git, REST API, Agile Methodology",
            "bahasa": "Bahasa Melayu (Ibu), Bahasa Inggeris (Profesional)",
            "portfolio": "github.com/ats-demo-user"
        }
        
        Resume.create(
            user=test_user,
            nama_penuh="Ahmad Haikal Bin Ramli",
            alamat="No. 12, Jalan Putra 4/2, Bandar Putra, 43000 Kajang, Selangor",
            no_ic="991212-14-5679",
            email="haikal.ramli@email.com",
            no_telefon="+6012-3456789",
            pendidikan=json.dumps(sample_edu),
            pengalaman_kerja=json.dumps(sample_work),
            sijil=json.dumps(sample_cert),
            ulasan="Jurutera Perisian Kanan dengan pengalaman lebih daripada 4 tahun dalam membangunkan aplikasi web berskala besar menggunakan Python dan ekosistem moden. Berpengalaman luas dalam mengoptimumkan pangkalan data hubungan dan membina API berprestasi tinggi.",
            lain_lain=json.dumps(sample_other)
        )
    db.close()

# Inisialisasi DB semasa fail dimulakan
init_db()

# Hubungkan pangkalan data untuk setiap request
@app.before_request
def _db_connect():
    db.connect(reuse_if_open=True)

@app.teardown_request
def _db_close(exc):
    if not db.is_closed():
        db.close()

# ==========================================
# FILTER JINJA2 TERSUAI (CUSTOM FILTERS)
# ==========================================
@app.template_filter('json_decode')
def json_decode_filter(s):
    try:
        return json.loads(s)
    except:
        return []

@app.template_filter('json_decode_dict')
def json_decode_dict_filter(s):
    try:
        return json.loads(s)
    except:
        return {}

# ==========================================
# HALAMAN VIEW & LALUAN AUTH (VIEWS & ROUTES)
# ==========================================

@app.route('/')
def index():
    return render_template('landing.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('dashboard' if session['role'] == 'user' else 'admin_dashboard'))
        
    if request.method == 'POST':
        username = request.form.get('username').strip().lower()
        email = request.form.get('email').strip().lower()
        password = request.form.get('password')
        role = request.form.get('role', 'user') # Secara lalai adalah user
        
        # Validasi asas
        if not username or not email or not password:
            flash('Sila isi semua ruangan wajib!', 'danger')
            return render_template('register.html')
            
        if User.select().where((User.username == username) | (User.email == email)).exists():
            flash('Nama pengguna atau e-mel sudah berdaftar!', 'danger')
            return render_template('register.html')
            
        # Cipta pengguna baharu
        pw_hash = generate_password_hash(password)
        new_user = User.create(username=username, email=email, password_hash=pw_hash, role=role)
        
        # Sediakan draf resume kosong untuk pengguna biasa
        if role == 'user':
            Resume.create(
                user=new_user,
                nama_penuh="",
                alamat="",
                no_ic="",
                email="",
                no_telefon="",
                pendidikan=json.dumps([]),
                pengalaman_kerja=json.dumps([]),
                sijil=json.dumps([]),
                ulasan="",
                lain_lain=json.dumps({"kemahiran": "", "bahasa": "", "portfolio": ""})
            )
            
        flash('Pendaftaran berjaya! Sila log masuk.', 'success')
        return redirect(url_for('login'))
        
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard' if session['role'] == 'user' else 'admin_dashboard'))
        
    if request.method == 'POST':
        username = request.form.get('username').strip().lower()
        password = request.form.get('password')
        
        user = User.select().where(User.username == username).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['role'] = user.role
            
            if user.role == 'admin':
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('dashboard'))
        else:
            flash('Nama pengguna atau kata laluan salah!', 'danger')
            
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Anda telah log keluar dengan berjaya.', 'success')
    return redirect(url_for('login'))

# ==========================================
# PORTAL PENGGUNA (USER PORTAL)
# ==========================================

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session or session.get('role') != 'user':
        flash('Sila log masuk sebagai pengguna dahulu.', 'warning')
        return redirect(url_for('login'))
        
    # Ambil resume pengguna aktif
    resume = Resume.select().where(Resume.user_id == session['user_id']).first()
    return render_template('dashboard.html', resume=resume)

@app.route('/api/resume/save', methods=['POST'])
def save_resume():
    if 'user_id' not in session or session.get('role') != 'user':
        return jsonify({"status": "error", "message": "Tiada kebenaran akses."}), 403
        
    data = request.json
    
    # Validasi format No IC (******-**-****)
    no_ic = data.get('no_ic', '').strip()
    if no_ic and not re.match(r'^\d{6}-\d{2}-\d{4}$', no_ic):
        return jsonify({"status": "error", "message": "Format Nombor IC tidak sah! Format wajib: 123456-12-1234"}), 400
        
    # Ambil dan kemas kini
    try:
        resume = Resume.select().where(Resume.user_id == session['user_id']).first()
        if not resume:
            resume = Resume(user_id=session['user_id'])
            
        resume.nama_penuh = data.get('nama_penuh', '')
        resume.alamat = data.get('alamat', '')
        resume.no_ic = no_ic
        resume.email = data.get('email', '')
        resume.no_telefon = data.get('no_telefon', '')
        resume.ulasan = data.get('ulasan', '')
        
        # Tukar list/dict ke string JSON
        resume.pendidikan = json.dumps(data.get('pendidikan', []))
        resume.pengalaman_kerja = json.dumps(data.get('pengalaman_kerja', []))
        resume.sijil = json.dumps(data.get('sijil', []))
        resume.lain_lain = json.dumps({
            "kemahiran": data.get('kemahiran', ''),
            "bahasa": data.get('bahasa', ''),
            "portfolio": data.get('portfolio', ''),
            "gambar_base64": data.get('gambar_base64', '')
        })
        resume.updated_at = datetime.now()
        resume.save()
        
        return jsonify({"status": "success", "message": "Resume berjaya disimpan!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# PORTAL ADMIN (ADMIN PORTAL)
# ==========================================

@app.route('/admin')
def admin_dashboard():
    if 'user_id' not in session or session.get('role') != 'admin':
        flash('Akses ditolak! Sila log masuk sebagai pentadbir (Admin).', 'danger')
        return redirect(url_for('login'))
        
    # Admin boleh melihat semua resume
    resumes = Resume.select()
    return render_template('admin.html', resumes=resumes)

@app.route('/admin/resume/edit/<int:resume_id>')
def admin_edit_resume(resume_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        flash('Akses ditolak!', 'danger')
        return redirect(url_for('login'))
        
    resume = Resume.get_or_none(Resume.id == resume_id)
    if not resume:
        flash('Resume tidak ditemui.', 'danger')
        return redirect(url_for('admin_dashboard'))
        
    return render_template('dashboard.html', resume=resume, admin_mode=True)

@app.route('/api/admin/resume/save/<int:resume_id>', methods=['POST'])
def admin_save_resume(resume_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({"status": "error", "message": "Tiada kebenaran akses."}), 403
        
    data = request.json
    
    # Validasi format No IC (******-**-****)
    no_ic = data.get('no_ic', '').strip()
    if no_ic and not re.match(r'^\d{6}-\d{2}-\d{4}$', no_ic):
        return jsonify({"status": "error", "message": "Format Nombor IC tidak sah! Format wajib: 123456-12-1234"}), 400
        
    try:
        resume = Resume.get_or_none(Resume.id == resume_id)
        if not resume:
            return jsonify({"status": "error", "message": "Resume tidak ditemui."}), 404
            
        resume.nama_penuh = data.get('nama_penuh', '')
        resume.alamat = data.get('alamat', '')
        resume.no_ic = no_ic
        resume.email = data.get('email', '')
        resume.no_telefon = data.get('no_telefon', '')
        resume.ulasan = data.get('ulasan', '')
        
        resume.pendidikan = json.dumps(data.get('pendidikan', []))
        resume.pengalaman_kerja = json.dumps(data.get('pengalaman_kerja', []))
        resume.sijil = json.dumps(data.get('sijil', []))
        resume.lain_lain = json.dumps({
            "kemahiran": data.get('kemahiran', ''),
            "bahasa": data.get('bahasa', ''),
            "portfolio": data.get('portfolio', ''),
            "gambar_base64": data.get('gambar_base64', '')
        })
        resume.updated_at = datetime.now()
        resume.save()
        
        return jsonify({"status": "success", "message": "Resume berjaya disimpan oleh Admin!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Jalankan server Flask lokal di port 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
