/* ========================================
   ADMIN.JS — Complete Content Management System
   Secret Access: Moon emoji + password
   ======================================== */

// ========================================
// 🔐 SECURITY CONFIGURATION
// ========================================

const ADMIN_PASSWORD = '@sande263';  // ← YOUR SECRET PASSWORD
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ========================================
// SECRET ACCESS: Moon Emoji Click
// ========================================

let moonClickCount = 0;
let moonClickTimer = null;
let isAdminMode = false;

// Check if already authenticated
function checkAdminSession() {
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    if (authenticated === 'true' && loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        if (elapsed < SESSION_TIMEOUT) {
            isAdminMode = true;
            return true;
        } else {
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminLoginTime');
        }
    }
    return false;
}

// Setup moon click listener
function setupMoonAccess() {
    const moonElement = document.getElementById('moonAccess');
    if (!moonElement) return;
    
    moonElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        moonClickCount++;
        
        // Reset after 2 seconds of no clicks
        clearTimeout(moonClickTimer);
        moonClickTimer = setTimeout(() => {
            moonClickCount = 0;
        }, 2000);
        
        // 3 clicks = trigger password prompt
        if (moonClickCount === 3) {
            moonClickCount = 0;
            clearTimeout(moonClickTimer);
            triggerPasswordPrompt();
        }
    });
}

