// ===================================
// GLOBAL STATE
// ===================================
let currentLang = 'id';
let currentTheme = 'light';
let siteData = null;

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
    initializePage();
    
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
    const projectsGrid = document.getElementById('projectsGrid');
    if (projectsGrid) {
        projectsGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Gagal memuat data. Silakan refresh halaman.
                </div>
            </div>
        `;
    }
}

// ===================================
// PAGE INITIALIZATION
// ===================================
function initializePage() {
    if (!siteData) return;
    
    const texts = siteData.texts[currentLang];
    
    // Update page title
    document.getElementById('pageTitle').textContent = `Deva Adzny - ${texts.hero.subtitle}`;
    
    // Load all sections
    loadNavbar(texts);
    loadHeroSection(texts);
    loadAboutSection(texts);
    loadProjectsSection(texts);
    loadContactSection(texts);
    loadFooter(texts);
    
    // Update language display
    updateLanguageDisplay();
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
            <a class="nav-link" href="#${sections[index]}">${item}</a>
        `;
        navMenu.appendChild(li);
    });
}

// ===================================
// HERO SECTION
// ===================================
function loadHeroSection(texts) {
    document.getElementById('heroGreeting').textContent = texts.hero.greeting;
    document.getElementById('heroSubtitle').textContent = texts.hero.subtitle;
    document.getElementById('heroQuote').textContent = texts.hero.quote;
    document.getElementById('heroWorksBtnText').textContent = texts.hero.my_works_button;
    
    // Contact button
    const heroContactBtn = document.getElementById('heroContactBtn');
    if (heroContactBtn) {
        heroContactBtn.textContent = currentLang === 'id' ? 'Hubungi Saya' : 'Contact Me';
    }
    
    // Stats labels
    const yearsExp = document.getElementById('yearsExp');
    const projectsCompleted = document.getElementById('projectsCompleted');
    
    if (yearsExp) {
        yearsExp.textContent = currentLang === 'id' ? 'Tahun Pengalaman' : 'Years Experience';
    }
    if (projectsCompleted) {
        projectsCompleted.textContent = currentLang === 'id' ? 'Proyek Selesai' : 'Projects Completed';
    }
}

// ===================================
// ABOUT SECTION
// ===================================
function loadAboutSection(texts) {
    // Subtitle & Title (jika ada)
    const subtitleEl = document.getElementById('aboutSubtitle');
    if (subtitleEl) {
        subtitleEl.textContent = currentLang === 'id' 
            ? 'Kenali Saya Lebih Dekat' 
            : 'Get to Know Me';
    }

    const titleEl = document.getElementById('aboutTitle');
    if (titleEl) {
        titleEl.textContent = texts.about.title;
    }

    // Description
    const descEl = document.getElementById('aboutDesc');
    if (descEl) {
        descEl.textContent = texts.about.description;
    }

    // CV Button
    const cvBtn = document.getElementById('heroCVBtn');
    if (cvBtn) {
        cvBtn.textContent = currentLang === 'id' ? 'CV Saya' : 'My CV';
    }

   const cvBtnLink = document.getElementById('cvLink');
    if (cvBtnLink) {
        cvBtnLink.href = texts.about.cv;
        cvBtnLink.target = "_blank";
    }


    // Load skills
    document.getElementById('langLabel').textContent = texts.skills.languages;
    document.getElementById('toolsLabel').textContent = texts.skills.tools;

    loadSkills(siteData.skills.languages, 'programmingLanguages');
    loadSkills(siteData.skills.tools, 'devTools');
}

function loadSkills(skillsArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    skillsArray.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.textContent = skill;
        container.appendChild(span);
    });
}


// ===================================
// PROJECTS SECTION
// ===================================
function loadProjectsSection(texts) {
    document.getElementById('projectsSubtitle').textContent = 
        currentLang === 'id' ? 'Portfolio Saya' : 'My Portfolio';
    document.getElementById('projectsTitle').textContent = texts.projects_title;
    
    // Load category filters
    loadCategoryFilters();
    
    // Load all projects initially
    loadProjects(siteData.projects);
}

function loadCategoryFilters() {
    const filterContainer = document.getElementById('categoryFilters');
    if (!filterContainer) return;
    
    filterContainer.innerHTML = '';
    
    // Get unique categories
    const categories = [...new Set(siteData.projects.map(p => p.category))];
    
    // Add "All" button
    const allText = currentLang === 'id' ? 'Semua' : 'All';
    const allBtn = createFilterButton(allText, 'all', true);
    filterContainer.appendChild(allBtn);
    
    // Add category buttons
    categories.forEach(category => {
        const btn = createFilterButton(category, category, false);
        filterContainer.appendChild(btn);
    });
}

