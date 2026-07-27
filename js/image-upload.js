/* ========================================
   IMAGE-UPLOAD.JS — Complete Image Management
   Uses ImgBB API with localStorage fallback
   ======================================== */

// ========================================
// 📸 CONFIGURATION
// ========================================

const IMGBB_API_KEY = 'a86233fd25e95efaf13552cd6eccf734';

// ========================================
// 📤 UPLOAD IMAGE TO IMGBB
// ========================================

async function uploadImage(file, folder = 'portfolio') {
    if (!IMGBB_API_KEY) {
        console.warn('No ImgBB API key found. Using Base64 fallback.');
        return uploadImageBase64(file);
    }
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);
    formData.append('name', file.name);
    formData.append('expiration', '0');
    
    try {
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            return {
                success: true,
                url: data.data.url,
                display_url: data.data.display_url,
                thumbnail: data.data.thumb.url,
                delete_url: data.data.delete_url,
                size: data.data.size,
                name: file.name,
                type: file.type
            };
        } else {
            console.error('ImgBB upload failed:', data);
            return uploadImageBase64(file);
        }
    } catch (error) {
        console.error('Upload error:', error);
        return uploadImageBase64(file);
    }
}

// ========================================
// 📤 FALLBACK: Base64 Upload
// ========================================

function uploadImageBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const base64 = e.target.result;
            const images = getImageStore();
            const imageId = 'img_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            
            images.push({
                id: imageId,
                name: file.name,
                data: base64,
                size: file.size,
                type: file.type,
                date: new Date().toISOString()
            });
            
            saveImageStore(images);
            
            resolve({
                success: true,
                url: base64,
                id: imageId,
                name: file.name,
                isBase64: true
            });
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

// ========================================
// 🗄️ IMAGE STORE (localStorage)
// ========================================

function getImageStore() {
    try {
        return JSON.parse(localStorage.getItem('portfolioImages')) || [];
    } catch {
        return [];
    }
}

function saveImageStore(images) {
    localStorage.setItem('portfolioImages', JSON.stringify(images));
}

function getImageById(id) {
    const images = getImageStore();
    return images.find(img => img.id === id) || null;
}

function deleteImageFromStore(id) {
    let images = getImageStore();
    images = images.filter(img => img.id !== id);
    saveImageStore(images);
}

// ========================================
// 🖼️ IMAGE PICKER UI
// ========================================

function createImagePicker(containerId, onSelect, selectedId = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Add upload button
    const uploadDiv = document.createElement('div');
    uploadDiv.className = 'image-picker-upload';
    uploadDiv.innerHTML = `
        <div class="upload-area">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Upload Image</span>
            <input type="file" accept="image/*" class="imageUploadInput" style="display:none;" />
        </div>
    `;
    container.appendChild(uploadDiv);
    
    // Handle upload
    const uploadArea = uploadDiv.querySelector('.upload-area');
    const fileInput = uploadDiv.querySelector('.imageUploadInput');
    
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Show loading
        uploadArea.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        uploadArea.style.pointerEvents = 'none';
        
        const result = await uploadImage(file);
        
        if (result.success) {
            // Refresh picker with selection
            const newId = result.id || result.url;
            createImagePicker(containerId, onSelect, newId);
            
            // Trigger callback
            if (onSelect) onSelect(result);
            showToast('✅ Image uploaded successfully!', 'success');
        } else {
            showToast('❌ Upload failed. Please try again.', 'error');
            uploadArea.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Upload Image</span>';
            uploadArea.style.pointerEvents = 'auto';
        }
    };
    
    // Show existing images
    const images = getImageStore();
    
    if (images.length > 0) {
        const grid = document.createElement('div');
        grid.className = 'image-picker-grid';
        
        images.forEach(img => {
            const item = document.createElement('div');
            item.className = 'image-picker-item';
            if (selectedId && (selectedId === img.id || selectedId === img.url)) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <img src="${img.data}" alt="${img.name}" />
                <div class="image-picker-overlay">
                    <button class="btn-select" data-id="${img.id}"><i class="fas fa-check"></i> Select</button>
                    <button class="btn-delete-image" data-id="${img.id}"><i class="fas fa-trash"></i></button>
                </div>
                <div class="image-picker-name">${img.name}</div>
            `;
            
            // Select image
            item.querySelector('.btn-select').addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.id;
                const selected = getImageById(id);
                if (selected && onSelect) {
                    onSelect(selected);
                }
                document.querySelectorAll(`#${containerId} .image-picker-item`).forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                showToast('✅ Image selected!', 'success');
            });
            
            // Delete image
            item.querySelector('.btn-delete-image').addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.id;
                if (confirm('Delete this image?')) {
                    deleteImageFromStore(id);
                    createImagePicker(containerId, onSelect);
                    showToast('🗑️ Image deleted', 'info');
                }
            });
            
            // Click on item to select
            item.addEventListener('click', function() {
                const id = this.querySelector('.btn-select').dataset.id;
                const selected = getImageById(id);
                if (selected && onSelect) {
                    onSelect(selected);
                }
                document.querySelectorAll(`#${containerId} .image-picker-item`).forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
            });
            
            grid.appendChild(item);
        });
        
        container.appendChild(grid);
    } else {
        const empty = document.createElement('div');
        empty.className = 'image-picker-empty';
        empty.innerHTML = '<p><i class="fas fa-images"></i> No images uploaded yet. Click "Upload Image" to add one.</p>';
        container.appendChild(empty);
    }
}