// Show password prompt
function triggerPasswordPrompt() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'adminLoginOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.92);
        backdrop-filter: blur(20px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    overlay.innerHTML = `
        <div style="
            background: rgba(20, 20, 20, 0.95);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 24px;
            padding: 3rem;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 0 60px rgba(0,0,0,0.5);
        ">
            <div style="font-size: 4rem; margin-bottom: 0.5rem;">🔐</div>
            <h2 style="color: #fff; font-weight: 600; margin-bottom: 0.5rem;">Admin Access</h2>
            <p style="color: #888; font-size: 0.9rem; margin-bottom: 1.5rem;">Enter the secret password</p>
            <input type="password" id="secretPasswordInput" placeholder="Enter password..." style="
                width: 100%;
                padding: 0.8rem 1rem;
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 12px;
                color: #fff;
                font-size: 1rem;
                font-family: 'Inter', sans-serif;
                margin-bottom: 1rem;
                text-align: center;
            " />
            <button id="secretLoginBtn" style="
                width: 100%;
                padding: 0.8rem;
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                color: #fff;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
            ">Unlock Dashboard</button>
            <p id="secretLoginError" style="color: #ff6b6b; margin-top: 0.8rem; font-size: 0.85rem; display: none;">
                ❌ Incorrect password. Try again.
            </p>
            <button id="closeLoginOverlay" style="
                margin-top: 1rem;
                background: none;
                border: none;
                color: #555;
                cursor: pointer;
                font-size: 0.8rem;
                font-family: 'Inter', sans-serif;
            ">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Focus on password input
    const input = document.getElementById('secretPasswordInput');
    input.focus();
    
    // Login button handler
    document.getElementById('secretLoginBtn').addEventListener('click', function() {
        const password = input.value.trim();
        if (password === ADMIN_PASSWORD) {
            // Success!
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminLoginTime', Date.now().toString());
            isAdminMode = true;
            
            // Remove overlay
            overlay.remove();
            
            // Redirect to admin page
            window.location.href = 'admin.html';
        } else {
            const error = document.getElementById('secretLoginError');
            error.style.display = 'block';
            input.value = '';
            input.focus();
            setTimeout(() => { error.style.display = 'none'; }, 3000);
        }
    });
    
    // Enter key on input
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('secretLoginBtn').click();
        }
    });
    
    // Close overlay
    document.getElementById('closeLoginOverlay').addEventListener('click', function() {
        overlay.remove();
        moonClickCount = 0;
    });
    
    // Click outside to close
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
            moonClickCount = 0;
        }
    });
}

// ========================================
// CHECK SESSION ON LOAD
// ========================================

if (checkAdminSession()) {
    // User is authenticated - show admin indicator
    console.log('✅ Admin mode active');
}

// ========================================
// ADMIN PAGE FUNCTIONS
// ========================================

// Only run these if we're on admin.html
if (document.getElementById('adminDashboard')) {
    
    // Password protection for admin.html
    function checkAdminPageAccess() {
        const authenticated = sessionStorage.getItem('adminAuthenticated');
        const loginTime = sessionStorage.getItem('adminLoginTime');
        
        if (authenticated === 'true' && loginTime) {
            const elapsed = Date.now() - parseInt(loginTime);
            if (elapsed < SESSION_TIMEOUT) {
                return true;
            }
        }
        
        // Not authenticated - show login screen
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('dashboardScreen').style.display = 'none';
        return false;
    }
    
    // Check access on page load
    if (!checkAdminPageAccess()) {
        // Show login screen
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('dashboardScreen').style.display = 'none';
    }
    
    // Tab switching
    window.switchTab = function(tab) {
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        
        document.getElementById('panel-' + tab).classList.add('active');
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        loadAllContent();
    };
    
    // ========================================
    // DATA MANAGEMENT
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
    
    // ========================================
    // DEFAULT CONTENT
    // ========================================
    
    function initializeDefaultContent() {
        // Only set defaults if no content exists
        if (localStorage.getItem('blogPosts') || localStorage.getItem('projects') || localStorage.getItem('achievements')) {
            return;
        }
        
        const blogPosts = [
            {
                id: Date.now() + 1,
                title: 'My Journey from NOAI to AOAI to IOAI',
                category: 'AI Olympiad',
                date: '2026-06-15',
                excerpt: 'From competing at the national level to representing Zimbabwe on the international stage — here\'s how I prepared for the AI Olympiads.',
                content: '<p>From competing at the national level to representing Zimbabwe on the international stage — here\'s how I prepared for the AI Olympiads and what I learned along the way.</p><p><strong>The Beginning:</strong> My journey started with the National Olympiad in Artificial Intelligence (NOAI). I was just a high school student with a passion for AI, and competing at the national level was my first real test.</p><p><strong>The African Stage:</strong> After qualifying, I moved on to the African Olympiad in Artificial Intelligence (AOAI). Competing against the best young minds from across the continent was both intimidating and inspiring.</p><p><strong>The International Stage:</strong> Being selected for the International Olympiad in Artificial Intelligence (IOAI) 2026 in Kazakhstan was a dream come true.</p>'
            },
            {
                id: Date.now() + 2,
                title: 'Understanding Neural Networks from Scratch',
                category: 'Deep Learning',
                date: '2026-05-20',
                excerpt: 'A beginner-friendly breakdown of how neural networks work, from the mathematics of neurons to backpropagation.',
                content: '<p>A beginner-friendly breakdown of how neural networks work, from the mathematics of neurons to backpropagation and activation functions.</p><p>Neural networks are at the heart of modern AI. In this post, I break down the core concepts in a way that\'s accessible to beginners.</p>'
            }
        ];
        
        const projects = [
            {
                id: Date.now() + 3,
                title: 'Developer Burnout Predictor',
                description: 'ML model predicting developer burnout based on bugs encountered, sleep hours, and more.',
                tech: 'Python, Jupyter, Scikit-learn, Pandas',
                github: 'https://github.com/0718083803/Machine-Learning-Developer-Burnout-Prediction-Model',
                live: '',
                status: 'coming'
            },
            {
                id: Date.now() + 4,
                title: 'Memory Match Game',
                description: 'Interactive memory-boosting tile-matching game built with Ren\'Py.',
                tech: 'Ren\'Py, Python, Game Dev',
                github: 'https://github.com/0718083803/memory-match',
                live: '',
                status: 'coming'
            }
        ];
        
        const achievements = [
            {
                id: Date.now() + 5,
                title: 'International Olympiad in Artificial Intelligence (IOAI)',
                date: '2026',
                description: 'Selected to represent Zimbabwe at the IOAI 2026 in Kazakhstan.',
                tags: 'International, AI Olympiad, Zimbabwe',
                icon: '🏆'
            },
            {
                id: Date.now() + 6,
                title: 'African Olympiad in Artificial Intelligence (AOAI)',
                date: '2025',
                description: 'Represented Zimbabwe at the African level.',
                tags: 'Continental, AI Olympiad',
                icon: '🌍'
            }
        ];
        
        setData('blogPosts', blogPosts);
        setData('projects', projects);
        setData('achievements', achievements);
    }
    
    // ========================================
    // LOAD CONTENT
    // ========================================
    
    function loadAllContent() {
        loadBlogPosts();
        loadProjects();
        loadAchievements();
    }
    
    // ----- BLOG POSTS -----
    function loadBlogPosts() {
        const posts = getData('blogPosts');
        const container = document.getElementById('blogItems');
        
        if (posts.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-pen-fancy"></i><p>No blog posts yet. Write your first post!</p></div>`;
            return;
        }
        
        container.innerHTML = posts.map((post, index) => `
            <div class="admin-item">
                <h3>${post.title}</h3>
                <div class="item-meta">${post.category} · ${post.date}</div>
                <p class="item-preview">${post.excerpt}</p>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editBlogPost(${index})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteBlogPost(${index})"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    window.publishBlogPost = function() {
        const title = document.getElementById('blogTitle').value.trim();
        const category = document.getElementById('blogCategory').value.trim();
        const date = document.getElementById('blogDate').value;
        const excerpt = document.getElementById('blogExcerpt').value.trim();
        const content = document.getElementById('blogContent').value.trim();
        
        if (!title || !excerpt || !content) {
            alert('Please fill in all required fields (Title, Excerpt, Content).');
            return;
        }
        
        const posts = getData('blogPosts');
        posts.unshift({
            id: Date.now(),
            title,
            category: category || 'Uncategorized',
            date: date || new Date().toISOString().split('T')[0],
            excerpt,
            content
        });
        setData('blogPosts', posts);
        loadBlogPosts();
        clearBlogForm();
        alert('✅ Blog post published successfully!');
    };
    
    window.editBlogPost = function(index) {
        const posts = getData('blogPosts');
        const post = posts[index];
        
        document.getElementById('blogTitle').value = post.title;
        document.getElementById('blogCategory').value = post.category || '';
        document.getElementById('blogDate').value = post.date || '';
        document.getElementById('blogExcerpt').value = post.excerpt || '';
        document.getElementById('blogContent').value = post.content || '';
        
        const btn = document.querySelector('#panel-blog .admin-form .btn-primary');
        btn.innerHTML = '<i class="fas fa-save"></i> Update Post';
        btn.onclick = function() { updateBlogPost(index); };
        
        document.querySelector('#panel-blog .admin-form').scrollIntoView({ behavior: 'smooth' });
    };
    
    window.updateBlogPost = function(index) {
        const posts = getData('blogPosts');
        const title = document.getElementById('blogTitle').value.trim();
        const category = document.getElementById('blogCategory').value.trim();
        const date = document.getElementById('blogDate').value;
        const excerpt = document.getElementById('blogExcerpt').value.trim();
        const content = document.getElementById('blogContent').value.trim();
        
        if (!title || !excerpt || !content) {
            alert('Please fill in all required fields.');
            return;
        }
        
        posts[index] = {
            ...posts[index],
            title,
            category: category || 'Uncategorized',
            date: date || posts[index].date,
            excerpt,
            content
        };
        setData('blogPosts', posts);
        loadBlogPosts();
        clearBlogForm();
        
        const btn = document.querySelector('#panel-blog .admin-form .btn-primary');
        btn.innerHTML = '<i class="fas fa-upload"></i> Publish Post';
        btn.onclick = window.publishBlogPost;
        
        alert('✅ Blog post updated successfully!');
    };
    
    window.deleteBlogPost = function(index) {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        const posts = getData('blogPosts');
        posts.splice(index, 1);
        setData('blogPosts', posts);
        loadBlogPosts();
        alert('🗑️ Blog post deleted.');
    };
    
    function clearBlogForm() {
        document.getElementById('blogTitle').value = '';
        document.getElementById('blogCategory').value = '';
        document.getElementById('blogDate').value = '';
        document.getElementById('blogExcerpt').value = '';
        document.getElementById('blogContent').value = '';
    }
    
    // ----- PROJECTS -----
    function loadProjects() {
        const projects = getData('projects');
        const container = document.getElementById('portfolioItems');
        
        if (projects.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet. Add your first project!</p></div>`;
            return;
        }
        
        container.innerHTML = projects.map((project, index) => `
            <div class="admin-item">
                <h3>${project.title}</h3>
                <p class="item-preview">${project.description}</p>
                <div class="item-meta">${project.tech} · ${project.status}</div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editProject(${index})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteProject(${index})"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    window.publishProject = function() {
        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDesc').value.trim();
        const tech = document.getElementById('projectTech').value.trim();
        const github = document.getElementById('projectGithub').value.trim();
        const live = document.getElementById('projectLive').value.trim();
        const status = document.getElementById('projectStatus').value;
        
        if (!title || !description) {
            alert('Please fill in Project Name and Description.');
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
            status: status || 'active'
        });
        setData('projects', projects);
        loadProjects();
        clearProjectForm();
        alert('✅ Project added successfully!');
    };
    
    window.editProject = function(index) {
        const projects = getData('projects');
        const project = projects[index];
        
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDesc').value = project.description;
        document.getElementById('projectTech').value = project.tech || '';
        document.getElementById('projectGithub').value = project.github || '';
        document.getElementById('projectLive').value = project.live || '';
        document.getElementById('projectStatus').value = project.status || 'active';
        
        const btn = document.querySelector('#panel-portfolio .admin-form .btn-primary');
        btn.innerHTML = '<i class="fas fa-save"></i> Update Project';
        btn.onclick = function() { updateProject(index); };
        
        document.querySelector('#panel-portfolio .admin-form').scrollIntoView({ behavior: 'smooth' });
    };
    
    window.updateProject = function(index) {
        const projects = getData('projects');
        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDesc').value.trim();
        const tech = document.getElementById('projectTech').value.trim();
        const github = document.getElementById('projectGithub').value.trim();
        const live = document.getElementById('projectLive').value.trim();
        const status = document.getElementById('projectStatus').value;
        
        if (!title || !description) {
            alert('Please fill in Project Name and Description.');
            return;
        }
        
        projects[index] = {
            ...projects[index],
            title,
            description,
            tech: tech || 'Various',
            github: github || '',
            live: live || '',
            status: status || 'active'
        };
        setData('projects', projects);
        loadProjects();
        clearProjectForm();
        
        const btn = document.querySelector('#panel-portfolio .admin-form .btn-primary');
        btn.innerHTML = '<i class="fas fa-upload"></i> Add Project';
        btn.onclick = window.publishProject;
        
        alert('✅ Project updated successfully!');
    };
    
    window.deleteProject = function(index) {
        if (!confirm('Are you sure you want to delete this project?')) return;
        const projects = getData('projects');
        projects.splice(index, 1);
        setData('projects', projects);
        loadProjects();
        alert('🗑️ Project deleted.');
    };
    
    function clearProjectForm() {
        document.getElementById('projectTitle').value = '';
        document.getElementById('projectDesc').value = '';
        document.getElementById('projectTech').value = '';
        document.getElementById('projectGithub').value = '';
        document.getElementById('projectLive').value = '';
        document.getElementById('projectStatus').value = 'active';
    }
    
    // ----- ACHIEVEMENTS -----
    function loadAchievements() {
        const achievements = getData('achievements');
        const container = document.getElementById('achievementItems');
        
        if (achievements.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-trophy"></i><p>No achievements yet. Add your first achievement!</p></div>`;
            return;
        }
        
        container.innerHTML = achievements.map((achieve, index) => `
            <div class="admin-item">
                <h3>${achieve.icon || '🏅'} ${achieve.title}</h3>
                <div class="item-meta">${achieve.date}</div>
                <p class="item-preview">${achieve.description}</p>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editAchievement(${index})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteAchievement(${index})"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    window.publishAchievement = function() {
        const title = document.getElementById('achieveTitle').value.trim();
        const date = document.getElementById('achieveDate').value.trim();
        const description = document.getElementById('achieveDesc').value.trim();
        const tags = document.getElementById('achieveTags').value.trim();
        const icon = document.getElementById('achieveIcon').value.trim();
        
        if (!title || !date || !description) {
            alert('Please fill in Title, Date, and Description.');
            return;
        }
        
        const achievements = getData('achievements');
        achievements.unshift({
            id: Date.now(),
            title,
            date,
            description,
            tags: tags || '',
            icon: icon || '🏅'
        });
        setData('achievements', achievements);
        loadAchievements();
        clearAchievementForm();
        alert('✅ Achievement added successfully!');
    };
    
    window.editAchievement = function(index) {
        const achievements = getData('achievements');
        const achieve = achievements[index];
        
        document.getElementById('achieveTitle').value = achieve.title;
        document.getElementById('achieveDate').value = achieve.date;
        document.getElementById('achieveDesc').value = achieve.description;
        document.getElementById('achieveTags').value = achieve.tags || '';
        document.getElementById('achieveIcon').value = achieve.icon || '';
        
        const btn = document.querySelector('#panel-achievements .admin-form .btn-primary');
        btn.innerHTML = '<i class="fas fa-save"></i> Update Achievement';
        btn.onclick = function() { updateAchievement(index); };
        
        document.querySelector('#panel-achievements .admin-form').scrollIntoView({ behavior: 'smooth' });
    };
    
    window.updateAchievement = function(index) {
        const achievements = getData('achievements');
        const title = document.getElementById('achieveTitle').value.trim();
        const date = document.getElementById('achieveDate').value.trim();
        const description = document.getElementById('achieveDesc').value.trim();
        const tags = document.getElementById('achieveTags').value.trim();
        const icon = document.getElementById('achieveIcon').value.trim();
        
        if (!title || !date || !description) {
            alert('Please fill in Title, Date, and Description.');
            return;
        }
        
        achievements[index] = {
            ...achievements[index],
            title,
            date,
            description,
            tags: tags || '',
            icon: icon || '🏅'
        };
        setData('achievements', achievements);
        loadAchievements();
        clearAchievementForm();
        
        const btn = document.querySelector('#panel-achievements .admin-form .btn-primary');
        btn.innerHTML = '<i class="fas fa-upload"></i> Add Achievement';
        btn.onclick = window.publishAchievement;
        
        alert('✅ Achievement updated successfully!');
    };
    
    window.deleteAchievement = function(index) {
        if (!confirm('Are you sure you want to delete this achievement?')) return;
        const achievements = getData('achievements');
        achievements.splice(index, 1);
        setData('achievements', achievements);
        loadAchievements();
        alert('🗑️ Achievement deleted.');
    };
    
    function clearAchievementForm() {
        document.getElementById('achieveTitle').value = '';
        document.getElementById('achieveDate').value = '';
        document.getElementById('achieveDesc').value = '';
        document.getElementById('achieveTags').value = '';
        document.getElementById('achieveIcon').value = '';
    }
    
    // ========================================
    // EXPORT / IMPORT
    // ========================================
    
    window.exportContent = function() {
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
        alert('✅ Content exported successfully!');
    };
    
    window.importContent = function(event) {
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
                alert('✅ Content imported successfully!');
            } catch (error) {
                alert('❌ Error importing file. Please make sure it\'s a valid backup file.');
                console.error(error);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };
    
    window.resetContent = function() {
        if (!confirm('⚠️ WARNING: This will delete ALL content. Are you sure?')) return;
        if (!confirm('⚠️ FINAL WARNING: This cannot be undone! Delete everything?')) return;
        
        localStorage.removeItem('blogPosts');
        localStorage.removeItem('projects');
        localStorage.removeItem('achievements');
        
        initializeDefaultContent();
        loadAllContent();
        alert('🔄 Content has been reset to default.');
    };
    
    // ========================================
    // LOGOUT
    // ========================================
    
    window.adminLogout = function() {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminLoginTime');
        location.reload();
    };
    
    // ========================================
    // INITIALIZE
    // ========================================
    
    initializeDefaultContent();
    loadAllContent();
    
    // Reset inactivity timer
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (sessionStorage.getItem('adminAuthenticated')) {
                sessionStorage.removeItem('adminAuthenticated');
                sessionStorage.removeItem('adminLoginTime');
                alert('You have been automatically logged out due to inactivity.');
                location.reload();
            }
        }, 15 * 60 * 1000);
    }
    
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('keydown', resetInactivityTimer);
    document.addEventListener('scroll', resetInactivityTimer);
}

// ========================================
// INITIALIZE MOON ACCESS ON ALL PAGES
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    setupMoonAccess();
});