// Basic math operations

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}


// special string 'DIVIDE_BY_ZERO' instead of crashing
// or returning Infinity when dividing by zero.
function operate(operator, a, b) {
  a = Number(a);
  b = Number(b);

  switch (operator) {
    case '+':
      return add(a, b);
    case '-':
      return subtract(a, b);
    case '*':
      return multiply(a, b);
    case '/':
      if (b === 0) return 'DIVIDE_BY_ZERO';
      return divide(a, b);
    default:
      return null;
  }
}

// Display

const MAX_DISPLAY_LENGTH = 12;


// Rounds long decimals so results don't overflow the screen,
// falling back to exponential notation for extreme values.
 
function formatResult(number) {
  if (!isFinite(number)) return 'Error';

  // Round to avoid floating-point artifacts 
  let rounded = Math.round((number + Number.EPSILON) * 1e8) / 1e8;
  let str = String(rounded);

  if (str.length > MAX_DISPLAY_LENGTH) {
    const decimalsAvailable = MAX_DISPLAY_LENGTH - String(Math.trunc(rounded)).length - 1;
    if (decimalsAvailable > 0) {
      str = rounded.toFixed(Math.max(decimalsAvailable, 0));
      str = str.replace(/\.?0+$/, '');
    }
    if (str.length > MAX_DISPLAY_LENGTH) {
      str = rounded.toExponential(5);
    }
  }

  return str;
}


let displayValue = '0';
let firstOperand = null;
let pendingOperator = null;
let waitingForSecondOperand = false;
let hasError = false;

// DOM references 

const screen = document.getElementById('screen');
const decimalButton = document.getElementById('decimalButton');
const keys = document.querySelectorAll('.key');

function updateScreen() {
  screen.textContent = displayValue;
  decimalButton.disabled = !hasError && displayValue.includes('.');
}

// Input handlers

function inputDigit(digit) {
  if (hasError) {
    resetState();
  }

  if (waitingForSecondOperand) {
    displayValue = digit;
    waitingForSecondOperand = false;
  } else {
    displayValue = displayValue === '0' ? digit : displayValue + digit;
  }
}

function inputDecimal() {
  if (hasError) {
    resetState();
  }

  if (waitingForSecondOperand) {
    displayValue = '0.';
    waitingForSecondOperand = false;
    return;
  }

  if (!displayValue.includes('.')) {
    displayValue += '.';
  }
}

function inputBackspace() {
  if (hasError) {
    resetState();
    return;
  }

  if (waitingForSecondOperand) {
    return;
  }

  if (displayValue.length <= 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
    displayValue = '0';
  } else {
    displayValue = displayValue.slice(0, -1);
  }
}

function handleOperator(nextOperator) {
  if (hasError) return; 

  const inputValue = parseFloat(displayValue);

  if (pendingOperator && waitingForSecondOperand) {
    pendingOperator = nextOperator;
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (pendingOperator) {
    const result = operate(pendingOperator, firstOperand, inputValue);

    if (result === 'DIVIDE_BY_ZERO') {
      showDivideByZeroError();
      return;
    }

    displayValue = formatResult(result);
    firstOperand = parseFloat(displayValue);
  }

  waitingForSecondOperand = true;
  pendingOperator = nextOperator;
}

function handleEquals() {
  if (hasError) return;

  if (pendingOperator === null || waitingForSecondOperand) {
    return;
  }

  const inputValue = parseFloat(displayValue);
  const result = operate(pendingOperator, firstOperand, inputValue);

  if (result === 'DIVIDE_BY_ZERO') {
    showDivideByZeroError();
    return;
  }

  displayValue = formatResult(result);
  firstOperand = null;
  pendingOperator = null;
  waitingForSecondOperand = true; 
}

function showDivideByZeroError() {
  displayValue = "Nice try. Can't divide by zero.";
  hasError = true;
  firstOperand = null;
  pendingOperator = null;
  waitingForSecondOperand = false;
}

function resetState() {
  displayValue = '0';
  firstOperand = null;
  pendingOperator = null;
  waitingForSecondOperand = false;
  hasError = false;
}

// button clicks 

keys.forEach((key) => {
  key.addEventListener('click', () => {
    const action = key.dataset.action;

    if (action === 'digit') {
      inputDigit(key.dataset.digit);
    } else if (action === 'decimal') {
      inputDecimal();
    } else if (action === 'operator') {
      handleOperator(key.dataset.operator);
    } else if (action === 'equals') {
      handleEquals();
    } else if (action === 'clear') {
      resetState();
    } else if (action === 'backspace') {
      inputBackspace();
    }

    updateScreen();
  });
});

// Keyboard support

const KEY_TO_OPERATOR = { '+': '+', '-': '-', '*': '*', '/': '/' };

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === '.') {
    inputDecimal();
  } else if (KEY_TO_OPERATOR[key]) {
    handleOperator(KEY_TO_OPERATOR[key]);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    handleEquals();
  } else if (key === 'Backspace') {
    inputBackspace();
  } else if (key === 'Escape') {
    resetState();
  } else {
    return; 
  }

  updateScreen();
});


updateScreen();