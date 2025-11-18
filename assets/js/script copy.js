// assets/js/script.js

// ========================================
// GLOBAL STATE & INITIALIZATION
// ========================================
let currentLang = 'en';
let currentTheme = 'light';
let siteData = null;
const API_URL = 'assets/data/data.json';

document.addEventListener('DOMContentLoaded', function() {
    currentLang = localStorage.getItem('language') || 'en';
    currentTheme = localStorage.getItem('theme') || 'light';
    
    applyTheme(currentTheme);
    loadDataAndInitialize();
    setupNavbarScroll();
    setupContactForm();
});

// ========================================
// THEME MANAGER
// ========================================

window.toggleTheme = function() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
    setupNavbarScroll(); 
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ========================================
// DATA LOADING
// ========================================

async function loadDataAndInitialize() {
    try {
        const response = await fetch(API_URL + '?r=' + Math.random()); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        siteData = await response.json();
        
        const isDetailPage = window.location.pathname.includes('project-detail.html');
        const isUpdatePage = window.location.pathname.includes('update-data.html');
        
        if (isUpdatePage) {
            // Logic handled by embedded script in update-data.html
        } else if (isDetailPage) {
            loadProjectDetail();
        } else {
            loadHomePage();
        }
        
        updateLanguageDisplay();

    } catch (error) {
        console.error('Error loading site data:', error);
    }
}

// ========================================
// LANGUAGE MANAGER
// ========================================

window.toggleLanguage = function() {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('language', currentLang);
    
    const isDetailPage = window.location.pathname.includes('project-detail.html');
    if (isDetailPage) {
        loadProjectDetail();
    } else {
        loadHomePage();
    }
    
    updateLanguageDisplay();
}

function updateLanguageDisplay() {
    const langCode = currentLang === 'en' ? 'ID' : 'EN';
    
    const langTextElement = document.getElementById('langText');
    if (langTextElement) langTextElement.textContent = langCode;

    const footerLangText = document.getElementById('footerLangText');
    if (footerLangText) footerLangText.textContent = langCode;
}

// ========================================
// PAGE LOADERS
// ========================================

function loadHomePage() {
    if (!siteData) return;
    const texts = siteData.texts[currentLang];
    
    // 1. Navbar & Title
    document.getElementById('pageTitle').textContent = `Deva Adzny - ${texts.navbar[0]}`;
    loadNavbarLinks(texts.navbar);

    // 2. Hero Section
    document.getElementById('heroGreeting').textContent = texts.hero.greeting;
    document.getElementById('heroSubtitle').textContent = texts.hero.subtitle;
    document.getElementById('heroQuote').textContent = texts.hero.quote;
    document.getElementById('heroWorksBtnText').textContent = texts.hero.my_works_button;
    
    // 3. About Section
    document.getElementById('aboutTitle').textContent = texts.about.title;
    document.getElementById('aboutDesc').textContent = texts.about.description;
    document.getElementById('langLabel').textContent = texts.skills.languages;
    document.getElementById('toolsLabel').textContent = texts.skills.tools;
    
    // 4. Projects Section
    document.getElementById('projectsTitle').textContent = texts.projects_title;
    
    // Load Categories and initial Project Cards (All)
    loadCategoryFilters();
    loadProjectCards(siteData.projects, document.getElementById('projectsGrid'), false);

    // 5. Contact Section
    document.getElementById('contactTitle').textContent = texts.contact;
    updateFormPlaceholders(texts.form);

    // 6. Footer
    document.getElementById('footerText').textContent = texts.footer;
}

