// assets/js/script.js

// ========================================
// GLOBAL STATE & INITIALIZATION
// ========================================
let currentLang = 'en';
let currentTheme = 'light';
let siteData = null;
const API_URL = 'assets/data/data.json';

document.addEventListener('DOMContentLoaded', function() {
    // 1. Load preferences
    currentLang = localStorage.getItem('language') || 'en';
    currentTheme = localStorage.getItem('theme') || 'light';
    
    // 2. Apply theme and load data
    applyTheme(currentTheme);
    loadDataAndInitialize();
    
    // 3. Setup static interactions (Only needed for detail page interactions)
    setupContactForm();
});

// ========================================
// THEME & LANGUAGE MANAGERS
// ========================================

window.toggleTheme = function() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

window.toggleLanguage = function() {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('language', currentLang);
    // Karena ini halaman detail, kita panggil ulang fungsi detail
    loadDataAndInitialize(); 
}

function updateLanguageDisplay() {
    const langCode = currentLang === 'en' ? 'ID' : 'EN';
    
    const langTextElement = document.getElementById('langText');
    if (langTextElement) langTextElement.textContent = langCode;

    const footerLangText = document.getElementById('footerLangText');
    if (footerLangText) footerLangText.textContent = langCode;
}

// ========================================
// DATA LOADING & INITIALIZATION
// ========================================

async function loadDataAndInitialize() {
    try {
        // Menggunakan parameter acak untuk mencegah caching saat debugging
        const response = await fetch(API_URL + '?r=' + Math.random()); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        siteData = await response.json();
        
        // Hanya panggil loadProjectDetail karena kita hanya fokus pada halaman ini
        loadProjectDetail();
        
        updateLanguageDisplay();

    } catch (error) {
        console.error('Error loading site data:', error);
        // Tampilkan pesan error jika data gagal dimuat
        document.getElementById('projectTitle').textContent = 'Error: Data failed to load.';
    }
}

// ========================================
// PAGE LOADER: PROJECT DETAIL
// ========================================

function loadProjectDetail() {
    if (!siteData) return;
    
    const params = new URLSearchParams(window.location.search);
    const projectId = parseInt(params.get('id'));
    const project = siteData.projects.find(p => p.id === projectId);
    const texts = siteData.texts[currentLang];
    
    if (!project) {
        document.getElementById('projectTitle').textContent = texts.detail.not_found || 'Project Not Found';
        return;
    }

    // A. Metadata & Titles
    document.getElementById('pageTitle').textContent = `${project.title[currentLang]} - ${texts.detail.overview}`;
    document.getElementById('projectTitle').textContent = project.title[currentLang];
    document.getElementById('projectCategory').textContent = project.category;
    
    // B. Navbar & Footer Text
    loadNavbarLinks(texts.navbar, false); 
    document.getElementById('backBtn').textContent = texts.detail.back;
    document.getElementById('footerText').textContent = texts.footer;

    // C. Project Gallery (Carousel Utama - FPTF)
    loadProjectCarousel(project.images);

    // D. Project Details (Objektif/Masalah & Solusi)
    document.getElementById('overviewTitle').textContent = texts.detail.overview;
    document.getElementById('toolsUsedLabel').textContent = texts.detail.tools;
    document.getElementById('problemLabel').textContent = texts.detail.problem;
    document.getElementById('solutionLabel').textContent = texts.detail.solution;
    
    document.getElementById('projectProblem').textContent = project.problem[currentLang];
    document.getElementById('projectSolution').textContent = project.solution[currentLang];

    // E. Tools Used
    const toolsContainer = document.getElementById('projectTools');
    if (toolsContainer) {
        toolsContainer.innerHTML = '';
        project.tools.forEach(tool => {
            // Menggunakan kelas badge yang sudah dimodifikasi di CSS
            toolsContainer.innerHTML += `<span class="badge bg-light">${tool}</span>`;
        });
    }
    
    // F. Related Projects (Circular Carousel)
    document.getElementById('relatedTitle').textContent = texts.detail.related;
    const otherProjects = siteData.projects.filter(p => p.id !== projectId);
    loadRelatedProjectsCircularCarousel(otherProjects);

    // G. Contact Section
    document.getElementById('collabTitle').textContent = texts.detail.collab_title;
    updateFormPlaceholders(texts.form);
}

// ========================================
// CAROUSEL & UTILITIES
// ========================================