// ========================================
// 🔗 IMAGE HELPER FUNCTIONS
// ========================================

function getImageUrl(imageData) {
    if (!imageData) return null;
    if (typeof imageData === 'string') return imageData;
    if (imageData.url) return imageData.url;
    if (imageData.data) return imageData.data;
    return null;
}

function getImageAlt(imageData, fallback = 'Image') {
    if (!imageData) return fallback;
    return imageData.name || imageData.alt || fallback;
}

function getImageHtml(imageData, className = 'featured-image', alt = 'Image') {
    const url = getImageUrl(imageData);
    if (!url) return '';
    return `<img src="${url}" alt="${getImageAlt(imageData, alt)}" class="${className}" />`;
}

// ========================================
// 🍞 TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.8rem 1.5rem;
        border-radius: 12px;
        background: rgba(20,20,20,0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.05);
        color: #fff;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        z-index: 999999;
        animation: slideUp 0.3s ease;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;
    
    if (type === 'success') {
        toast.style.borderColor = 'rgba(0,255,100,0.2)';
    } else if (type === 'error') {
        toast.style.borderColor = 'rgba(255,0,0,0.2)';
        toast.style.color = '#ff6b6b';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// 🎨 STYLES
// ========================================

const imagePickerStyles = document.createElement('style');
imagePickerStyles.textContent = `
    /* Image Picker Styles */
    .image-picker-upload .upload-area {
        border: 2px dashed rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #888;
        margin-bottom: 0.5rem;
    }
    
    .image-picker-upload .upload-area:hover {
        border-color: rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.02);
    }
    
    .image-picker-upload .upload-area i {
        font-size: 1.8rem;
        display: block;
        margin-bottom: 0.3rem;
    }
    
    .image-picker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.8rem;
        margin-top: 0.5rem;
        max-height: 300px;
        overflow-y: auto;
        padding: 0.5rem 0;
    }
    
    .image-picker-grid::-webkit-scrollbar {
        width: 4px;
    }
    
    .image-picker-grid::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 4px;
    }
    
    .image-picker-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255,255,255,0.02);
    }
    
    .image-picker-item:hover {
        border-color: rgba(255,255,255,0.1);
    }
    
    .image-picker-item.selected {
        border-color: #fff;
        box-shadow: 0 0 30px rgba(255,255,255,0.05);
    }
    
    .image-picker-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .image-picker-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(4px);
    }
    
    .image-picker-item:hover .image-picker-overlay {
        opacity: 1;
    }
    
    .image-picker-overlay .btn-select {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.15);
        color: #fff;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.65rem;
        font-family: 'Inter', sans-serif;
        transition: all 0.3s ease;
    }
    
    .image-picker-overlay .btn-select:hover {
        background: rgba(255,255,255,0.2);
    }
    
    .image-picker-overlay .btn-delete-image {
        background: rgba(255,0,0,0.2);
        border: 1px solid rgba(255,0,0,0.2);
        color: #ff6b6b;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.6rem;
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .image-picker-overlay .btn-delete-image:hover {
        background: rgba(255,0,0,0.4);
    }
    
    .image-picker-name {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,0.7);
        padding: 0.2rem 0.4rem;
        font-size: 0.55rem;
        color: #aaa;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .image-picker-empty {
        text-align: center;
        padding: 1.5rem;
        color: #666;
    }
    
    .image-picker-empty i {
        font-size: 2rem;
        display: block;
        margin-bottom: 0.5rem;
        color: #444;
    }
    
    /* Image Preview in Admin */
    .image-preview-container {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: rgba(255,255,255,0.02);
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.03);
    }
    
    .image-preview-container img {
        max-width: 120px;
        max-height: 120px;
        border-radius: 8px;
        object-fit: cover;
        display: block;
    }
    
    .image-preview-container .no-image {
        color: #555;
        font-size: 0.8rem;
        padding: 0.5rem;
        text-align: center;
    }
    
    /* Toast Animation */
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .image-picker-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        }
    }
`;

document.head.appendChild(imagePickerStyles);