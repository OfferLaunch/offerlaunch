// Auto-resize textarea in chat
const chatTextarea = document.querySelector('.chat-input textarea');
if (chatTextarea) {
    chatTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// File upload preview
const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(input => {
    input.addEventListener('change', function() {
        const label = this.nextElementSibling;
        const fileName = this.files[0]?.name || 'No file chosen';
        label.querySelector('span').textContent = fileName;
        
        // Add success state
        label.classList.add('upload-success');
        setTimeout(() => {
            label.classList.remove('upload-success');
        }, 2000);
    });
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenu = document.querySelector('.mobile-menu');
const sidebarNav = document.querySelector('.sidebar-nav');
if (mobileMenu && sidebarNav) {
    mobileMenu.addEventListener('click', () => {
        sidebarNav.classList.toggle('active');
    });
}

// Status badge animations
const statusBadges = document.querySelectorAll('.status-badge');
statusBadges.forEach(badge => {
    if (badge.classList.contains('in-progress')) {
        badge.style.animation = 'pulse 2s infinite';
    }
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
    }
    
    .upload-success {
        background: rgba(255, 230, 109, 0.2) !important;
        color: var(--primary) !important;
    }
`;
document.head.appendChild(style);

// Timeline scroll animation
const timelineItems = document.querySelectorAll('.timeline-item');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.5 });

timelineItems.forEach(item => observer.observe(item));

// Add CSS for timeline animation
const timelineStyle = document.createElement('style');
timelineStyle.textContent = `
    .timeline-item {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
    }
    
    .timeline-item.fade-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(timelineStyle);

// Chat message handling
const chatForm = document.querySelector('.chat-input');
if (chatForm) {
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const textarea = this.querySelector('textarea');
        const message = textarea.value.trim();
        
        if (message) {
            // Add message to chat
            const chatMessages = document.querySelector('.chat-messages');
            const messageHTML = `
                <div class="message client">
                    <div class="message-content">
                        <p>${message}</p>
                    </div>
                    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', messageHTML);
            
            // Clear input and reset height
            textarea.value = '';
            textarea.style.height = 'auto';
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
}

// Progress bar animation
const progressBar = document.querySelector('.progress');
if (progressBar) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = progressBar.style.width;
                progressBar.style.width = '0';
                setTimeout(() => {
                    progressBar.style.width = width;
                }, 100);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(progressBar);
}

// Document download handling
document.querySelectorAll('.btn-icon[title="Download"]').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        // Add loading state
        this.classList.add('loading');
        setTimeout(() => {
            this.classList.remove('loading');
        }, 1000);
    });
});

// Add loading animation CSS
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    .btn-icon.loading {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loadingStyle); 