function loadProjectDetail() {
    if (!siteData) return;
    
    const params = new URLSearchParams(window.location.search);
    const projectId = parseInt(params.get('id'));
    const project = siteData.projects.find(p => p.id === projectId);
    const texts = siteData.texts[currentLang];
    
    if (!project) {
        document.getElementById('projectTitle').textContent = 'Project Not Found';
        return;
    }

    // 1. Navbar & Title
    document.getElementById('pageTitle').textContent = `${project.title[currentLang]} - ${texts.detail.overview}`;
    const navbar = document.getElementById('mainNav');
    navbar.classList.add('scrolled-normal');
    navbar.classList.remove('navbar-hero-top');
    loadNavbarLinks(texts.navbar, false); 

    // 2. Project Header
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.textContent = texts.detail.back;

    const projectTitle = document.getElementById('projectTitle');
    if (projectTitle) projectTitle.textContent = project.title[currentLang];

    const projectCategory = document.getElementById('projectCategory');
    if (projectCategory) projectCategory.textContent = project.category;
    
    // 3. Project Gallery (Carousel Utama)
    loadProjectCarousel(project.images);

    // 4. Project Details
    const overviewTitle = document.getElementById('overviewTitle');
    if (overviewTitle) overviewTitle.textContent = texts.detail.overview;

    const toolsUsedLabel = document.getElementById('toolsUsedLabel');
    if (toolsUsedLabel) toolsUsedLabel.textContent = texts.detail.tools;

    const problemLabel = document.getElementById('problemLabel');
    if (problemLabel) problemLabel.textContent = texts.detail.problem;
    
    const solutionLabel = document.getElementById('solutionLabel');
    if (solutionLabel) solutionLabel.textContent = texts.detail.solution;
    
    const projectProblem = document.getElementById('projectProblem');
    if (projectProblem) projectProblem.textContent = project.problem[currentLang];

    const projectSolution = document.getElementById('projectSolution');
    if (projectSolution) projectSolution.textContent = project.solution[currentLang];

    const toolsContainer = document.getElementById('projectTools');
    if (toolsContainer) {
        toolsContainer.innerHTML = '';
        project.tools.forEach(tool => {
            toolsContainer.innerHTML += `<span class="badge bg-light">${tool}</span>`;
        });
    }
    
    // 5. Related Projects (CIRCULAR CAROUSEL BARU)
    const relatedTitle = document.getElementById('relatedTitle');
    if (relatedTitle) relatedTitle.textContent = texts.detail.related;

    const otherProjects = siteData.projects.filter(p => p.id !== projectId);
    loadRelatedProjectsCircularCarousel(otherProjects);

    // 6. Contact Section
    const collabTitle = document.getElementById('collabTitle');
    if (collabTitle) collabTitle.textContent = texts.detail.collab_title;

    updateFormPlaceholders(texts.form);

    // 7. Footer
    const footerText = document.getElementById('footerText');
    if (footerText) footerText.textContent = texts.footer;
}


// ========================================
// PROJECT FILTERING LOGIC (Homepage)
// ========================================

function loadCategoryFilters() {
    if (!siteData || !siteData.projects) return;

    const filterContainer = document.getElementById('categoryFilters');
    filterContainer.innerHTML = '';
    
    // 1. Dapatkan daftar kategori unik
    const categories = [...new Set(siteData.projects.map(p => p.category))];
    
    // Terjemahan untuk tombol "All"
    const allText = currentLang === 'en' ? 'All' : 'Semua';

    // 2. Tambahkan tombol "All"
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = allText;
    allBtn.dataset.category = 'all';
    allBtn.onclick = () => filterProjects('all', allBtn);
    filterContainer.appendChild(allBtn);

    // 3. Tambahkan tombol kategori lainnya
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = category;
        btn.dataset.category = category;
        btn.onclick = () => filterProjects(category, btn);
        filterContainer.appendChild(btn);
    });
}

function filterProjects(category, clickedButton) {
    if (!siteData || !siteData.projects) return;

    // Hapus kelas 'active' dari semua tombol
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Tambahkan kelas 'active' pada tombol yang diklik
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    let filteredProjects = [];
    if (category === 'all') {
        filteredProjects = siteData.projects;
    } else {
        filteredProjects = siteData.projects.filter(p => p.category === category);
    }

    // Muat ulang kartu proyek
    loadProjectCards(filteredProjects, document.getElementById('projectsGrid'), false);
}


// ========================================
// RELATED PROJECTS CIRCULAR CAROUSEL (Detail Page)
// ========================================

