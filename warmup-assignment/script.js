function computerPlay() {
  const options = ['Rock', 'Paper', 'Scissors'];
  return options[Math.floor(Math.random() * options.length)];
}

function playRound(playerSelection, computerSelection) {
  if (playerSelection === computerSelection) return 'tie';

  const beats = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' };

  return beats[playerSelection] === computerSelection ? 'player' : 'computer';
}


const WINNING_SCORE = 5;

let playerScore = 0;
let computerScore = 0;
let gameOver = false;

// DOM references

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const resultEl = document.getElementById('result');
const choiceButtons = document.querySelectorAll('.choice');
const resetButton = document.getElementById('resetButton');

// Render helpers

function setResultMessage(message, variant) {
  resultEl.textContent = message;
  resultEl.classList.remove('result--win', 'result--lose', 'result--tie');
  if (variant) {
    resultEl.classList.add(`result--${variant}`);
  }
}

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function setButtonsDisabled(disabled) {
  choiceButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

// Round handling 

function handleChoiceClick(event) {
  if (gameOver) return;

  const playerSelection = event.currentTarget.dataset.choice;
  const computerSelection = computerPlay();
  const outcome = playRound(playerSelection, computerSelection);

  if (outcome === 'player') {
    playerScore++;
  } else if (outcome === 'computer') {
    computerScore++;
  }

  updateScoreboard();
  announceRound(playerSelection, computerSelection, outcome);
  checkForGameOver();
}

function announceRound(playerSelection, computerSelection, outcome) {
  const base = `You chose ${playerSelection}. The evil AI chose ${computerSelection}.`;

  if (outcome === 'tie') {
    setResultMessage(`${base} It's a tie — no points awarded.`, 'tie');
  } else if (outcome === 'player') {
    setResultMessage(`${base} You win this round!`, 'win');
  } else {
    setResultMessage(`${base} The evil AI wins this round.`, 'lose');
  }
}

function checkForGameOver() {
  if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
    gameOver = true;
    setButtonsDisabled(true);

    if (playerScore > computerScore) {
      setResultMessage(
        `🎉 Victory! You defeated the evil AI ${playerScore} to ${computerScore}. The fortress falls.`,
        'win'
      );
    } else {
      setResultMessage(
        `💀 Defeat. The evil AI won ${computerScore} to ${playerScore}. Restart the duel to try again.`,
        'lose'
      );
    }
  }
}

function resetGame() {
  playerScore = 0;
  computerScore = 0;
  gameOver = false;
  updateScoreboard();
  setButtonsDisabled(false);
  setResultMessage('Choose a move to begin the duel.', null);
}
 

choiceButtons.forEach((button) => {
  button.addEventListener('click', handleChoiceClick);
});

resetButton.addEventListener('click', resetGame);