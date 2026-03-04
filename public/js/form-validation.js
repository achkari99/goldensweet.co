/**
 * FORM-VALIDATION.JS - Real-time form validation
 */

class FormValidator {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        if (this.form) {
            this.init();
        }
    }

    init() {
        // Add validation on blur and input
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    this.validateField(field);
                }
            });
        });

        // Form submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        let isValid = true;
        let message = '';

        // Clear previous errors
        this.clearError(field);

        // Required check
        if (required && !value) {
            isValid = false;
            message = 'This field is required';
        }

        // Email validation
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email';
            }
        }

        // Phone validation
        else if (type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value) || value.length < 8) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }

        // Min length
        if (field.hasAttribute('minlength') && value) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                isValid = false;
                message = `Minimum ${minLength} characters required`;
            }
        }

        // Show error or success
        if (!isValid) {
            this.showError(field, message);
        } else if (value) {
            this.showSuccess(field);
        }

        return isValid;
    }

    showError(field, message) {
        field.classList.add('error');
        field.classList.remove('success');

        let errorDiv = field.parentElement.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            field.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    showSuccess(field) {
        field.classList.remove('error');
        field.classList.add('success');
        this.clearError(field);
    }

    clearError(field) {
        field.classList.remove('error', 'success');
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    validateAll() {
        let isValid = true;
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateAll()) {
            return;
        }

        // Show loading
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Sending...';

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        try {
            // Send to API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccessMessage();
                this.form.reset();
                this.form.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (err) {
            alert('Error sending message. Please try again.');
            console.error(err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message bounce-in';
        successDiv.innerHTML = `
            <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="28" fill="#28a745" />
                <path d="M20 30 L26 36 L40 22" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" class="checkmark-circle" />
            </svg>
            <h3>Message Sent!</h3>
            <p>We'll get back to you soon.</p>
        `;

        this.form.parentElement.insertBefore(successDiv, this.form);
        this.form.style.display = 'none';

        setTimeout(() => {
            successDiv.remove();
            this.form.style.display = '';
        }, 5000);
    }
}

// Auto-initialize contact forms
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        new FormValidator('#contact-form');
    }

    // Add validation styles to CSS
    const style = document.createElement('style');
    style.textContent = `
        input.error, textarea.error, select.error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
        }
        input.success, textarea.success, select.success {
            border-color: #28a745 !important;
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1) !important;
        }
        .field-error {
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 0.25rem;
            display: none;
        }
        .success-message {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        .success-message svg {
            margin: 0 auto 1rem;
        }
        .success-message h3 {
            color: #28a745;
            margin-bottom: 0.5rem;
        }
    `;
    document.head.appendChild(style);
});
