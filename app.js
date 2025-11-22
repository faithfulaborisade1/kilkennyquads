// Main site JavaScript - Loads products and config dynamically

let productsData = { products: [] };
let configData = {};

// Load data when page loads
document.addEventListener('DOMContentLoaded', async function() {
    await loadSiteData();
    updateSiteContent();
    renderProducts();
    updateContactInfo();
});

// ==================== Data Loading ====================

async function loadSiteData() {
    try {
        // Load products
        const productsResponse = await fetch('products.json');
        if (productsResponse.ok) {
            productsData = await productsResponse.json();
        }

        // Load config
        const configResponse = await fetch('config.json');
        if (configResponse.ok) {
            configData = await configResponse.json();
        }
    } catch (error) {
        console.error('Error loading site data:', error);
    }
}

// ==================== Products Rendering ====================

function renderProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    // Filter only visible products
    const visibleProducts = productsData.products.filter(p => p.visible);

    productGrid.innerHTML = visibleProducts.map(product => `
        <div class="product-card">
            <div class="product-image-slider">
                <div class="slider-images">
                    ${product.images.map((img, index) => `
                        <img src="${img}" alt="${product.name}" ${index === 0 ? 'class="active"' : ''}>
                    `).join('')}
                </div>
                ${product.images.length > 1 ? `
                    <button class="slider-arrow prev" onclick="changeSlide(this, -1)">&#10094;</button>
                    <button class="slider-arrow next" onclick="changeSlide(this, 1)">&#10095;</button>
                ` : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                ${product.price ? `<p class="product-price">${product.price}</p>` : ''}
                <p class="product-desc">${product.description}</p>
                <p class="product-colors"><strong>Available Colors:</strong> ${product.colors}</p>
                <ul class="product-features">
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <a href="#contact" class="product-button">Enquire Now</a>
            </div>
        </div>
    `).join('');
}

// ==================== Site Content Update ====================

function updateSiteContent() {
    if (!configData.site) return;

    // Update page title
    document.title = configData.site.title;

    // Update header
    const logoH1 = document.querySelector('.logo h1');
    if (logoH1) logoH1.textContent = configData.site.businessName;

    const tagline = document.querySelector('.logo .tagline');
    if (tagline) tagline.textContent = configData.site.tagline;

    // Update hero section
    const heroTitle = document.querySelector('.hero h2');
    if (heroTitle) heroTitle.textContent = configData.site.heroTitle;

    const heroSubtitle = document.querySelector('.hero p');
    if (heroSubtitle) heroSubtitle.textContent = configData.site.heroSubtitle;

    const heroButton = document.querySelector('.hero .cta-button');
    if (heroButton) heroButton.textContent = configData.site.heroButtonText;

    // Update products section
    const productsTitle = document.querySelector('#products .section-title');
    if (productsTitle) productsTitle.textContent = configData.site.productsTitle;

    const productsSubtitle = document.querySelector('#products .section-subtitle');
    if (productsSubtitle) productsSubtitle.textContent = configData.site.productsSubtitle;

    // Update contact section
    const contactTitle = document.querySelector('#contact .section-title');
    if (contactTitle) contactTitle.textContent = configData.site.contactTitle;

    const contactSubtitle = document.querySelector('#contact .section-subtitle');
    if (contactSubtitle) contactSubtitle.textContent = configData.site.contactSubtitle;

    const whyChooseTitle = document.querySelector('.contact-cta h3');
    if (whyChooseTitle) whyChooseTitle.textContent = configData.site.whyChooseTitle;

    // Update benefits list
    const benefitsList = document.querySelector('.benefits-list');
    if (benefitsList && configData.benefits) {
        benefitsList.innerHTML = configData.benefits.map(benefit =>
            `<li>✓ ${benefit}</li>`
        ).join('');
    }

    // Update footer
    const footerCopyright = document.querySelector('footer p:first-child');
    if (footerCopyright && configData.footer) {
        footerCopyright.innerHTML = `&copy; ${configData.footer.copyright}`;
    }

    const footerTagline = document.querySelector('.footer-tagline');
    if (footerTagline && configData.footer) {
        footerTagline.textContent = configData.footer.tagline;
    }
}

// ==================== Contact Info Update ====================

function updateContactInfo() {
    if (!configData.contact) return;

    // Update phone
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.textContent = configData.contact.phone;
        link.href = `tel:${configData.contact.phoneFormatted || configData.contact.phone}`;
    });

    // Update email
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.textContent = configData.contact.email;
        link.href = `mailto:${configData.contact.email}`;
    });

    // Update address
    const addressElements = document.querySelectorAll('.contact-card p');
    addressElements.forEach(el => {
        if (el.innerHTML.includes('Unit 31') || el.innerHTML.includes('Kilkenny')) {
            el.innerHTML = `${configData.contact.address.line1}<br>${configData.contact.address.line2}`;
        }
    });

    // Update hours
    const hoursElements = document.querySelectorAll('.contact-hours');
    if (hoursElements.length >= 1) {
        hoursElements[0].innerHTML = `${configData.contact.hours.weekday}<br>${configData.contact.hours.saturday}`;
    }
    if (hoursElements.length >= 2) {
        hoursElements[1].textContent = configData.contact.emailResponseTime;
    }
    if (hoursElements.length >= 3) {
        hoursElements[2].textContent = configData.contact.showroomNote;
    }
}

// ==================== Image Slider Function ====================

function changeSlide(button, direction) {
    const slider = button.parentElement;
    const images = slider.querySelectorAll('.slider-images img');
    let currentIndex = 0;

    // Find current active image
    images.forEach((img, index) => {
        if (img.classList.contains('active')) {
            currentIndex = index;
        }
    });

    // Remove active class from current image
    images[currentIndex].classList.remove('active');

    // Calculate new index
    let newIndex = currentIndex + direction;
    if (newIndex >= images.length) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = images.length - 1;
    }

    // Add active class to new image
    images[newIndex].classList.add('active');
}
