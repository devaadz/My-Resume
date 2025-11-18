// ===================================
// GLOBAL STATE
// ===================================
let currentLang = 'id';
let currentTheme = 'light';
let siteData = null;
let currentProject = null;

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
    // Load preferences
    currentLang = localStorage.getItem('language') || 'id';
    currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme
    applyTheme(currentTheme);
    
    // Load data
    await loadData();
    
    // Initialize page
    initializeDetailPage();
    
    // Setup event listeners
    setupEventListeners();
});

// ===================================
// DATA LOADING
// ===================================
async function loadData() {
    try {
        const response = await fetch('assets/data/data.json');
        if (!response.ok) throw new Error('Failed to load data');
        siteData = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        showErrorMessage();
        return false;
    }
}

function showErrorMessage() {
    const container = document.querySelector('.project-header-section .container');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> Gagal memuat data proyek. Silakan refresh halaman atau kembali ke beranda.
                <div class="mt-3">
                    <a href="index.html" class="btn btn-primary">Kembali ke Beranda</a>
                </div>
            </div>
        `;
    }
}

// ===================================
// PAGE INITIALIZATION
// ===================================
function initializeDetailPage() {
    if (!siteData) return;
    
    // Get project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = parseInt(urlParams.get('id'));
    
    if (!projectId) {
        showProjectNotFound();
        return;
    }
    
    // Find project
    currentProject = siteData.projects.find(p => p.id === projectId);
    
    if (!currentProject) {
        showProjectNotFound();
        return;
    }
    
    // Load all sections
    const texts = siteData.texts[currentLang];
    loadNavbar(texts);
    loadBreadcrumb(texts);
    loadProjectHeader();
    loadProjectGallery();
    loadProjectDetails(texts);
    loadRelatedProjects(texts);
    loadCTA(texts);
    loadFooter(texts);
    
    // Update language display
    updateLanguageDisplay();
}

function showProjectNotFound() {
    const container = document.querySelector('.project-header-section .container');
    const notFoundText = currentLang === 'id' 
        ? {
            title: 'Proyek Tidak Ditemukan',
            desc: 'Maaf, proyek yang Anda cari tidak tersedia atau telah dihapus.',
            button: 'Kembali ke Proyek'
        }
        : {
            title: 'Project Not Found',
            desc: 'Sorry, the project you are looking for is not available or has been removed.',
            button: 'Back to Projects'
        };
    
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-folder-open" style="font-size: 5rem; color: var(--text-secondary); opacity: 0.5;"></i>
            <h2 class="mt-4">${notFoundText.title}</h2>
            <p class="text-muted mb-4">${notFoundText.desc}</p>
            <a href="index.html#projects" class="btn btn-primary rounded-pill px-4">
                <i class="fas fa-arrow-left me-2"></i>${notFoundText.button}
            </a>
        </div>
    `;
}

// ===================================
// NAVBAR
// ===================================
function loadNavbar(texts) {
    const navMenu = document.getElementById('navMenu');
    const navItems = texts.navbar;
    const sections = ['home', 'about', 'projects', 'contact'];
    
    navMenu.innerHTML = '';
    
    navItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `
            <a class="nav-link" href="index.html#${sections[index]}">${item}</a>
        `;
        navMenu.appendChild(li);
    });
}

// ===================================
// BREADCRUMB
// ===================================
function loadBreadcrumb(texts) {
    const breadcrumbHome = document.getElementById('breadcrumbHome');
    const breadcrumbProjects = document.getElementById('breadcrumbProjects');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    
    if (breadcrumbHome) {
        breadcrumbHome.textContent = texts.navbar[0]; // Home
    }
    if (breadcrumbProjects) {
        breadcrumbProjects.textContent = texts.navbar[2]; // Projects
    }
    if (breadcrumbCurrent && currentProject) {
        breadcrumbCurrent.textContent = currentProject.title[currentLang];
    }
}

// ===================================
// PROJECT HEADER
// ===================================
function loadProjectHeader() {
    document.getElementById('pageTitle').textContent = 
        `${currentProject.title[currentLang]} - Deva Adzny`;
    document.getElementById('projectCategory').textContent = currentProject.category;
    document.getElementById('projectTitle').textContent = currentProject.title[currentLang];
    document.getElementById('projectShortDesc').textContent = 
        currentProject.short_description[currentLang];
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.textContent = currentLang === 'id' ? 'Kembali ke Proyek' : 'Back to Projects';
    }
}

