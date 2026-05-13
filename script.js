// DOM Elements
const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.querySelectorAll('.calc-btn');

// State
let currentExpression = '';
let currentResult = '0';
let waitingForOperand = false;

// Update Display
function updateDisplay() {
    if (currentExpression === '') {
        expressionEl.textContent = '0';
    } else {
        expressionEl.textContent = currentExpression;
    }
    resultEl.textContent = currentResult;
}

// Evaluate Expression Safely
function evaluateAndUpdate() {
    if (currentExpression === '' || currentExpression === 'Error') {
        currentResult = '0';
        updateDisplay();
        return;
    }
    
    try {
        let formattedExpr = currentExpression.replace(/×/g, '*').replace(/÷/g, '/');
        
        // Handle percentage
        if (formattedExpr.includes('%')) {
            formattedExpr = formattedExpr.replace(/(\d+(?:\.\d+)?)%/g, (match, num) => {
                return `(${num}/100)`;
            });
        }
        
        // Use Function constructor - safe evaluation
        const result = Function('"use strict";return (' + formattedExpr + ')')();
        
        if (isNaN(result) || !isFinite(result)) {
            currentResult = 'Error';
        } else {
            // Round to avoid floating point issues
            currentResult = Math.round(result * 10000000000) / 10000000000;
        }
    } catch (error) {
        currentResult = 'Error';
    }
    
    updateDisplay();
}

// Check if last character is operator
function lastCharIsOperator() {
    if (currentExpression.length === 0) return false;
    const lastChar = currentExpression[currentExpression.length - 1];
    return ['+', '-', '×', '÷', '*', '/'].includes(lastChar);
}

// Handle Number Input
function handleNumber(value) {
    if (currentResult === 'Error') {
        handleClear();
    }
    
    if (waitingForOperand) {
        // After operator, start new number
        currentExpression += value;
        waitingForOperand = false;
    } else {
        if (currentExpression === '0' && value !== '.') {
            currentExpression = value;
        } else {
            currentExpression += value;
        }
    }
    
    // Evaluate and show result
    evaluateAndUpdate();
}

// Handle Operator
function handleOperator(operator) {
    if (currentResult === 'Error') {
        handleClear();
        return;
    }
    
    const displayOperator = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
    
    // If expression is empty, check if we have a result
    if (currentExpression === '') {
        if (currentResult !== '0') {
            currentExpression = currentResult + displayOperator;
        } else {
            currentExpression = '0' + displayOperator;
        }
        waitingForOperand = true;
        updateDisplay();
        return;
    }
    
    // If last character is operator, replace it
    if (lastCharIsOperator()) {
        currentExpression = currentExpression.slice(0, -1) + displayOperator;
    } 
    // Normal case - add operator
    else {
        currentExpression += displayOperator;
        waitingForOperand = true;
    }
    
    updateDisplay();
    // Don't evaluate after operator - wait for next number
}

// Handle Decimal Point
function handleDecimal() {
    if (currentResult === 'Error') {
        handleClear();
    }
    
    if (waitingForOperand) {
        currentExpression += '0.';
        waitingForOperand = false;
        evaluateAndUpdate();
        return;
    }
    
    if (currentExpression === '') {
        currentExpression = '0.';
        evaluateAndUpdate();
        return;
    }
    
    // Check if current number already has decimal
    const parts = currentExpression.split(/[+\-×÷*/]/);
    const lastNumber = parts[parts.length - 1];
    
    if (!lastNumber.includes('.')) {
        currentExpression += '.';
        evaluateAndUpdate();
    }
}

// Handle Clear (AC)
function handleClear() {
    currentExpression = '';
    currentResult = '0';
    waitingForOperand = false;
    updateDisplay();
}

// Handle Delete (Backspace)
function handleDelete() {
    if (currentResult === 'Error') {
        handleClear();
        return;
    }
    
    if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
    }
    
    if (currentExpression === '') {
        currentResult = '0';
    } else if (lastCharIsOperator()) {
        // If last char is operator, just update display without evaluating
        updateDisplay();
        return;
    } else {
        evaluateAndUpdate();
    }
    
    updateDisplay();
}

// Handle Equals
function handleEquals() {
    if (currentResult === 'Error') {
        handleClear();
        return;
    }
    
    // If last character is operator, remove it
    if (lastCharIsOperator()) {
        currentExpression = currentExpression.slice(0, -1);
    }
    
    // If expression is empty, use current result
    if (currentExpression === '') {
        currentExpression = currentResult.toString();
    }
    
    // Evaluate
    evaluateAndUpdate();
    
    // Set expression to result for continued calculation
    if (currentResult !== 'Error') {
        currentExpression = currentResult.toString();
        waitingForOperand = true;
    }
}

