// GitHub Configuration
const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = 'faithfulaborisade1';
const REPO_NAME = 'kilkennyquads';
const BRANCH = 'main';

// State Management
let githubToken = '';
let productsData = { products: [] };
let configData = {};
let currentEditingProduct = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('githubToken');
    if (savedToken) {
        githubToken = savedToken;
        showAdminDashboard();
        loadAllData();
    }

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', handleSaveSettings);

    // Edit form
    document.getElementById('editForm').addEventListener('submit', handleSaveProduct);
}

// ==================== Authentication ====================

async function handleLogin(e) {
    e.preventDefault();

    const token = document.getElementById('githubToken').value.trim();
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';
    errorDiv.style.display = 'none';

    try {
        // Verify token by making a test API call
        const response = await fetch(`${GITHUB_API}/user`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Invalid GitHub token');
        }

        // Token is valid
        githubToken = token;
        localStorage.setItem('githubToken', token);

        showAdminDashboard();
        loadAllData();

    } catch (error) {
        errorDiv.textContent = 'Invalid token. Please check and try again.';
        errorDiv.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('githubToken');
        githubToken = '';
        location.reload();
    }
}

function showAdminDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
}

// ==================== GitHub API Functions ====================

async function getFileContent(path) {
    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch ${path}`);
        }

        const data = await response.json();
        const content = atob(data.content);
        return { content: JSON.parse(content), sha: data.sha };

    } catch (error) {
        console.error('Error fetching file:', error);
        showError(`Failed to load ${path}`);
        return null;
    }
}

async function updateFileContent(path, content, message) {
    try {
        // First, get the current file to get its SHA
        const currentFile = await fetch(
            `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        let sha = '';
        if (currentFile.ok) {
            const fileData = await currentFile.json();
            sha = fileData.sha;
        }

        // Update the file
        const response = await fetch(
            `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
                    sha: sha,
                    branch: BRANCH
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update file');
        }

        return true;

    } catch (error) {
        console.error('Error updating file:', error);
        showError(`Failed to save changes: ${error.message}`);
        return false;
    }
}

// ==================== Data Loading ====================

async function loadAllData() {
    await loadProducts();
    await loadSettings();
}

async function loadProducts() {
    const fileData = await getFileContent('products.json');
    if (fileData) {
        productsData = fileData.content;
        renderProducts();
    }
}

async function loadSettings() {
    const fileData = await getFileContent('config.json');
    if (fileData) {
        configData = fileData.content;
        populateSettingsForm();
    }
}

// ==================== Products Management ====================

function renderProducts() {
    const container = document.getElementById('productsList');

    if (productsData.products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No products yet. Click "Add New Product" to get started.</p>';
        return;
    }

    container.innerHTML = productsData.products.map((product, index) => `
        <div class="product-item ${!product.visible ? 'hidden' : ''}">
            <img src="${product.images[0]}" alt="${product.name}" class="product-image" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><rect fill=%22%23ddd%22 width=%22120%22 height=%22120%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22>No Image</text></svg>'">
            <div class="product-details">
                <h3>${product.name}</h3>
                <div class="price">${product.price || 'Price on request'}</div>
                <p style="color: #666; font-size: 14px; margin-bottom: 10px;">${product.description.substring(0, 100)}...</p>
                <p style="font-size: 13px; color: #999;">
                    <strong>Colors:</strong> ${product.colors}<br>
                    <strong>Status:</strong> ${product.visible ? 'Visible' : 'Hidden'}
                </p>
                <div class="product-actions">
                    <button class="btn-small btn-edit" onclick="editProduct(${index})">Edit</button>
                    <button class="btn-small btn-toggle" onclick="toggleProduct(${index})">
                        ${product.visible ? 'Hide' : 'Show'}
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${index})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editProduct(index) {
    currentEditingProduct = index;
    const product = productsData.products[index];

    document.getElementById('editProductId').value = product.id;
    document.getElementById('editName').value = product.name;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editColors').value = product.colors;

    // Populate features
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = product.features.map((feature, i) => `
        <div class="feature-item">
            <input type="text" value="${feature}" data-index="${i}">
            <button type="button" class="btn-remove" onclick="removeFeature(${i})">Remove</button>
        </div>
    `).join('');

    document.getElementById('editModal').style.display = 'block';
}

async function handleSaveProduct(e) {
    e.preventDefault();

    const features = Array.from(document.querySelectorAll('#featuresList input'))
        .map(input => input.value.trim())
        .filter(val => val !== '');

    const updatedProduct = {
        ...productsData.products[currentEditingProduct],
        name: document.getElementById('editName').value,
        price: document.getElementById('editPrice').value,
        description: document.getElementById('editDescription').value,
        colors: document.getElementById('editColors').value,
        features: features
    };

    productsData.products[currentEditingProduct] = updatedProduct;

    const success = await updateFileContent(
        'products.json',
        productsData,
        `Update product: ${updatedProduct.name}`
    );

    if (success) {
        showSuccess('Product updated successfully!');
        closeModal();
        renderProducts();
    }
}

async function toggleProduct(index) {
    productsData.products[index].visible = !productsData.products[index].visible;

    const success = await updateFileContent(
        'products.json',
        productsData,
        `Toggle visibility: ${productsData.products[index].name}`
    );

    if (success) {
        showSuccess('Product visibility updated!');
        renderProducts();
    }
}

async function deleteProduct(index) {
    const product = productsData.products[index];

    if (!confirm(`Are you sure you want to delete "${product.name}"? This cannot be undone.`)) {
        return;
    }

    productsData.products.splice(index, 1);

    const success = await updateFileContent(
        'products.json',
        productsData,
        `Delete product: ${product.name}`
    );

    if (success) {
        showSuccess('Product deleted successfully!');
        renderProducts();
    }
}

function addNewProduct() {
    const newProduct = {
        id: 'new-product-' + Date.now(),
        name: 'New Product',
        price: '€0',
        description: 'Enter product description',
        colors: 'Available colors',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        images: ['images/placeholder.jpg'],
        visible: false
    };

    productsData.products.push(newProduct);
    currentEditingProduct = productsData.products.length - 1;

    editProduct(currentEditingProduct);
}

// ==================== Features Management ====================

function addFeature() {
    const featuresList = document.getElementById('featuresList');
    const index = featuresList.children.length;

    const div = document.createElement('div');
    div.className = 'feature-item';
    div.innerHTML = `
        <input type="text" value="" placeholder="New feature" data-index="${index}">
        <button type="button" class="btn-remove" onclick="removeFeature(${index})">Remove</button>
    `;

    featuresList.appendChild(div);
}

function removeFeature(index) {
    const featuresList = document.getElementById('featuresList');
    const items = featuresList.querySelectorAll('.feature-item');
    if (items.length > 1) {
        items[index].remove();
    } else {
        alert('Product must have at least one feature');
    }
}

// ==================== Settings Management ====================

function populateSettingsForm() {
    if (!configData.site) return;

    // Site Branding
    document.getElementById('businessName').value = configData.site.businessName || '';
    document.getElementById('siteTagline').value = configData.site.tagline || '';
    document.getElementById('siteTitle').value = configData.site.title || '';

    // Hero Section
    document.getElementById('heroTitle').value = configData.site.heroTitle || '';
    document.getElementById('heroSubtitle').value = configData.site.heroSubtitle || '';
    document.getElementById('heroButtonText').value = configData.site.heroButtonText || '';

    // Products Section
    document.getElementById('productsTitle').value = configData.site.productsTitle || '';
    document.getElementById('productsSubtitle').value = configData.site.productsSubtitle || '';

    // Contact Section
    document.getElementById('contactTitle').value = configData.site.contactTitle || '';
    document.getElementById('contactSubtitle').value = configData.site.contactSubtitle || '';
    document.getElementById('whyChooseTitle').value = configData.site.whyChooseTitle || '';

    // Contact Information
    document.getElementById('contactPhone').value = configData.contact?.phone || '';
    document.getElementById('contactEmail').value = configData.contact?.email || '';
    document.getElementById('addressLine1').value = configData.contact?.address?.line1 || '';
    document.getElementById('addressLine2').value = configData.contact?.address?.line2 || '';

    // Business Hours
    document.getElementById('hoursWeekday').value = configData.contact?.hours?.weekday || '';
    document.getElementById('hoursSaturday').value = configData.contact?.hours?.saturday || '';
    document.getElementById('emailResponseTime').value = configData.contact?.emailResponseTime || '';
    document.getElementById('showroomNote').value = configData.contact?.showroomNote || '';

    // Footer
    document.getElementById('footerCopyright').value = configData.footer?.copyright || '';
    document.getElementById('footerTagline').value = configData.footer?.tagline || '';

    // Benefits
    renderBenefits();
}

function renderBenefits() {
    const benefitsList = document.getElementById('benefitsList');
    const benefits = configData.benefits || [];

    benefitsList.innerHTML = benefits.map((benefit, i) => `
        <div class="feature-item">
            <input type="text" value="${benefit}" data-index="${i}">
            <button type="button" class="btn-remove" onclick="removeBenefit(${i})">Remove</button>
        </div>
    `).join('');
}

function addBenefit() {
    if (!configData.benefits) {
        configData.benefits = [];
    }
    configData.benefits.push('New benefit');
    renderBenefits();
}

function removeBenefit(index) {
    if (configData.benefits.length > 1) {
        configData.benefits.splice(index, 1);
        renderBenefits();
    } else {
        alert('Must have at least one benefit');
    }
}

async function handleSaveSettings(e) {
    e.preventDefault();

    // Site Branding
    configData.site.businessName = document.getElementById('businessName').value;
    configData.site.tagline = document.getElementById('siteTagline').value;
    configData.site.title = document.getElementById('siteTitle').value;

    // Hero Section
    configData.site.heroTitle = document.getElementById('heroTitle').value;
    configData.site.heroSubtitle = document.getElementById('heroSubtitle').value;
    configData.site.heroButtonText = document.getElementById('heroButtonText').value;

    // Products Section
    configData.site.productsTitle = document.getElementById('productsTitle').value;
    configData.site.productsSubtitle = document.getElementById('productsSubtitle').value;

    // Contact Section
    configData.site.contactTitle = document.getElementById('contactTitle').value;
    configData.site.contactSubtitle = document.getElementById('contactSubtitle').value;
    configData.site.whyChooseTitle = document.getElementById('whyChooseTitle').value;

    // Contact Information
    configData.contact.phone = document.getElementById('contactPhone').value;
    configData.contact.email = document.getElementById('contactEmail').value;
    configData.contact.address.line1 = document.getElementById('addressLine1').value;
    configData.contact.address.line2 = document.getElementById('addressLine2').value;

    // Business Hours
    configData.contact.hours.weekday = document.getElementById('hoursWeekday').value;
    configData.contact.hours.saturday = document.getElementById('hoursSaturday').value;
    configData.contact.emailResponseTime = document.getElementById('emailResponseTime').value;
    configData.contact.showroomNote = document.getElementById('showroomNote').value;

    // Footer
    configData.footer.copyright = document.getElementById('footerCopyright').value;
    configData.footer.tagline = document.getElementById('footerTagline').value;

    // Benefits - collect from inputs
    const benefitInputs = document.querySelectorAll('#benefitsList input');
    configData.benefits = Array.from(benefitInputs)
        .map(input => input.value.trim())
        .filter(val => val !== '');

    const success = await updateFileContent(
        'config.json',
        configData,
        'Update site settings'
    );

    if (success) {
        showSuccess('Settings saved successfully! Changes will appear on the site in 1-2 minutes.');
    }
}

// ==================== UI Helpers ====================

function switchTab(tabName, clickedElement) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (clickedElement) {
        clickedElement.classList.add('active');
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingProduct = null;
}

function showSuccess(message) {
    const statusDiv = document.getElementById('saveStatus');
    statusDiv.className = 'save-status success';
    statusDiv.textContent = '✓ ' + message;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

function showError(message) {
    const statusDiv = document.getElementById('saveStatus');
    statusDiv.className = 'save-status error';
    statusDiv.textContent = '✗ ' + message;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
}