function loadRelatedProjectsCircularCarousel(projects) {
    const innerContainer = document.getElementById('relatedProjectsInner');
    const carouselElement = document.getElementById('relatedProjectsCarousel');
    if (!innerContainer || !carouselElement) return;
    
    innerContainer.innerHTML = '';

    if (projects.length === 0) {
        innerContainer.innerHTML = `<div class="p-5 text-center text-muted w-100">Tidak ada proyek lain untuk ditampilkan.</div>`;
        carouselElement.classList.remove('slide');
        return;
    }
    
    // Duplikasi proyek jika jumlahnya kurang dari 3 untuk efek loop visual
    let projectsToDisplay = [...projects];
    while (projectsToDisplay.length < 3 && projects.length > 0) {
        projectsToDisplay = projectsToDisplay.concat(projects);
    }
    
    // Tampilkan setidaknya 3 proyek per slide (agar navigasi terasa)
    const itemsPerSlide = 3;
    const totalSlides = Math.ceil(projectsToDisplay.length / itemsPerSlide);
    
    for (let i = 0; i < totalSlides; i++) {
        const item = document.createElement('div');
        item.className = `carousel-item ${i === 0 ? 'active' : ''}`;
        
        // Buat baris untuk menampung kartu dalam satu slide
        let rowHtml = '<div class="row g-4">';
        
        for (let j = 0; j < itemsPerSlide; j++) {
            const projectIndex = (i * itemsPerSlide + j);
            const project = projectsToDisplay[projectIndex];

            // Pastikan proyek ada 
            if (project) {
                const title = project.title[currentLang];
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
    const bCarousel = new bootstrap.Carousel(carouselElement, { wrap: true, interval: false });
}

// ========================================
// HELPER FUNCTIONS
// ========================================

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

function loadNavbarLinks(menuItems, useAnchors = true) {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    
    const adminLinkLi = navMenu.querySelector('li a[href="update-data.html"]').closest('li');
    navMenu.innerHTML = '';
    
    const sections = ['home', 'about', 'projects', 'contact'];

    menuItems.forEach((item, index) => {
        const href = useAnchors ? '#' + sections[index] : 'index.html#' + sections[index];
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        
        if (!useAnchors && index === 0) { 
            listItem.innerHTML = `<a class="nav-link" href="index.html">${item}</a>`;
        } else {
             listItem.innerHTML = `<a class="nav-link" href="${href}">${item}</a>`;
        }
       
        navMenu.appendChild(listItem);
    });

    if(adminLinkLi) navMenu.appendChild(adminLinkLi);
}

function loadProjectCards(projects, container, isSmallCard) {
    if (!container) return;
    container.innerHTML = '';
    
    const colClass = isSmallCard ? 'col-lg-4 col-md-6' : 'col-lg-4 col-md-6';
    const buttonText = siteData.texts[currentLang].card_button;

    if (projects.length === 0) {
        container.innerHTML = `<div class="col-12"><p class="text-center text-muted p-5">Tidak ada proyek yang ditemukan dalam kategori ini.</p></div>`;
        return;
    }

    projects.forEach(project => {
        const title = project.title[currentLang];
        const desc = project.short_description[currentLang];
        const imgSrc = 'assets/' + project.images[0];
        
        const cardHtml = `
            <div class="${colClass}">
                <div class="project-card">
                    <img src="${imgSrc}" class="project-img" alt="${title}">
                    <div class="project-card-body">
                        <span class="project-category">${project.category}</span>
                        <h5>${title}</h5>
                        <p class="text-muted">${desc}</p>
                        <a href="project-detail.html?id=${project.id}" class="btn btn-sm btn-outline-primary rounded-pill mt-auto">
                            ${buttonText}
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

function loadProjectCarousel(images) {
    const container = document.getElementById('projectCarouselContainer');
    if (!container || images.length === 0) return;

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


// ========================================
// GLOBAL UI EFFECTS
// ========================================

function setupNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    if (!navbar) return;
    
    const isIndex = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    
    if (isIndex) {
        window.addEventListener('scroll', updateNavbarState);
        updateNavbarState();
    }
}

function updateNavbarState() {
    const navbar = document.getElementById('mainNav');
    if (!navbar) return;
    
    const scrolledClass = 'scrolled-normal';
    
    if (window.scrollY > window.innerHeight - navbar.offsetHeight) {
        navbar.classList.add(scrolledClass);
        navbar.classList.remove('navbar-hero-top');
        navbar.setAttribute('data-bs-theme', currentTheme === 'dark' ? 'dark' : 'light'); 
    } else {
        navbar.classList.remove(scrolledClass);
        navbar.classList.add('navbar-hero-top');
        navbar.setAttribute('data-bs-theme', 'dark'); 
    }

    updateNavbarColors();
}

function updateNavbarColors() {
    const navbar = document.getElementById('mainNav');
    if (!navbar) return;

    const isHeroTop = navbar.classList.contains('navbar-hero-top');

    let textColor = isHeroTop ? 'var(--hero-banner-text)' : 'var(--text-color)';
    let hoverColor = isHeroTop ? '#ffffff' : 'var(--primary)';
    let borderColor = isHeroTop ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-color)';


    navbar.querySelectorAll('.navbar-brand, .nav-link, .theme-toggle-btn').forEach(el => {
        el.style.color = textColor;
        el.addEventListener('mouseover', () => el.style.color = hoverColor);
        el.addEventListener('mouseout', () => el.style.color = textColor);
    });
    
    navbar.querySelectorAll('.lang-toggle .btn').forEach(btn => {
        btn.style.color = textColor;
        btn.style.borderColor = borderColor;
        btn.addEventListener('mouseover', () => btn.style.color = 'var(--hero-banner-bg)');
        btn.addEventListener('mouseout', () => btn.style.color = textColor);
    });
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