/* ========================================
   SCRIPT.JS — Brandon Sande Portfolio
   Animations, interactions, nav toggle
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {

    // ---------- Mobile Nav Toggle ----------
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('open');
            // Animate hamburger
            const lines = this.querySelectorAll('.hamburger-line');
            lines.forEach(line => line.classList.toggle('active'));
        });

        // Close nav on link click (mobile)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
            });
        });
    }

    // ---------- Typing Animation (Hero) ----------
    const typingElement = document.getElementById('typingText');
    if (typingElement) {
        const phrases = [
            'AI & Machine Learning Developer',
            'IOAI 2026 Zimbabwe Team',
            'Python & PyTorch Enthusiast',
            'Building intelligent systems'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;

        function typeEffect() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                isDeleting = true;
                typingSpeed = 1500; // pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400; // pause before next
            }

            setTimeout(typeEffect, typingSpeed);
        }

        // Start typing after a short delay
        setTimeout(typeEffect, 600);
    }

    // ---------- Animated Counters ----------
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length > 0) {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    animateCounter(el, target);
                    counterObserver.unobserve(el);
                }
            });
        }, observerOptions);

        statNumbers.forEach(el => counterObserver.observe(el));
    }

    function animateCounter(element, target) {
        let current = 0;
        const increment = Math.ceil(target / 40); // 40 steps
        const duration = 1000; // 1 second
        const stepTime = duration / 40;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = current;
            }
        }, stepTime);
    }

    // ---------- Fade-in on Scroll (Intersection Observer) ----------
    const fadeElements = document.querySelectorAll('.glow-hover, .project-card, .blog-card, .timeline-item, .plan-card, .skill-card, .interest-card, .portfolio-card');

    if (fadeElements.length > 0) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        fadeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            fadeObserver.observe(el);
        });
    }

    // ---------- Contact Form (ready for Formspree/EmailJS) ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const subject = document.getElementById('subject')?.value || '';
            const message = document.getElementById('message')?.value || '';

            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            // ============================================================
            // TO CONNECT TO FORMSPREE:
            // 1. Go to https://formspree.io/ and create a new form
            // 2. Get your form endpoint URL (e.g., https://formspree.io/f/xxxxx)
            // 3. Uncomment the code below and replace the URL
            // ============================================================
            /*
            fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            })
            .then(response => {
                if (response.ok) {
                    alert('Message sent successfully! I\'ll get back to you soon.');
                    contactForm.reset();
                } else {
                    alert('Something went wrong. Please try again.');
                }
            })
            .catch(error => {
                alert('Error sending message. Please try again.');
                console.error('Form error:', error);
            });
            */

            // ============================================================
            // TO CONNECT TO EMAILJS:
            // 1. Sign up at https://www.emailjs.com/
            // 2. Create a service, template, and get your public key
            // 3. Uncomment the code below and add your credentials
            // ============================================================
            /*
            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message
            }, 'YOUR_PUBLIC_KEY')
            .then(() => {
                alert('Message sent successfully!');
                contactForm.reset();
            })
            .catch((error) => {
                alert('Error sending message. Please try again.');
                console.error('EmailJS error:', error);
            });
            */

            // For now, just show a success message (demo mode)
            alert('Thank you, ' + name + '! Your message has been received. (Form service not configured yet.)');
            contactForm.reset();
        });
    }

    // ---------- Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ---------- Active nav link based on scroll (for single-page) ----------
    // (Kept minimal, works for multi-page via active class)
    console.log('✨ Brandon Sande Portfolio — Loaded successfully.');
});