// Calculator JavaScript Logic

// Global variables
let currentInput = '';
let isScientificMode = false;
let calculationHistory = [];

// Display functions
function addToDisplay(value) {
    const display = document.getElementById('display');
    
    if (value === 'Math.PI') {
        currentInput += Math.PI;
        display.value += 'π';
    } else if (value === 'Math.E') {
        currentInput += Math.E;
        display.value += 'e';
    } else {
        currentInput += value;
        display.value += value;
    }
}

function clearDisplay() {
    currentInput = '';
    document.getElementById('display').value = '';
}

function clearEntry() {
    currentInput = currentInput.slice(0, -1);
    document.getElementById('display').value = document.getElementById('display').value.slice(0, -1);
}

// Calculation functions
async function calculate() {
    if (!currentInput) return;

    const display = document.getElementById('display');
    const originalExpression = display.value;

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expression: currentInput
            })
        });

        const data = await response.json();

        if (data.error) {
            showError(data.error);
        } else {
            display.value = data.result;
            addToHistory(originalExpression + ' = ' + data.result);
            currentInput = data.result.toString();
        }
    } catch (error) {
        showError('Network Error');
        console.error('Calculation error:', error);
    }
}

async function scientificOperation(operation) {
    if (!currentInput) return;

    const display = document.getElementById('display');
    const value = parseFloat(currentInput);

    try {
        const response = await fetch('/scientific', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operation: operation,
                value: value
            })
        });

        const data = await response.json();

        if (data.error) {
            showError(data.error);
        } else {
            const originalExpression = `${operation}(${value})`;
            display.value = data.result;
            addToHistory(originalExpression + ' = ' + data.result);
            currentInput = data.result.toString();
        }
    } catch (error) {
        showError('Network Error');
        console.error('Scientific operation error:', error);
    }
}

// UI functions
function toggleMode() {
    isScientificMode = !isScientificMode;
    const scientificMode = document.getElementById('scientific-mode');
    
    if (isScientificMode) {
        scientificMode.style.display = 'block';
    } else {
        scientificMode.style.display = 'none';
    }
}

function showError(message) {
    const display = document.getElementById('display');
    display.value = message;
    display.classList.add('error');
    
    setTimeout(() => {
        display.classList.remove('error');
        clearDisplay();
    }, 2000);
}

// History functions
function addToHistory(calculation) {
    calculationHistory.unshift(calculation);
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    calculationHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = item;
        historyItem.onclick = () => {
            // Allow clicking history items to use them
            const parts = item.split(' = ');
            if (parts.length === 2) {
                clearDisplay();
                addToDisplay(parts[1]);
            }
        };
        historyList.appendChild(historyItem);
    });
}

// Keyboard event handler
function handleKeyboardInput(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9' || key === '.') {
        addToDisplay(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        addToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        clearEntry();
    } else if (key === 's' || key === 'S') {
        toggleMode();
    }
}

// Utility functions
function formatNumber(num) {
    // Format large numbers with commas
    if (Math.abs(num) >= 1000) {
        return num.toLocaleString();
    }
    return num.toString();
}

function validateInput(input) {
    // Basic input validation
    const allowedChars = /^[0-9+\-*/.() ]*$/;
    return allowedChars.test(input);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the calculator
    updateHistoryDisplay();
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Add focus to display on load
    const display = document.getElementById('display');
    if (display) {
        display.focus();
    }
    
    console.log('Calculator initialized successfully');
});

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showError('Unexpected error occurred');
});

// Service worker registration (for PWA functionality - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToDisplay,
        clearDisplay,
        clearEntry,
        calculate,
        scientificOperation,
        toggleMode,
        addToHistory,
        validateInput,
        formatNumber
    };
} 
