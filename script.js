// ==================== CONFIG FIREBASE ====================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvSFA34Hab8psnXJUExO4pajga-13e5Cs",
  authDomain: "mcu-cyp-education.firebaseapp.com",
  projectId: "mcu-cyp-education",
  storageBucket: "mcu-cyp-education.firebasestorage.app",
  messagingSenderId: "547877876364",
  appId: "1:547877876364:web:447cb02f7ec911ccf641a9",
  measurementId: "G-5S3EYHL149"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// App State Data
let appData = {
    infosys: [],
    news: [],
    scholarships: [],
    advisors: [],
    contacts: [],
    curriculums: [],
    faqs: []
};

let isAdminLoggedIn = false;

// Navigation Switcher
function switchPage(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// ==================== AUTO-SEED DEFAULT DATA (สร้างข้อมูลเริ่มต้นลง Firestore ให้แก้ไข/ลบได้จริง) ====================
function seedDefaultDataIfNeeded() {
    // 1. ตรวจสอบและเพิ่มข้อมูลทำเนียบอาจารย์ 15 ท่าน
    db.collection('advisors').get().then(snapshot => {
        if (snapshot.empty) {
            for (let i = 1; i <= 15; i++) {
                db.collection('advisors').add({
                    name: `รศ.ดร.พระมหาสมชาย ${i}`,
                    title: 'อาจารย์ประจำหลักสูตร',
                    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60'
                });
            }
        }
    });

    // 2. ตรวจสอบและเพิ่มหลักสูตร
    db.collection('curriculums').get().then(snapshot => {
        if (snapshot.empty) {
            const defaultCurriculums = [
                { name: 'พุทธศาสตรบัณฑิต (พธ.บ.)', detail: 'สาขาวิชาพระพุทธศาสนา เน้นการศึกษาปริยัติธรรมและบูรณาการการเผยแผ่พระพุทธศาสนา', badge: 'ปริญญาตรี 4 ปี' },
                { name: 'บริหารธุรกิจบัณฑิต (บธ.บ.)', detail: 'สาขาวิชาการจัดการเชิงพุทธ ประยุกต์หลักธรรมกับการบริหารจัดการธุรกิจสมัยใหม่', badge: 'ปริญญาตรี 4 ปี' },
                { name: 'รัฐศาสตรบัณฑิต (ร.บ.)', detail: 'สาขาวิชารัฐศาสตร์ หลักสูตรการปกครองท้องถิ่นและการพัฒนาชุมชนตามแนวพุทธศาสตร์', badge: 'ปริญญาตรี 4 ปี' }
            ];
            defaultCurriculums.forEach(item => db.collection('curriculums').add(item));
        }
    });

    // 3. ตรวจสอบและเพิ่มระบบสารสนเทศ
    db.collection('infosys').get().then(snapshot => {
        if (snapshot.empty) {
            const defaultInfosys = [
                { title: 'ระบบบริการการศึกษา', desc: 'งานทะเบียนและผลการเรียน', link: '#', icon: 'fa-book-open-reader' },
                { title: 'ระบบทุนเล่าเรียนหลวง', desc: 'ข้อมูลและตรวจสอบสถานะทุน', link: '#', icon: 'fa-award' },
                { title: 'ระบบปฏิบัติศาสนกิจ', desc: 'บันทึกและติดตามผลศาสนกิจ', link: '#', icon: 'fa-om' }
            ];
            defaultInfosys.forEach(item => db.collection('infosys').add(item));
        }
    });

    // 4. ตรวจสอบและเพิ่มช่องทางติดต่อ
    db.collection('contacts').get().then(snapshot => {
        if (snapshot.empty) {
            const defaultContacts = [
                { title: 'เว็บไซต์หลัก', subtitle: 'cyp.mcu.ac.th', link: 'https://cyp.mcu.ac.th', icon: 'fa-globe', color: 'bg-mcuRed' },
                { title: 'Facebook Page', subtitle: 'มจร.ชัยภูมิ', link: 'https://facebook.com', icon: 'fa-facebook-f', color: 'bg-blue-600' },
                { title: 'Line Official', subtitle: '@mcu.cyp', link: 'https://line.me', icon: 'fa-line', color: 'bg-green-500' }
            ];
            defaultContacts.forEach(item => db.collection('contacts').add(item));
        }
    });
}

// ==================== FETCH DATA FROM FIRESTORE ====================
function initFirestoreListeners() {
    db.collection('infosys').onSnapshot(snapshot => {
        appData.infosys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderInfoSys();
    });

    db.collection('news').onSnapshot(snapshot => {
        appData.news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderNews();
    });

    db.collection('scholarships').onSnapshot(snapshot => {
        appData.scholarships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderScholarships();
    });

    db.collection('advisors').onSnapshot(snapshot => {
        appData.advisors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAdvisors();
    });

    db.collection('contacts').onSnapshot(snapshot => {
        appData.contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderContacts();
    });

    db.collection('curriculums').onSnapshot(snapshot => {
        appData.curriculums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCurriculums();
    });

    db.collection('faqs').onSnapshot(snapshot => {
        appData.faqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFaqs();
    });
}

// ==================== RENDER FUNCTIONS ====================
function renderInfoSys() {
    const grid = document.getElementById('infosys-grid');
    const adminList = document.getElementById('admin-infosys-list');

    grid.innerHTML = appData.infosys.map(item => `
        <a href="${item.link || '#'}" target="_blank" class="group bg-white p-6 rounded-xl border-2 border-mcuPink shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col items-center text-center">
            <div class="w-14 h-14 bg-pink-100 text-mcuPink rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-mcuPink group-hover:text-white transition">
                <i class="fa-solid ${item.icon || 'fa-globe'}"></i>
            </div>
            <h4 class="font-bold text-gray-800 text-lg group-hover:text-mcuPink transition">${item.title}</h4>
            <p class="text-xs text-gray-500 mt-1">${item.desc || ''}</p>
        </a>
    `).join('');

    if (adminList) {
        adminList.innerHTML = appData.infosys.map(item => `
            <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                    <span class="font-medium text-sm text-gray-800 block">${item.title}</span>
                    <span class="text-xs text-gray-500">ลิงก์: ${item.link}</span>
                </div>
                <div class="space-x-2">
                    <button onclick="openInfoSysModal('${item.id}')" class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm font-semibold">แก้ไข</button>
                    <button onclick="deleteItem('infosys', '${item.id}')" class="text-red-600 bg-red-50 px-2 py-1 rounded text-sm font-semibold">ลบ</button>
                </div>
            </div>
        `).join('');
    }
}

function renderNews() {
    const grid = document.getElementById('news-grid');
    const adminList = document.getElementById('admin-news-list');
    
    grid.innerHTML = appData.news.map(item => `
        <div onclick="viewNewsDetail('${item.id}')" class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition cursor-pointer">
            <img src="${item.image}" alt="${item.title}" class="w-full h-48 object-cover">
            <div class="p-5">
                <h4 class="font-bold text-gray-800 text-base mb-2 line-clamp-2">${item.title}</h4>
                <span class="text-mcuRed text-sm font-semibold hover:underline flex items-center space-x-1">
                    <span>อ่านรายละเอียด</span> <i class="fa-solid fa-arrow-right text-xs"></i>
                </span>
            </div>
        </div>
    `).join('');

    if (adminList) {
        adminList.innerHTML = appData.news.map(item => `
            <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" class="w-12 h-12 rounded object-cover">
                    <span class="font-medium text-sm text-gray-800">${item.title}</span>
                </div>
                <div class="space-x-2">
                    <button onclick="openNewsModal('${item.id}')" class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm font-semibold">แก้ไข</button>
                    <button onclick="deleteItem('news', '${item.id}')" class="text-red-600 bg-red-50 px-2 py-1 rounded text-sm font-semibold">ลบ</button>
                </div>
            </div>
        `).join('');
    }
}

function viewNewsDetail(id) {
    const item = appData.news.find(n => n.id === id);
    if (!item) return;

    document.getElementById('detail-news-title').innerText = item.title;
    document.getElementById('detail-news-image').src = item.image;
    document.getElementById('detail-news-content').innerHTML = `<p>${item.content || item.title}</p>`;
    switchPage('news-detail');
}

function renderScholarships() {
    const grid = document.getElementById('scholarship-grid');
    const adminList = document.getElementById('admin-scholarship-list');

    grid.innerHTML = appData.scholarships.map(item => `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-300 hover:shadow-md transition flex flex-col">
            <img src="${item.image}" alt="${item.name}" class="w-full h-40 object-cover border-b border-gray-200">
            <div class="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <span class="text-xs bg-red-50 text-mcuRed px-2.5 py-1 rounded-full font-semibold">${item.source}</span>
                    <h4 class="font-bold text-gray-800 text-sm mt-2 line-clamp-2">${item.name}</h4>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.detail}</p>
                </div>
                <a href="${item.link || '#'}" target="_blank" class="mt-4 w-full text-center bg-mcuRed/10 text-mcuRed hover:bg-mcuRed hover:text-white py-2 rounded-lg text-xs font-semibold transition block">รายละเอียดทุน</a>
            </div>
        </div>
    `).join('');

    if (adminList) {
        adminList.innerHTML = appData.scholarships.map(item => `
            <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" class="w-12 h-12 rounded object-cover">
                    <div>
                        <span class="font-medium text-sm text-gray-800 block">${item.name}</span>
                        <span class="text-xs text-gray-500">${item.source}</span>
                    </div>
                </div>
                <div class="space-x-2">
                    <button onclick="openScholarshipModal('${item.id}')" class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm font-semibold">แก้ไข</button>
                    <button onclick="deleteItem('scholarships', '${item.id}')" class="text-red-600 bg-red-50 px-2 py-1 rounded text-sm font-semibold">ลบ</button>
                </div>
            </div>
        `).join('');
    }
}

function renderAdvisors() {
    const grid = document.getElementById('advisors-grid');
    const adminList = document.getElementById('admin-advisors-list');

    grid.innerHTML = appData.advisors.map(adv => `
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center hover:shadow-md transition">
            <img src="${adv.image}" alt="${adv.name}" class="w-20 h-20 rounded-full mx-auto object-cover mb-3 border-2 border-mcuRed">
            <h4 class="font-bold text-sm text-gray-800">${adv.name}</h4>
            <p class="text-xs text-gray-500 mt-1">${adv.title}</p>
        </div>
    `).join('');

    if (adminList) {
        adminList.innerHTML = appData.advisors.map(adv => `
            <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <img src="${adv.image}" class="w-12 h-12 rounded-full object-cover">
                    <div>
                        <span class="font-medium text-sm text-gray-800 block">${adv.name}</span>
                        <span class="text-xs text-gray-500">${adv.title}</span>
                    </div>
                </div>
                <div class="space-x-2">
                    <button onclick="openAdvisorModal('${adv.id}')" class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm font-semibold">แก้ไข</button>
                    <button onclick="deleteItem('advisors', '${adv.id}')" class="text-red-600 bg-red-50 px-2 py-1 rounded text-sm font-semibold">ลบ</button>
                </div>
            </div>
        `).join('');
    }
}

function renderContacts() {
    const grid = document.getElementById('contacts-grid');
    const adminList = document.getElementById('admin-contacts-list');

    grid.innerHTML = appData.contacts.map(c => `
        <a href="${c.link}" target="_blank" class="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition border">
            <div class="w-12 h-12 ${c.color || 'bg-mcuRed'} text-white rounded-lg flex items-center justify-center text-xl"><i class="fa-solid ${c.icon || 'fa-link'}"></i></div>
            <div>
                <h4 class="font-bold text-gray-800">${c.title}</h4>
                <p class="text-xs text-gray-500">${c.subtitle}</p>
            </div>
        </a>
    `).join('');

    if (adminList) {
        adminList.innerHTML = appData.contacts.map(c => `
            <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                    <span class="font-medium text-sm text-gray-800 block">${c.title} (${c.subtitle})</span>
                    <span class="text-xs text-gray-500">ลิงก์: ${c.link}</span>
                </div>
                <div class="space-x-2">
                    <button onclick="openContactModal('${c.id}')" class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm font-semibold">แก้ไข</button>
                    <button onclick="deleteItem('contacts', '${c.id}')" class="text-red-600 bg-red-50 px-2 py-1 rounded text-sm font-semibold">ลบ</button>
                </div>
            </div>
        `).join('');
    }
}

function renderCurriculums() {
    const grid = document.getElementById('curriculums-grid');
    const adminList = document.getElementById('admin-curriculums-list');

    grid.innerHTML = appData.curriculums.map(item => `
        <div class="bg-white p-6 rounded-xl shadow border-t-4 border-mcuRed">
            <h3 class="font-bold text-xl text-gray-900 mb-2">${item.name}</h3>
            <p class="text-gray-600 text-sm mb-4">${item.detail}</p>
            <span class="text-xs bg-red-100 text-mcuRed px-3 py-1 rounded-full font-semibold">${item.badge}</span>
        </div>
    `).join('');

    if (adminList) {
        adminList.innerHTML = appData.curriculums.map(item => `
            <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                    <span class="font-medium text-sm text-gray-800 block">${item.name}</span>
                    <span class="text-xs text-gray-500">${item.detail}</span>
                </div>
                <div class="space-x-2">
                    <button onclick="openCurriculumModal('${item.id}')" class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm font-semibold">แก้ไข</button>
                    <button onclick="deleteItem('curriculums', '${item.id}')" class="text-red-600 bg-red-50 px-2 py-1 rounded text-sm font-semibold">ลบ</button>
                </div>
            </div>
        `).join('');
    }
}

function renderFaqs() {
    const tbody = document.getElementById('faq-table-body');
    const adminList = document.getElementById('admin-faq-list');

    tbody.innerHTML = appData.faqs.map((faq, index) => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-800">
                <strong class="block mb-1">${index + 1}. ${faq.question}</strong>
                <span class="text-gray-500 italic text-xs block">${faq.answer}</span>
            </td>
        </tr>
    `).join('');

    if (adminList) {
        adminList.innerHTML = appData.faqs.map(faq => `
            <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                    <span class="font-medium text-sm text-gray-800 block">${faq.question}</span>
                    <span class="text-xs text-gray-500 italic">${faq.answer}</span>
                </div>
                <div class="space-x-2 flex items-center">
                    <button onclick="openFaqModal('${faq.id}')" class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm font-semibold">แก้ไข</button>
                    <button onclick="deleteItem('faqs', '${faq.id}')" class="text-red-600 bg-red-50 px-2 py-1 rounded text-sm font-semibold">ลบ</button>
                </div>
            </div>
        `).join('');
    }
}

// Animated Counters
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const speed = target / 30;
        const updateCount = () => {
            count += speed;
            if (count < target) {
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 40);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// ==================== FIREBASE AUTH ====================
function openLoginModal() { document.getElementById('login-modal').classList.remove('hidden'); }
function closeLoginModal() { document.getElementById('login-modal').classList.add('hidden'); }

auth.onAuthStateChanged((user) => {
    const authBtn = document.getElementById('auth-action-btn');
    const adminActions = [
        'admin-infosys-action', 'admin-news-action', 'admin-scholarship-action', 
        'admin-advisor-action', 'admin-contact-action', 'admin-curriculum-action', 'admin-faq-action'
    ];

    if (user) {
        isAdminLoggedIn = true;
        if (authBtn) {
            authBtn.innerHTML = `<i class="fa-solid fa-user-shield"></i> <span>หลังบ้าน (${user.email})</span>`;
            authBtn.className = "bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow transition flex items-center space-x-2 text-sm font-medium";
        }
        adminActions.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden');
        });
    } else {
        isAdminLoggedIn = false;
        if (authBtn) {
            authBtn.innerHTML = `<i class="fa-solid fa-lock"></i> <span>ล็อกอินแอดมิน</span>`;
            authBtn.className = "bg-mcuRed hover:bg-red-900 text-white px-4 py-2 rounded-lg shadow transition flex items-center space-x-2 text-sm font-medium";
        }
        adminActions.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
    }
});

function handleAuthBtnClick() {
    if (isAdminLoggedIn) {
        switchPage('admin-dashboard');
    } else {
        openLoginModal();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-password').value;
    
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            closeLoginModal();
            alert('ล็อกอินสำเร็จ!');
            switchPage('admin-dashboard');
        })
        .catch(err => alert('ล็อกอินไม่สำเร็จ: ' + err.message));
}

function adminLogout() {
    auth.signOut().then(() => {
        switchPage('home');
        alert('ออกจากระบบแล้ว');
    });
}

function switchAdminTab(tabName) {
    ['infosys', 'news', 'scholarship', 'advisors', 'contacts', 'curriculums', 'faq'].forEach(t => {
        document.getElementById(`admin-tab-${t}`).classList.add('hidden');
        document.getElementById(`tab-btn-${t}`).classList.remove('text-mcuRed', 'border-b-2', 'border-mcuRed', 'font-semibold');
        document.getElementById(`tab-btn-${t}`).classList.add('text-gray-500');
    });
    document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-btn-${tabName}`).classList.add('text-mcuRed', 'border-b-2', 'border-mcuRed', 'font-semibold');
    document.getElementById(`tab-btn-${tabName}`).classList.remove('text-gray-500');
}

// ==================== CRUD MODALS & SUBMISSIONS ====================
function closeCrudModal() { document.getElementById('crud-modal').classList.add('hidden'); }

function openInfoSysModal(id = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('crud-type').value = 'infosys';
    document.getElementById('crud-id').value = id || '';
    document.getElementById('crud-modal-title').innerText = id ? 'แก้ไขระบบสารสนเทศ' : 'เพิ่มระบบสารสนเทศ';
    const item = id ? appData.infosys.find(i => i.id === id) : { title: '', desc: '', link: '', icon: 'fa-globe' };
    document.getElementById('crud-form-fields').innerHTML = `
        <div><label class="block text-xs font-semibold mb-1">ชื่อระบบ</label><input type="text" id="is-title" required value="${item.title || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">คำอธิบายสั้น</label><input type="text" id="is-desc" required value="${item.desc || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">ลิงก์เว็บไซต์ (URL)</label><input type="url" id="is-link" required value="${item.link || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">FontAwesome Icon (เช่น fa-award)</label><input type="text" id="is-icon" required value="${item.icon || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
    `;
}

function openNewsModal(id = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('crud-type').value = 'news';
    document.getElementById('crud-id').value = id || '';
    document.getElementById('crud-modal-title').innerText = id ? 'แก้ไขข่าวประชาสัมพันธ์' : 'เพิ่มข่าวประชาสัมพันธ์';
    const item = id ? appData.news.find(n => n.id === id) : { title: '', image: '', content: '' };
    document.getElementById('crud-form-fields').innerHTML = `
        <div><label class="block text-xs font-semibold mb-1">หัวข้อข่าว</label><input type="text" id="news-title" required value="${item.title || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">ลิงก์รูปภาพ</label><input type="url" id="news-image" required value="${item.image || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">เนื้อหาข่าวรายละเอียด</label><textarea id="news-content" required class="w-full px-3 py-2 border rounded text-sm h-32">${item.content || ''}</textarea></div>
    `;
}

function openScholarshipModal(id = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('crud-type').value = 'scholarships';
    document.getElementById('crud-id').value = id || '';
    document.getElementById('crud-modal-title').innerText = id ? 'แก้ไขทุนการศึกษา' : 'เพิ่มทุนการศึกษา';
    const item = id ? appData.scholarships.find(s => s.id === id) : { name: '', source: '', detail: '', image: '', link: '' };
    document.getElementById('crud-form-fields').innerHTML = `
        <div><label class="block text-xs font-semibold mb-1">ชื่อทุน</label><input type="text" id="sch-name" required value="${item.name || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">แหล่งทุน</label><input type="text" id="sch-source" required value="${item.source || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">รายละเอียด</label><textarea id="sch-detail" required class="w-full px-3 py-2 border rounded text-sm">${item.detail || ''}</textarea></div>
        <div><label class="block text-xs font-semibold mb-1">ลิงก์รูปภาพ</label><input type="url" id="sch-image" required value="${item.image || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">ลิงก์รายละเอียดทุน</label><input type="url" id="sch-link" required value="${item.link || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
    `;
}

function openAdvisorModal(id = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('crud-type').value = 'advisors';
    document.getElementById('crud-id').value = id || '';
    document.getElementById('crud-modal-title').innerText = id ? 'แก้ไขข้อมูลอาจารย์' : 'เพิ่มข้อมูลอาจารย์';
    const item = id ? appData.advisors.find(a => a.id === id) : { name: '', title: '', image: '' };
    document.getElementById('crud-form-fields').innerHTML = `
        <div><label class="block text-xs font-semibold mb-1">ชื่อ-นามสกุล (พร้อมตำแหน่ง)</label><input type="text" id="adv-name" required value="${item.name || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">ตำแหน่งหน้าที่</label><input type="text" id="adv-title" required value="${item.title || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">ลิงก์รูปภาพอาจารย์</label><input type="url" id="adv-image" required value="${item.image || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
    `;
}

function openContactModal(id = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('crud-type').value = 'contacts';
    document.getElementById('crud-id').value = id || '';
    document.getElementById('crud-modal-title').innerText = id ? 'แก้ไขช่องทางติดต่อ' : 'เพิ่มช่องทางติดต่อ';
    const item = id ? appData.contacts.find(c => c.id === id) : { title: '', subtitle: '', link: '', icon: 'fa-globe' };
    document.getElementById('crud-form-fields').innerHTML = `
        <div><label class="block text-xs font-semibold mb-1">ชื่อช่องทาง (เช่น Facebook)</label><input type="text" id="con-title" required value="${item.title || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">รายละเอียดข้อความ (เช่น @mcu.cyp)</label><input type="text" id="con-subtitle" required value="${item.subtitle || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">ลิงก์ URL</label><input type="url" id="con-link" required value="${item.link || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">FontAwesome Icon</label><input type="text" id="con-icon" required value="${item.icon || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
    `;
}

function openCurriculumModal(id = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('crud-type').value = 'curriculums';
    document.getElementById('crud-id').value = id || '';
    document.getElementById('crud-modal-title').innerText = id ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตร';
    const item = id ? appData.curriculums.find(c => c.id === id) : { name: '', detail: '', badge: 'ปริญญาตรี 4 ปี' };
    document.getElementById('crud-form-fields').innerHTML = `
        <div><label class="block text-xs font-semibold mb-1">ชื่อหลักสูตร</label><input type="text" id="cur-name" required value="${item.name || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">รายละเอียดหลักสูตร</label><textarea id="cur-detail" required class="w-full px-3 py-2 border rounded text-sm">${item.detail || ''}</textarea></div>
        <div><label class="block text-xs font-semibold mb-1">ป้ายกำกับระยะเวลา (Badge)</label><input type="text" id="cur-badge" required value="${item.badge || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
    `;
}

function openFaqModal(id = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('crud-type').value = 'faqs';
    document.getElementById('crud-id').value = id || '';
    document.getElementById('crud-modal-title').innerText = id ? 'แก้ไข FAQ' : 'เพิ่ม FAQ';
    const item = id ? appData.faqs.find(f => f.id === id) : { question: '', answer: '' };
    document.getElementById('crud-form-fields').innerHTML = `
        <div><label class="block text-xs font-semibold mb-1">คำถาม</label><input type="text" id="faq-q" required value="${item.question || ''}" class="w-full px-3 py-2 border rounded text-sm"></div>
        <div><label class="block text-xs font-semibold mb-1">คำตอบ (แสดงเป็นตัวเอียง)</label><textarea id="faq-a" required class="w-full px-3 py-2 border rounded text-sm italic">${item.answer || ''}</textarea></div>
    `;
}

function handleCrudSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('crud-type').value;
    const id = document.getElementById('crud-id').value;

    let dataToSave = {};

    if (type === 'infosys') {
        dataToSave.title = document.getElementById('is-title').value;
        dataToSave.desc = document.getElementById('is-desc').value;
        dataToSave.link = document.getElementById('is-link').value;
        dataToSave.icon = document.getElementById('is-icon').value;
    } else if (type === 'news') {
        dataToSave.title = document.getElementById('news-title').value;
        dataToSave.image = document.getElementById('news-image').value;
        dataToSave.content = document.getElementById('news-content').value;
    } else if (type === 'scholarships') {
        dataToSave.name = document.getElementById('sch-name').value;
        dataToSave.source = document.getElementById('sch-source').value;
        dataToSave.detail = document.getElementById('sch-detail').value;
        dataToSave.image = document.getElementById('sch-image').value;
        dataToSave.link = document.getElementById('sch-link').value;
    } else if (type === 'advisors') {
        dataToSave.name = document.getElementById('adv-name').value;
        dataToSave.title = document.getElementById('adv-title').value;
        dataToSave.image = document.getElementById('adv-image').value;
    } else if (type === 'contacts') {
        dataToSave.title = document.getElementById('con-title').value;
        dataToSave.subtitle = document.getElementById('con-subtitle').value;
        dataToSave.link = document.getElementById('con-link').value;
        dataToSave.icon = document.getElementById('con-icon').value;
    } else if (type === 'curriculums') {
        dataToSave.name = document.getElementById('cur-name').value;
        dataToSave.detail = document.getElementById('cur-detail').value;
        dataToSave.badge = document.getElementById('cur-badge').value;
    } else if (type === 'faqs') {
        dataToSave.question = document.getElementById('faq-q').value;
        dataToSave.answer = document.getElementById('faq-a').value;
    }

    if (id) {
        db.collection(type).doc(id).update(dataToSave).then(() => {
            closeCrudModal();
            alert('อัปเดตข้อมูลสำเร็จ!');
        }).catch(err => alert('Error: ' + err.message));
    } else {
        db.collection(type).add(dataToSave).then(() => {
            closeCrudModal();
            alert('เพิ่มข้อมูลสำเร็จ!');
        }).catch(err => alert('Error: ' + err.message));
    }
}

function deleteItem(type, id) {
    if (confirm('คุณต้องการลบข้อมูลนี้หรือไม่?')) {
        db.collection(type).doc(id).delete().then(() => {
            alert('ลบข้อมูลสำเร็จ!');
        }).catch(err => alert('Error: ' + err.message));
    }
}

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    seedDefaultDataIfNeeded(); // ทำการสร้างข้อมูลเริ่มต้นลง Firestore หากยังไม่มี
    initFirestoreListeners();
    initCounters();
});