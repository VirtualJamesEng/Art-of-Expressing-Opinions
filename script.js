// Main state management
const state = {
    currentSection: 'intro',
    progress: 0,
    quizAnswers: [],
    correctAnswers: ['B', 'C', 'A', 'D', 'B'], // Correct quiz answers
    themePreference: 'default'
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Theme Management
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.id.split('-')[0]; // 'default', 'trump', or 'harris'
            setTheme(theme);
            
            // Update active state of buttons
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Navigation
    const navLinks = document.querySelectorAll('.lesson-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('href').slice(1);
            changeSection(targetSection);
        });
    });

    // Flashcard Functionality
    const flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
            updateProgress();
        });
    });

    // Quiz Functionality
    initializeQuiz();
    
    // Initialize progress bar
    updateProgress();
});

// Theme Management
function setTheme(theme) {
    document.body.className = ''; // Reset themes
    document.body.classList.add(`theme-${theme}`);
    state.themePreference = theme;
    localStorage.setItem('themePreference', theme);
}

// Section Navigation
function changeSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    targetSection.classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.lesson-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Update state
    state.currentSection = sectionId;
    updateProgress();
    
    // Scroll to top of new section
    window.scrollTo({
        top: targetSection.offsetTop - 100,
        behavior: 'smooth'
    });
}

// Progress Tracking
function updateProgress() {
    // Calculate progress based on various factors
    let totalItems = 0;
    let completedItems = 0;
    
    // Count flashcards viewed
    const flashcards = document.querySelectorAll('.flashcard');
    totalItems += flashcards.length;
    flashcards.forEach(card => {
        if (card.classList.contains('flipped')) completedItems++;
    });
    
    // Count quiz answers
    const quizQuestions = document.querySelectorAll('.quiz-question');
    totalItems += quizQuestions.length;
    completedItems += state.quizAnswers.filter(answer => answer !== null).length;
    
    // Calculate percentage
    const progress = Math.round((completedItems / totalItems) * 100);
    state.progress = progress;
    
    // Update UI
    document.querySelector('.progress').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${progress}%`;
}

// Quiz Management
function initializeQuiz() {
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            const questionDiv = e.target.closest('.quiz-question');
            const questionIndex = Array.from(questionDiv.parentNode.children).indexOf(questionDiv);
            
            // Remove previous selection
            questionDiv.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add new selection
            option.classList.add('selected');
            
            // Store answer
            state.quizAnswers[questionIndex] = option.textContent.charAt(0);
            
            updateProgress();
            
            // Check if quiz is complete
            if (state.quizAnswers.filter(answer => answer !== null).length === state.correctAnswers.length) {
                showQuizResults();
            }
        });
    });
}

function showQuizResults() {
    const popup = document.getElementById('quiz-results');
    const resultsContent = document.getElementById('results-content');
    
    // Calculate score
    const score = state.quizAnswers.reduce((total, answer, index) => {
        return total + (answer === state.correctAnswers[index] ? 1 : 0);
    }, 0);
    
    const percentage = Math.round((score / state.correctAnswers.length) * 100);
    
    // Create results HTML
    resultsContent.innerHTML = `
        <h4>Your Score: ${score}/${state.correctAnswers.length} (${percentage}%)</h4>
        <div class="results-breakdown">
            ${state.quizAnswers.map((answer, index) => `
                <p>Question ${index + 1}: ${answer === state.correctAnswers[index] ? '✅' : '❌'}</p>
            `).join('')}
        </div>
    `;
    
    popup.style.display = 'block';
}

// Popup Management
function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

// Add event listeners for close buttons
document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const popup = e.target.closest('.popup');
        closePopup(popup.id);
    });
});

// Retry quiz
document.querySelector('.retry-btn').addEventListener('click', () => {
    state.quizAnswers = [];
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    closePopup('quiz-results');
    updateProgress();
});

// Definition popup functionality
document.querySelectorAll('.word-definition').forEach(word => {
    word.addEventListener('click', (e) => {
        const definition = e.target.dataset.definition;
        const popup = document.getElementById('definition-popup');
        document.getElementById('definition-text').textContent = definition;
        popup.style.display = 'block';
    });
});

// Handle escape key for popups
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.popup').forEach(popup => {
            popup.style.display = 'none';
        });
    }
});

// Load saved preferences
const savedTheme = localStorage.getItem('themePreference');
if (savedTheme) {
    setTheme(savedTheme);
}