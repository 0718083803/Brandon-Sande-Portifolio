/* ========================================
   ADMIN.JS — Complete Content Management
   With Image Support and Authentication
   ======================================== */

// ========================================
// 🔐 AUTHENTICATION
// ========================================

const ADMIN_PASSWORD = '@sande263';
const SESSION_TIMEOUT = 30 * 60 * 1000;

function adminLogin() {
    const input = document.getElementById('adminPasswordInput');
    const error = document.getElementById('loginError');
    const password = input.value.trim();
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'block';
        loadAllContent();
        updateImageCount();
        input.value = '';
        error.style.display = 'none';
    } else {
        error.style.display = 'block';
        input.value = '';
        input.focus();
        setTimeout(() => { error.style.display = 'none'; }, 3000);
    }
}

function checkAdminPageAccess() {
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    if (authenticated === 'true' && loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        if (elapsed < SESSION_TIMEOUT) {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboardScreen').style.display = 'block';
            return true;
        }
    }
    
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('dashboardScreen').style.display = 'none';
    return false;
}

function adminLogout() {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    location.reload();
}

// ========================================
// 📊 TAB SWITCHING
// ========================================

function switchTab(tab) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    
    document.getElementById('panel-' + tab).classList.add('active');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    loadAllContent();
}

// ========================================
// 🗄️ DATA MANAGEMENT
// ========================================

function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function updateImageCount() {
    const images = getImageStore();
    const countEl = document.getElementById('imageCount');
    if (countEl) countEl.textContent = images.length;
}

// ========================================
// 📝 BLOG POSTS
// ========================================