// ===================================
// PROJECT GALLERY
// ===================================
function loadProjectGallery() {
    const container = document.getElementById('projectCarouselContainer');
    const images = currentProject.images;
    
    if (!images || images.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted p-5">
                <i class="fas fa-image" style="font-size: 3rem;"></i>
                <p class="mt-3">Tidak ada gambar tersedia untuk proyek ini.</p>
            </div>
        `;
        return;
    }
    
    let indicators = '';
    let items = '';
    
    images.forEach((img, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const ariaCurrent = index === 0 ? 'aria-current="true"' : '';
        
        indicators += `
            <button type="button" 
                    data-bs-target="#projectCarousel" 
                    data-bs-slide-to="${index}" 
                    class="${activeClass}" 
                    ${ariaCurrent}
                    aria-label="Slide ${index + 1}">
            </button>
        `;
        
        items += `
            <div class="carousel-item ${activeClass}">
                <img src="${img}" 
                     class="d-block w-100" 
                      style="height: 100%;"
                     alt="${currentProject.title[currentLang]} - Image ${index + 1}"
                     onerror="this.src='https://via.placeholder.com/1200x500/3B82F6/ffffff?text=Image+Not+Found'">
            </div>
        `;
    });
    
    const carouselHTML = `
        <div id="projectCarousel" class="carousel slide" data-bs-ride="carousel">
            ${images.length > 1 ? `<div class="carousel-indicators">${indicators}</div>` : ''}
            <div class="carousel-inner">
                ${items}
            </div>
            ${images.length > 1 ? `
                <button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = carouselHTML;
    
    // Initialize carousel
    if (images.length > 1) {
        new bootstrap.Carousel(document.getElementById('projectCarousel'), {
            interval: 3000,
            wrap: true,
            ride: 'carousel'
        });
    }
}

// ===================================
// PROJECT DETAILS
// ===================================
function loadProjectDetails(texts) {
    // Update labels
    document.getElementById('overviewTitle').textContent = texts.detail.overview;
    document.getElementById('problemLabel').textContent = texts.detail.problem;
    document.getElementById('solutionLabel').textContent = texts.detail.solution;
    document.getElementById('toolsUsedLabel').textContent = texts.detail.tools;
    
    // Update content
    document.getElementById('projectProblem').textContent = currentProject.problem[currentLang];
    document.getElementById('projectSolution').textContent = currentProject.solution[currentLang];
    
    // Load tools
    loadTools();
    
    // Load project info
    loadProjectInfo(texts);
}

function loadTools() {
    const toolsContainer = document.getElementById('projectTools');
    if (!toolsContainer) return;
    
    toolsContainer.innerHTML = '';
    
    currentProject.tools.forEach(tool => {
        const toolItem = document.createElement('div');
        toolItem.className = 'tool-item';
        toolItem.textContent = tool;
        toolsContainer.appendChild(toolItem);
    });
}

function loadProjectInfo(texts) {
    const projectInfoTitle = document.getElementById('projectInfoTitle');
    const categoryLabel = document.getElementById('categoryLabel');
    const statusLabel = document.getElementById('statusLabel');
    const projectCategoryInfo = document.getElementById('projectCategoryInfo');
    const projectStatus = document.getElementById('projectStatus');
    
    if (projectInfoTitle) {
        projectInfoTitle.textContent = currentLang === 'id' ? 'Informasi Proyek' : 'Project Info';
    }
    if (categoryLabel) {
        categoryLabel.textContent = currentLang === 'id' ? 'Kategori:' : 'Category:';
    }
    if (statusLabel) {
        statusLabel.textContent = 'Status:';
    }
    if (projectCategoryInfo) {
        projectCategoryInfo.textContent = currentProject.category;
    }
    if (projectStatus) {
        projectStatus.textContent = currentLang === 'id' ? 'Selesai' : 'Completed';
    }
}

// ===================================
// RELATED PROJECTS
// ===================================
function loadRelatedProjects(texts) {
    const relatedTitle = document.getElementById('relatedTitle');
    if (relatedTitle) {
        relatedTitle.textContent = texts.detail.related;
    }
    
    // Get related projects (same category, different ID)
    let relatedProjects = siteData.projects.filter(p => 
        p.id !== currentProject.id && p.category === currentProject.category
    );
    
    // If not enough, add random projects
    if (relatedProjects.length < 3) {
        const otherProjects = siteData.projects.filter(p => 
            p.id !== currentProject.id && p.category !== currentProject.category
        );
        relatedProjects = [...relatedProjects, ...otherProjects].slice(0, 6);
    }
    
    const innerContainer = document.getElementById('relatedProjectsInner');
    if (!innerContainer) return;
    
    innerContainer.innerHTML = '';
    
    if (relatedProjects.length === 0) {
        innerContainer.innerHTML = `
            <div class="carousel-item active">
                <div class="text-center text-muted p-5">
                    <p>Tidak ada proyek terkait.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Create carousel items (3 projects per slide)
    const itemsPerSlide = 3;
    for (let i = 0; i < relatedProjects.length; i += itemsPerSlide) {
        const slideProjects = relatedProjects.slice(i, i + itemsPerSlide);
        const isActive = i === 0 ? 'active' : '';
        
        let slideHTML = `
            <div class="carousel-item ${isActive}">
                <div class="row g-4">
        `;
        
        slideProjects.forEach(project => {
            slideHTML += `
                <div class="col-md-4">
                    <a href="detail-project.html?id=${project.id}" class="related-project-card">
                        <img src="${project.images[0]}" 
                            
                             style= "height: auto !important;"
                             class="related-project-image" 
                             alt="${project.title[currentLang]}"
                             onerror="this.src='https://via.placeholder.com/400x200/3B82F6/ffffff?text=${encodeURIComponent(project.title[currentLang])}'">
                        <div class="related-project-body">
                            <span class="related-project-category">${project.category}</span>
                            <h6 class="related-project-title">${project.title[currentLang]}</h6>
                            <p class="related-project-desc">${project.short_description[currentLang]}</p>
                        </div>
                    </a>
                </div>
            `;
        });
        
        slideHTML += `
                </div>
            </div>
        `;
        
        innerContainer.innerHTML += slideHTML;
    }
    
    // Initialize carousel
    const carouselElement = document.getElementById('relatedProjectsCarousel');
    if (carouselElement && relatedProjects.length > itemsPerSlide) {
        new bootstrap.Carousel(carouselElement, {
            interval: 5000,
            wrap: true,
            ride: 'carousel'
        });
    }
}

// ===================================
// CTA SECTION
// ===================================
function loadCTA(texts) {
    const ctaTitle = document.getElementById('ctaTitle');
    const ctaDescription = document.getElementById('ctaDescription');
    const ctaButton = document.getElementById('ctaButton');
    
    if (ctaTitle) {
        ctaTitle.textContent = texts.detail.collab_title;
    }
    if (ctaDescription) {
        ctaDescription.textContent = currentLang === 'id'
            ? 'Mari wujudkan proyek digital Anda bersama saya. Hubungi sekarang untuk diskusi lebih lanjut.'
            : "Let's bring your digital project to life together. Contact me now for further discussion.";
    }
    if (ctaButton) {
        ctaButton.textContent = currentLang === 'id' ? 'Hubungi Saya' : 'Contact Me';
    }
}

// ===================================
// FOOTER
// ===================================
function loadFooter(texts) {
    const footerText = document.getElementById('footerText');
    if (footerText) {
        footerText.textContent = texts.footer;
    }
}

// ===================================
// THEME TOGGLE
// ===================================
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

// ===================================
// LANGUAGE TOGGLE
// ===================================
window.toggleLanguage = function() {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    localStorage.setItem('language', currentLang);
    initializeDetailPage();
}

function updateLanguageDisplay() {
    const langText = document.getElementById('langText');
    if (langText) {
        langText.textContent = currentLang === 'id' ? 'EN' : 'ID';
    }
}

// ===================================
// EVENT LISTENERS
// ===================================
function setupEventListeners() {
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Back to top button
    window.addEventListener('scroll', handleBackToTopButton);
}

function handleNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function handleBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
}

window.scrollToTop = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}