// Handle Percentage
function handlePercentage() {
    if (currentResult === 'Error') {
        handleClear();
        return;
    }
    
    if (currentExpression !== '' && !lastCharIsOperator() && !waitingForOperand) {
        evaluateAndUpdate();
        const percentValue = parseFloat(currentResult) / 100;
        currentResult = percentValue;
        currentExpression = currentResult.toString();
        waitingForOperand = true;
        updateDisplay();
    } else if (currentResult !== '0') {
        const percentValue = parseFloat(currentResult) / 100;
        currentResult = percentValue;
        currentExpression = currentResult.toString();
        waitingForOperand = true;
        updateDisplay();
    }
}

// Button Click Handler
function handleButtonClick(value) {
    if (value === 'clear') {
        handleClear();
    } else if (value === 'delete') {
        handleDelete();
    } else if (value === '=') {
        handleEquals();
    } else if (value === '%') {
        handlePercentage();
    } else if (value === '+' || value === '-' || value === '*' || value === '/') {
        handleOperator(value);
    } else if (value === '.') {
        handleDecimal();
    } else if (/^[0-9]$/.test(value)) {
        handleNumber(value);
    }
}

// Add Event Listeners to Buttons
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const value = button.getAttribute('data-value');
        handleButtonClick(value);
    });
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    // Prevent default for calculator keys
    if (/^[0-9]$/.test(key) || key === '.' || key === '+' || key === '-' || 
        key === '*' || key === '/' || key === '%' || key === 'Enter' || 
        key === '=' || key === 'Escape' || key === 'Backspace') {
        e.preventDefault();
    }
    
    if (/^[0-9]$/.test(key)) {
        handleNumber(key);
    }
    else if (key === '.') {
        handleDecimal();
    }
    else if (key === '+') {
        handleOperator('+');
    }
    else if (key === '-') {
        handleOperator('-');
    }
    else if (key === '*') {
        handleOperator('*');
    }
    else if (key === '/') {
        handleOperator('/');
    }
    else if (key === '%') {
        handlePercentage();
    }
    else if (key === 'Enter' || key === '=') {
        handleEquals();
    }
    else if (key === 'Escape') {
        handleClear();
    }
    else if (key === 'Backspace') {
        handleDelete();
    }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) navMenu.classList.toggle('active');
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) navMenu.classList.remove('active');
    });
});

// Active Nav on Scroll
function updateActiveNav() {
    const sections = ['home', 'about', 'features', 'codealpha'];
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = sectionId;
            }
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.classList.add('active');
        } else if (currentSection === '' && href === '#home') {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// Newsletter Subscription
const subscribeBtn = document.getElementById('subscribeBtn');
if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
        const email = document.getElementById('newsletterEmail');
        const messageDiv = document.getElementById('newsletterMessage');
        if (email && messageDiv) {
            const emailValue = email.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailValue) {
                messageDiv.innerHTML = '<span class="error">❌ Please enter email</span>';
                setTimeout(() => messageDiv.innerHTML = '', 3000);
                return;
            }
            
            if (!emailRegex.test(emailValue)) {
                messageDiv.innerHTML = '<span class="error">❌ Valid email required</span>';
                setTimeout(() => messageDiv.innerHTML = '', 3000);
                return;
            }
            
            messageDiv.innerHTML = '<span class="success">✅ Subscribed successfully! 🎉</span>';
            email.value = '';
            setTimeout(() => messageDiv.innerHTML = '', 3000);
        }
    });
}

// Theme Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('calculatorTheme') || 'dark';
    document.body.classList.add(`${savedTheme}-theme`);
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        if (savedTheme === 'light') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        const themeIcon = document.querySelector('#themeToggle i');
        if (isDark) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('calculatorTheme', 'light');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('calculatorTheme', 'dark');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    });
}
// Add this to enable scroll reveal animations
document.addEventListener('DOMContentLoaded', function() {
    // Scroll Reveal Observer
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => observer.observe(el));
    
    // Add flash effect to result when calculated
    const resultEl = document.getElementById('result');
    if (resultEl) {
        const observerResult = new MutationObserver(function() {
            resultEl.classList.add('result-flash');
            setTimeout(() => resultEl.classList.remove('result-flash'), 300);
        });
        observerResult.observe(resultEl, { childList: true, characterData: true, subtree: true });
    }
});
// Initialize
initTheme();