function loadBlogPosts() {
    const posts = getData('blogPosts');
    const container = document.getElementById('blogItems');
    
    if (posts.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-pen-fancy"></i><p>No blog posts yet. Write your first post!</p></div>`;
        return;
    }
    
    container.innerHTML = posts.map((post, index) => `
        <div class="admin-item">
            ${post.image ? `<img src="${post.image.url || post.image.data}" alt="${post.title}" class="item-image-preview" />` : ''}
            <h3>${post.title}</h3>
            <div class="item-meta">${post.category || 'Uncategorized'} · ${post.date}</div>
            <p class="item-preview">${post.excerpt}</p>
            <div class="item-actions">
                <button class="btn-edit" onclick="editBlogPost(${index})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" onclick="deleteBlogPost(${index})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

function publishBlogPost() {
    const title = document.getElementById('blogTitle').value.trim();
    const category = document.getElementById('blogCategory').value.trim();
    const date = document.getElementById('blogDate').value;
    const excerpt = document.getElementById('blogExcerpt').value.trim();
    const content = document.getElementById('blogContent').value.trim();
    const imageData = document.getElementById('blogImageData').value;
    const image = imageData ? JSON.parse(imageData) : null;
    
    if (!title || !excerpt || !content) {
        showToast('Please fill in all required fields (Title, Excerpt, Content).', 'error');
        return;
    }
    
    const posts = getData('blogPosts');
    posts.unshift({
        id: Date.now(),
        title,
        category: category || 'Uncategorized',
        date: date || new Date().toISOString().split('T')[0],
        excerpt,
        content,
        image: image
    });
    setData('blogPosts', posts);
    loadBlogPosts();
    clearBlogForm();
    showToast('✅ Blog post published successfully!', 'success');
}

function editBlogPost(index) {
    const posts = getData('blogPosts');
    const post = posts[index];
    
    document.getElementById('blogTitle').value = post.title;
    document.getElementById('blogCategory').value = post.category || '';
    document.getElementById('blogDate').value = post.date || '';
    document.getElementById('blogExcerpt').value = post.excerpt || '';
    document.getElementById('blogContent').value = post.content || '';
    
    if (post.image) {
        document.getElementById('blogImageData').value = JSON.stringify(post.image);
        const preview = document.getElementById('blogImagePreview');
        const url = post.image.url || post.image.data;
        preview.innerHTML = `<img src="${url}" alt="${post.title}" />`;
    }
    
    const btn = document.querySelector('#panel-blog .admin-form .btn-primary');
    btn.innerHTML = '<i class="fas fa-save"></i> Update Post';
    btn.onclick = function() { updateBlogPost(index); };
    
    document.querySelector('#panel-blog .admin-form').scrollIntoView({ behavior: 'smooth' });
}

function updateBlogPost(index) {
    const posts = getData('blogPosts');
    const title = document.getElementById('blogTitle').value.trim();
    const category = document.getElementById('blogCategory').value.trim();
    const date = document.getElementById('blogDate').value;
    const excerpt = document.getElementById('blogExcerpt').value.trim();
    const content = document.getElementById('blogContent').value.trim();
    const imageData = document.getElementById('blogImageData').value;
    const image = imageData ? JSON.parse(imageData) : posts[index].image || null;
    
    if (!title || !excerpt || !content) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    posts[index] = {
        ...posts[index],
        title,
        category: category || 'Uncategorized',
        date: date || posts[index].date,
        excerpt,
        content,
        image
    };
    setData('blogPosts', posts);
    loadBlogPosts();
    clearBlogForm();
    
    const btn = document.querySelector('#panel-blog .admin-form .btn-primary');
    btn.innerHTML = '<i class="fas fa-upload"></i> Publish Post';
    btn.onclick = publishBlogPost;
    
    showToast('✅ Blog post updated successfully!', 'success');
}

function deleteBlogPost(index) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    const posts = getData('blogPosts');
    posts.splice(index, 1);
    setData('blogPosts', posts);
    loadBlogPosts();
    showToast('🗑️ Blog post deleted.', 'info');
}

function clearBlogForm() {
    document.getElementById('blogTitle').value = '';
    document.getElementById('blogCategory').value = '';
    document.getElementById('blogDate').value = '';
    document.getElementById('blogExcerpt').value = '';
    document.getElementById('blogContent').value = '';
    document.getElementById('blogImageData').value = '';
    document.getElementById('blogImagePreview').innerHTML = '<div class="no-image">No image selected</div>';
}

// ========================================
// 📂 PROJECTS
// ========================================

function loadProjects() {
    const projects = getData('projects');
    const container = document.getElementById('portfolioItems');
    
    if (projects.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet. Add your first project!</p></div>`;
        return;
    }
    
    container.innerHTML = projects.map((project, index) => `
        <div class="admin-item">
            ${project.image ? `<img src="${project.image.url || project.image.data}" alt="${project.title}" class="item-image-preview" />` : ''}
            <h3>${project.title}</h3>
            <p class="item-preview">${project.description}</p>
            <div class="item-meta">${project.tech || 'Various'} · ${project.status || 'active'}</div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editProject(${index})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" onclick="deleteProject(${index})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

function publishProject() {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDesc').value.trim();
    const tech = document.getElementById('projectTech').value.trim();
    const github = document.getElementById('projectGithub').value.trim();
    const live = document.getElementById('projectLive').value.trim();
    const status = document.getElementById('projectStatus').value;
    const imageData = document.getElementById('projectImageData').value;
    const image = imageData ? JSON.parse(imageData) : null;
    
    if (!title || !description) {
        showToast('Please fill in Project Name and Description.', 'error');
        return;
    }
    
    const projects = getData('projects');
    projects.unshift({
        id: Date.now(),
        title,
        description,
        tech: tech || 'Various',
        github: github || '',
        live: live || '',
        status: status || 'active',
        image: image
    });
    setData('projects', projects);
    loadProjects();
    clearProjectForm();
    showToast('✅ Project added successfully!', 'success');
}

function editProject(index) {
    const projects = getData('projects');
    const project = projects[index];
    
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDesc').value = project.description;
    document.getElementById('projectTech').value = project.tech || '';
    document.getElementById('projectGithub').value = project.github || '';
    document.getElementById('projectLive').value = project.live || '';
    document.getElementById('projectStatus').value = project.status || 'active';
    
    if (project.image) {
        document.getElementById('projectImageData').value = JSON.stringify(project.image);
        const preview = document.getElementById('projectImagePreview');
        const url = project.image.url || project.image.data;
        preview.innerHTML = `<img src="${url}" alt="${project.title}" />`;
    }
    
    const btn = document.querySelector('#panel-portfolio .admin-form .btn-primary');
    btn.innerHTML = '<i class="fas fa-save"></i> Update Project';
    btn.onclick = function() { updateProject(index); };
    
    document.querySelector('#panel-portfolio .admin-form').scrollIntoView({ behavior: 'smooth' });
}

function updateProject(index) {
    const projects = getData('projects');
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDesc').value.trim();
    const tech = document.getElementById('projectTech').value.trim();
    const github = document.getElementById('projectGithub').value.trim();
    const live = document.getElementById('projectLive').value.trim();
    const status = document.getElementById('projectStatus').value;
    const imageData = document.getElementById('projectImageData').value;
    const image = imageData ? JSON.parse(imageData) : projects[index].image || null;
    
    if (!title || !description) {
        showToast('Please fill in Project Name and Description.', 'error');
        return;
    }
    
    projects[index] = {
        ...projects[index],
        title,
        description,
        tech: tech || 'Various',
        github: github || '',
        live: live || '',
        status: status || 'active',
        image
    };
    setData('projects', projects);
    loadProjects();
    clearProjectForm();
    
    const btn = document.querySelector('#panel-portfolio .admin-form .btn-primary');
    btn.innerHTML = '<i class="fas fa-upload"></i> Add Project';
    btn.onclick = publishProject;
    
    showToast('✅ Project updated successfully!', 'success');
}

function deleteProject(index) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const projects = getData('projects');
    projects.splice(index, 1);
    setData('projects', projects);
    loadProjects();
    showToast('🗑️ Project deleted.', 'info');
}

function clearProjectForm() {
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDesc').value = '';
    document.getElementById('projectTech').value = '';
    document.getElementById('projectGithub').value = '';
    document.getElementById('projectLive').value = '';
    document.getElementById('projectStatus').value = 'active';
    document.getElementById('projectImageData').value = '';
    document.getElementById('projectImagePreview').innerHTML = '<div class="no-image">No image selected</div>';
}

// ========================================
// 🏅 ACHIEVEMENTS
// ========================================

function loadAchievements() {
    const achievements = getData('achievements');
    const container = document.getElementById('achievementItems');
    
    if (achievements.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-trophy"></i><p>No achievements yet. Add your first achievement!</p></div>`;
        return;
    }
    
    container.innerHTML = achievements.map((achieve, index) => `
        <div class="admin-item">
            ${achieve.image ? `<img src="${achieve.image.url || achieve.image.data}" alt="${achieve.title}" class="item-image-preview" />` : `<div style="font-size:2rem;">${achieve.icon || '🏅'}</div>`}
            <h3>${achieve.title}</h3>
            <div class="item-meta">${achieve.date}</div>
            <p class="item-preview">${achieve.description}</p>
            <div class="item-actions">
                <button class="btn-edit" onclick="editAchievement(${index})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" onclick="deleteAchievement(${index})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

function publishAchievement() {
    const title = document.getElementById('achieveTitle').value.trim();
    const date = document.getElementById('achieveDate').value.trim();
    const description = document.getElementById('achieveDesc').value.trim();
    const tags = document.getElementById('achieveTags').value.trim();
    const icon = document.getElementById('achieveIcon').value.trim();
    const imageData = document.getElementById('achievementImageData').value;
    const image = imageData ? JSON.parse(imageData) : null;
    
    if (!title || !date || !description) {
        showToast('Please fill in Title, Date, and Description.', 'error');
        return;
    }
    
    const achievements = getData('achievements');
    achievements.unshift({
        id: Date.now(),
        title,
        date,
        description,
        tags: tags || '',
        icon: icon || '🏅',
        image: image
    });
    setData('achievements', achievements);
    loadAchievements();
    clearAchievementForm();
    showToast('✅ Achievement added successfully!', 'success');
}

function editAchievement(index) {
    const achievements = getData('achievements');
    const achieve = achievements[index];
    
    document.getElementById('achieveTitle').value = achieve.title;
    document.getElementById('achieveDate').value = achieve.date;
    document.getElementById('achieveDesc').value = achieve.description;
    document.getElementById('achieveTags').value = achieve.tags || '';
    document.getElementById('achieveIcon').value = achieve.icon || '';
    
    if (achieve.image) {
        document.getElementById('achievementImageData').value = JSON.stringify(achieve.image);
        const preview = document.getElementById('achievementImagePreview');
        const url = achieve.image.url || achieve.image.data;
        preview.innerHTML = `<img src="${url}" alt="${achieve.title}" />`;
    }
    
    const btn = document.querySelector('#panel-achievements .admin-form .btn-primary');
    btn.innerHTML = '<i class="fas fa-save"></i> Update Achievement';
    btn.onclick = function() { updateAchievement(index); };
    
    document.querySelector('#panel-achievements .admin-form').scrollIntoView({ behavior: 'smooth' });
}

function updateAchievement(index) {
    const achievements = getData('achievements');
    const title = document.getElementById('achieveTitle').value.trim();
    const date = document.getElementById('achieveDate').value.trim();
    const description = document.getElementById('achieveDesc').value.trim();
    const tags = document.getElementById('achieveTags').value.trim();
    const icon = document.getElementById('achieveIcon').value.trim();
    const imageData = document.getElementById('achievementImageData').value;
    const image = imageData ? JSON.parse(imageData) : achievements[index].image || null;
    
    if (!title || !date || !description) {
        showToast('Please fill in Title, Date, and Description.', 'error');
        return;
    }
    
    achievements[index] = {
        ...achievements[index],
        title,
        date,
        description,
        tags: tags || '',
        icon: icon || '🏅',
        image
    };
    setData('achievements', achievements);
    loadAchievements();
    clearAchievementForm();
    
    const btn = document.querySelector('#panel-achievements .admin-form .btn-primary');
    btn.innerHTML = '<i class="fas fa-upload"></i> Add Achievement';
    btn.onclick = publishAchievement;
    
    showToast('✅ Achievement updated successfully!', 'success');
}

function deleteAchievement(index) {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    const achievements = getData('achievements');
    achievements.splice(index, 1);
    setData('achievements', achievements);
    loadAchievements();
    showToast('🗑️ Achievement deleted.', 'info');
}

function clearAchievementForm() {
    document.getElementById('achieveTitle').value = '';
    document.getElementById('achieveDate').value = '';
    document.getElementById('achieveDesc').value = '';
    document.getElementById('achieveTags').value = '';
    document.getElementById('achieveIcon').value = '';
    document.getElementById('achievementImageData').value = '';
    document.getElementById('achievementImagePreview').innerHTML = '<div class="no-image">No image selected</div>';
}

// ========================================
// 💾 INITIALIZE DEFAULT CONTENT
// ========================================

function initializeDefaultContent() {
    if (localStorage.getItem('blogPosts') || localStorage.getItem('projects') || localStorage.getItem('achievements')) {
        return;
    }
    
    const blogPosts = [
        {
            id: Date.now() + 1,
            title: 'My Journey from NOAI to AOAI to IOAI',
            category: 'AI Olympiad',
            date: '2026-06-15',
            excerpt: 'From competing at the national level to representing Zimbabwe on the international stage.',
            content: '<p>From competing at the national level to representing Zimbabwe on the international stage — here\'s how I prepared for the AI Olympiads and what I learned along the way.</p>',
            image: null
        }
    ];
    
    const projects = [
        {
            id: Date.now() + 2,
            title: 'Developer Burnout Predictor',
            description: 'ML model predicting developer burnout based on bugs encountered, sleep hours, and more.',
            tech: 'Python, Jupyter, Scikit-learn',
            github: 'https://github.com/0718083803/Machine-Learning-Developer-Burnout-Prediction-Model',
            live: '',
            status: 'coming',
            image: null
        }
    ];
    
    const achievements = [
        {
            id: Date.now() + 3,
            title: 'International Olympiad in Artificial Intelligence (IOAI)',
            date: '2026',
            description: 'Selected to represent Zimbabwe at the IOAI 2026 in Kazakhstan.',
            tags: 'International, AI Olympiad, Zimbabwe',
            icon: '🏆',
            image: null
        }
    ];
    
    setData('blogPosts', blogPosts);
    setData('projects', projects);
    setData('achievements', achievements);
}

// ========================================
// 💾 EXPORT / IMPORT
// ========================================

function exportContent() {
    const data = {
        blogPosts: getData('blogPosts'),
        projects: getData('projects'),
        achievements: getData('achievements'),
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Content exported successfully!', 'success');
}

function importContent(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.blogPosts) setData('blogPosts', data.blogPosts);
            if (data.projects) setData('projects', data.projects);
            if (data.achievements) setData('achievements', data.achievements);
            loadAllContent();
            showToast('✅ Content imported successfully!', 'success');
        } catch (error) {
            showToast('❌ Error importing file. Please make sure it\'s a valid backup file.', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function resetContent() {
    if (!confirm('⚠️ WARNING: This will delete ALL content. Are you sure?')) return;
    if (!confirm('⚠️ FINAL WARNING: This cannot be undone! Delete everything?')) return;
    
    localStorage.removeItem('blogPosts');
    localStorage.removeItem('projects');
    localStorage.removeItem('achievements');
    
    initializeDefaultContent();
    loadAllContent();
    updateImageCount();
    showToast('🔄 Content has been reset to default.', 'info');
}

// ========================================
// 📊 LOAD ALL CONTENT
// ========================================

function loadAllContent() {
    loadBlogPosts();
    loadProjects();
    loadAchievements();
    updateImageCount();
    
    // Initialize image pickers with selection handling
    initializeImagePickers();
}

// ========================================
// 📸 IMAGE PICKERS INIT
// ========================================

function initializeImagePickers() {
    // Blog image picker
    const blogPicker = document.getElementById('blogImagePicker');
    if (blogPicker) {
        const existingData = document.getElementById('blogImageData').value;
        let selectedId = null;
        if (existingData) {
            try {
                const data = JSON.parse(existingData);
                selectedId = data.id || data.url;
            } catch {}
        }
        createImagePicker('blogImagePicker', function(image) {
            document.getElementById('blogImageData').value = JSON.stringify(image);
            const preview = document.getElementById('blogImagePreview');
            const url = image.url || image.data;
            preview.innerHTML = `<img src="${url}" alt="${image.name || 'Image'}" />`;
            showToast('✅ Image selected!', 'success');
        }, selectedId);
    }
    
    // Project image picker
    const projectPicker = document.getElementById('projectImagePicker');
    if (projectPicker) {
        const existingData = document.getElementById('projectImageData').value;
        let selectedId = null;
        if (existingData) {
            try {
                const data = JSON.parse(existingData);
                selectedId = data.id || data.url;
            } catch {}
        }
        createImagePicker('projectImagePicker', function(image) {
            document.getElementById('projectImageData').value = JSON.stringify(image);
            const preview = document.getElementById('projectImagePreview');
            const url = image.url || image.data;
            preview.innerHTML = `<img src="${url}" alt="${image.name || 'Image'}" />`;
            showToast('✅ Image selected!', 'success');
        }, selectedId);
    }
    
    // Achievement image picker
    const achievePicker = document.getElementById('achievementImagePicker');
    if (achievePicker) {
        const existingData = document.getElementById('achievementImageData').value;
        let selectedId = null;
        if (existingData) {
            try {
                const data = JSON.parse(existingData);
                selectedId = data.id || data.url;
            } catch {}
        }
        createImagePicker('achievementImagePicker', function(image) {
            document.getElementById('achievementImageData').value = JSON.stringify(image);
            const preview = document.getElementById('achievementImagePreview');
            const url = image.url || image.data;
            preview.innerHTML = `<img src="${url}" alt="${image.name || 'Image'}" />`;
            showToast('✅ Image selected!', 'success');
        }, selectedId);
    }
}

// ========================================
// 🚀 INITIALIZE
// ========================================

// Check authentication
checkAdminPageAccess();

// Initialize data
initializeDefaultContent();
loadAllContent();

// Inactivity timer
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (sessionStorage.getItem('adminAuthenticated')) {
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminLoginTime');
            showToast('⏰ Auto-logged out due to inactivity.', 'info');
            setTimeout(() => location.reload(), 1500);
        }
    }, 15 * 60 * 1000);
}

document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);