function loadProjectCarousel(images) {
    const container = document.getElementById('projectCarouselContainer');
    if (!container || images.length === 0) {
         if(container) container.innerHTML = `<p class="text-center text-muted mt-4">No images available for this project.</p>`;
         return;
    }

    let indicators = '';
    let items = '';

    images.forEach((img, index) => {
        const activeClass = index === 0 ? 'active' : '';
        indicators += `<button type="button" data-bs-target="#projectCarousel" data-bs-slide-to="${index}" class="${activeClass}" aria-label="Slide ${index + 1}"></button>`;
        items += `
            <div class="carousel-item ${activeClass}">
                <img src="assets/${img}" class="d-block w-100 project-detail-img rounded-4" alt="Project Image ${index + 1}">
            </div>
        `;
    });

    const carouselHtml = `
        <div id="projectCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-indicators">
                ${indicators}
            </div>
            <div class="carousel-inner rounded-4 shadow-lg">
                ${items}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    `;
    container.innerHTML = carouselHtml;
}


function loadRelatedProjectsCircularCarousel(projects) {
    const innerContainer = document.getElementById('relatedProjectsInner');
    const carouselElement = document.getElementById('relatedProjectsCarousel');
    if (!innerContainer || !carouselElement) return;
    
    innerContainer.innerHTML = '';

    if (projects.length === 0) {
        innerContainer.innerHTML = `<div class="p-5 text-center text-muted w-100">No other projects found to display.</div>`;
        return;
    }
    
    // Duplikasi proyek jika jumlahnya kurang dari 3 agar carousel terlihat full dan looping terasa
    let projectsToDisplay = [...projects];
    while (projectsToDisplay.length < 3 && projects.length > 0) {
        projectsToDisplay = projectsToDisplay.concat(projects);
    }
    
    // Tampilkan setidaknya 3 proyek per slide
    const itemsPerSlide = 3;
    const totalSlides = Math.ceil(projectsToDisplay.length / itemsPerSlide);
    
    for (let i = 0; i < totalSlides; i++) {
        const item = document.createElement('div');
        item.className = `carousel-item ${i === 0 ? 'active' : ''}`;
        
        let rowHtml = '<div class="row g-4">';
        
        for (let j = 0; j < itemsPerSlide; j++) {
            // Gunakan index modulo untuk efek circular/looping
            const projectIndex = (i * itemsPerSlide + j) % projectsToDisplay.length; 
            const project = projectsToDisplay[projectIndex];

            // Pastikan proyek ada untuk menghindari error
            if (project) {
                const title = project.title[currentLang];
                // Asumsi images[0] adalah thumbnail
                const imgSrc = 'assets/' + project.images[0]; 
                
                rowHtml += `
                    <div class="col-md-4 col-sm-12">
                        <a href="project-detail.html?id=${project.id}" class="text-decoration-none">
                            <div class="related-project-card">
                                <img src="${imgSrc}" class="related-project-img" alt="${title}">
                                <h6 class="fw-bold mt-2">${title}</h6>
                                <p class="small text-muted mb-0">${project.category}</p>
                            </div>
                        </a>
                    </div>
                `;
            }
        }
        rowHtml += '</div>';
        item.innerHTML = rowHtml;
        innerContainer.appendChild(item);
    }
    
    // Inisialisasi carousel dengan wrap: true untuk circular loop
    new bootstrap.Carousel(carouselElement, { wrap: true, interval: false });
}

function loadNavbarLinks(menuItems, useAnchors = true) {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    
    // Simpan link Admin (jika ada)
    const adminLinkLi = navMenu.querySelector('li a[href="update-data.html"]').closest('li');
    navMenu.innerHTML = '';
    
    const sections = ['home', 'about', 'projects', 'contact'];

    menuItems.forEach((item, index) => {
        // Tentukan apakah link menunjuk ke anchor di halaman yang sama atau di index.html
        const href = useAnchors ? '#' + sections[index] : 'index.html#' + sections[index];
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        
        if (!useAnchors && index === 0) { 
            // Untuk link Home (jika bukan di index.html), harus kembali ke index.html
            listItem.innerHTML = `<a class="nav-link" href="index.html">${item}</a>`;
        } else {
             listItem.innerHTML = `<a class="nav-link" href="${href}">${item}</a>`;
        }
       
        navMenu.appendChild(listItem);
    });

    if(adminLinkLi) navMenu.appendChild(adminLinkLi);
}

function updateFormPlaceholders(formTexts) {
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const messageInput = document.getElementById('messageInput');
    const sendBtnText = document.getElementById('sendBtnText');

    if (nameInput) nameInput.placeholder = formTexts.name;
    if (emailInput) emailInput.placeholder = formTexts.email;
    if (messageInput) messageInput.placeholder = formTexts.message;
    if (sendBtnText) sendBtnText.textContent = formTexts.send_button;
}

function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = currentLang === 'en' 
                ? 'Message sent successfully! (This is a static form placeholder.)' 
                : 'Pesan berhasil dikirim! (Ini adalah placeholder formulir statis.)';

            alert(message);
            form.reset();
        });
    }
}