function createFilterButton(text, category, isActive) {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${isActive ? 'active' : ''}`;
    btn.textContent = text;
    btn.dataset.category = category;
    btn.onclick = () => filterProjects(category, btn);
    return btn;
}

function filterProjects(category, clickedButton) {
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedButton.classList.add('active');
    
    // Filter projects
    let filteredProjects;
    if (category === 'all') {
        filteredProjects = siteData.projects;
    } else {
        filteredProjects = siteData.projects.filter(p => p.category === category);
    }
    
    // Load filtered projects
    loadProjects(filteredProjects);
}

function loadProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
        const noProjectText = currentLang === 'id' 
            ? 'Tidak ada proyek ditemukan dalam kategori ini.' 
            : 'No projects found in this category.';
        
        projectsGrid.innerHTML = `
            <div class="col-12">
                <p class="text-center text-muted p-5">${noProjectText}</p>
            </div>
        `;
        return;
    }
    
    const buttonText = siteData.texts[currentLang].card_button;
    
    projects.forEach((project, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';
        col.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s both`;
        
        const title = project.title[currentLang];
        const description = project.short_description[currentLang];
        const imageSrc = project.images[0];
        
        col.innerHTML = `
            <div class="project-card">
                <div class="project-image-wrapper">
                    <img src="${imageSrc}" class="project-image" alt="${title}" 
                         onerror="this.src='https://via.placeholder.com/400x250/3B82F6/ffffff?text=${encodeURIComponent(title)}'">
                    <div class="project-category-badge">${project.category}</div>
                </div>
                <div class="project-body">
                    <h5 class="project-title">${title}</h5>
                    <p class="project-description">${description}</p>
                    <div class="project-footer">
                        <div class="project-tools">
                            ${project.tools.slice(0, 3).map(tool => `
                                <div class="tool-icon" title="${tool}">
                                    ${tool.substring(0, 2).toUpperCase()}
                                </div>
                            `).join('')}
                            ${project.tools.length > 3 ? `
                                <div class="tool-icon" title="${project.tools.length - 3} more">
                                    +${project.tools.length - 3}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <a href="detail-project.html?id=${project.id}" class="btn btn-primary w-100 mt-3">
                        ${buttonText} <i class="fas fa-arrow-right ms-2"></i>
                    </a>
                </div>
            </div>
        `;
        
        projectsGrid.appendChild(col);
    });
}

// ===================================
// CONTACT SECTION
// ===================================
function loadContactSection(texts) {
    document.getElementById('contactSubtitle').textContent = 
        currentLang === 'id' ? 'Mari Berkolaborasi' : "Let's Collaborate";
    document.getElementById('contactTitle').textContent = texts.contact;
    
    // Update form placeholders
    const namePlaceholder = document.getElementById('namePlaceholder');
    const emailPlaceholder = document.getElementById('emailPlaceholder');
    const messagePlaceholder = document.getElementById('messagePlaceholder');
    const sendBtnText = document.getElementById('sendBtnText');
    
    if (namePlaceholder) namePlaceholder.textContent = texts.form.name;
    if (emailPlaceholder) emailPlaceholder.textContent = texts.form.email;
    if (messagePlaceholder) messagePlaceholder.textContent = texts.form.message;
    if (sendBtnText) sendBtnText.textContent = texts.form.send_button;
}

// ===================================
// FOOTER
// ===================================
function loadFooter(texts) {
    document.getElementById('footerText').textContent = texts.footer;
    
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.textContent = currentLang === 'id' ? 'Kembali ke Atas' : 'Back to Top';
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
    initializePage();
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
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.getElementById('mainNav').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    // Show success message
    const successMessage = currentLang === 'id' 
        ? 'Terima kasih! Pesan Anda telah terkirim. Saya akan segera menghubungi Anda.' 
        : 'Thank you! Your message has been sent. I will contact you soon.';
    
    alert(successMessage);
    e.target.reset();
}

function handleNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements when they're added to DOM
setTimeout(() => {
    document.querySelectorAll('.skill-card, .project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}, 100);

document.getElementById("contactForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const message = document.getElementById("messageInput").value;

    const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
    });

    const result = await response.json();

    if (result.success) {
        alert("Pesan berhasil dikirim!");
        document.getElementById("contactForm").reset();
    } else {
        alert("Gagal mengirim pesan.");
    }
});