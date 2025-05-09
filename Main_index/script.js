// Word list for typing test
const words = 'in one good real one not school set they state high life consider on and not come what also for set point can want as while with of order child about school thing never hold find order each too between program work end you home place around while place problem end begin interest while public or where see time those increase interest be give end think seem small as both another a child same eye you between way do who into again good fact than under very head become real possible some write know however late each that with because that place nation only for each change form consider we would interest with world so order or run more open that large write turn never over open each over change still old take hold need give by consider line only leave while what set up number part form want against great problem can because head so first this here would course become help year first end want both fact public long word down also long for without new turn against the because write seem line interest call not if line thing what work people way may old consider leave hold want life between most place may if go who need fact such program where which end off child down change to from people high during people find to however into small new general it do that could old for last get another hand much eye great no work and with but good there last think can around use like number never since world need what we around part show new come seem while some and since still small these you general which seem will place come order form how about just also they with state late use both early too lead general seem there point take general seem few out like might under if ask while such interest feel word right again how about system such between late want fact up problem stand new say move a lead small however large public out by eye here over so be way use like say people work for since interest so face order school good not most run problem group run she late other problem real form what just high no man do under would to each too end point give number child through so this large see get form also all those course to work during about he plan still so like down he look down where course at who plan way so since come against he all who at world because while so few last these mean take house who old way large no first too now off would in this course present order home public school back own little about he develop of do over help day house stand present another by few come that down last or use say take would each even govern play around back under some line think she even when from do real problem between long as there school do as mean to all on other good may from might call world thing life turn of he look last problem after get show want need thing old other during be again develop come from consider the now number say life interest to system only group world same state school one problem between for turn run at very against eye must go both still all a as so after play eye little be those should out after which these both much house become both school this he real and may mean time by real number other as feel at end ask plan come turn by all head increase he present increase use stand after see order lead than system here ask in of look point little too without each for both but right we come world much own set we right off long those stand go both but under now must real general then before with much those at no of we only back these person plan from run new as own take early just increase only look open follow get that on system the mean plan man over it possible if most late line would first without real hand say turn point small set at in system however to be home show new again come under because about show face child know person large program how over could thing from out world while nation stand part run have look what many system order some one program you great could write day do he any also where child late face eye run still again on by as call high the must by late little mean never another seem to leave because for day against public long number word about after much need open change also'.split(' ');

// Configuration variables
let wordsCount = words.length;
let gameTime = 30 * 1000; // Default 30 seconds
let currentTheme = 'default';
window.timer = null;
window.gameStart = null;
let totalCorrectChars = 0;
let totalChars = 0;
let isGameOver = false;

// Utility functions
function addClass(el, name) {
  el.className += ' ' + name;
}

function removeClass(el, name) {
  el.className = el.className.replace(name, '');
}

function randomWord() {
  return words[Math.floor(Math.random() * wordsCount)];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

// Theme switching function
function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  currentTheme = theme;
  
  // Update active button
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-theme') === theme) {
      btn.classList.add('active');
    }
  });
  
  // Save theme preference
  localStorage.setItem('monkeytype-theme', theme);
}

// Set time function
function setTime(seconds) {
  gameTime = seconds * 1000;
  
  // Update active button
  document.querySelectorAll('.time-option').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.getAttribute('data-time')) === seconds) {
      btn.classList.add('active');
    }
  });
  
  // Update time display
  document.getElementById('info').textContent = seconds;
  
  // Save time preference
  localStorage.setItem('monkeytype-time', seconds);
}

// Update stats in real-time
function updateStats() {
  const wpm = getWpm();
  const accuracy = getAccuracy();
  
  document.getElementById('wpm').textContent = Math.round(wpm);
  document.getElementById('accuracy').textContent = accuracy + '%';
}

// Start a new game
function newGame() {
  // Reset game state
  clearInterval(window.timer);
  document.getElementById('game').classList.remove('over');
  document.getElementById('words').innerHTML = '';
  document.getElementById('result-container').classList.add('hidden');
  isGameOver = false;
  totalCorrectChars = 0;
  totalChars = 0;
  
  // Generate new words
  for (let i = 0; i < 200; i++) {
    document.getElementById('words').innerHTML += formatWord(randomWord());
  }
  
  // Reset cursor and focus
  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'), 'current');
  
  // Reset stats
  document.getElementById('info').textContent = (gameTime / 1000);
  document.getElementById('wpm').textContent = '0';
  document.getElementById('accuracy').textContent = '0%';
  
  // Reset timer
  window.timer = null;
  window.gameStart = null;
  
  // Reset words container position
  document.getElementById('words').style.marginTop = '0px';
  
  // Focus on game area
  document.getElementById('game').focus();
}

// Calculate WPM
function getWpm() {
  if (!window.gameStart) return 0;
  
  const elapsedTime = (Date.now() - window.gameStart) / 60000; // in minutes
  if (elapsedTime === 0) return 0;
  
  // Count correctly typed words
  const words = [...document.querySelectorAll('.word')];
  const lastTypedWord = document.querySelector('.word.current');
  const lastTypedWordIndex = words.indexOf(lastTypedWord);
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter(word => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
    const correctLetters = letters.filter(letter => letter.className.includes('correct'));
    return incorrectLetters.length === 0 && correctLetters.length === letters.length;
  });
  
  return correctWords.length / elapsedTime;
}

// Calculate accuracy
function getAccuracy() {
  if (totalChars === 0) return 0;
  return ((totalCorrectChars / totalChars) * 100).toFixed(1);
}

// Game over function
function gameOver() {
  if (isGameOver) return;
  isGameOver = true;
  
  clearInterval(window.timer);
  addClass(document.getElementById('game'), 'over');
  
  const wpm = getWpm();
  const accuracy = getAccuracy();
  
  // Update result screen
  document.getElementById('result-wpm').textContent = Math.round(wpm);
  document.getElementById('result-accuracy').textContent = accuracy + '%';
  document.getElementById('result-characters').textContent = `${totalCorrectChars}/${totalChars}`;
  
  // Show result screen
  document.getElementById('result-container').classList.remove('hidden');
  
  // Save test results to localStorage
  saveTestResult(wpm, accuracy);
}

// Import Firebase functions
import { getCurrentUser, saveTestResult as saveTestToFirebase, isUserLoggedIn } from './firebase-config.js';

// Save test result to user profile
async function saveTestResult(wpm, accuracy) {
  // Check if user is logged in
  if (isUserLoggedIn()) {
    const user = getCurrentUser();
    
    // Create test result data
    const testResult = {
      wpm: wpm,
      accuracy: parseFloat(getAccuracy()),
      timeSeconds: gameTime / 1000,
      correctChars: totalCorrectChars,
      totalChars: totalChars,
      date: new Date().toISOString()
    };
    
    // Save to Firebase
    await saveTestToFirebase(user.uid, testResult);
  } else {
    // Fallback to localStorage for users not logged in
    let userData = JSON.parse(localStorage.getItem('monkeytype-user-data')) || {
      username: 'Guest',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      stats: {
        avgWpm: 0,
        avgAccuracy: 0,
        testsTaken: 0,
        bestWpm: 0
      },
      testHistory: []
    };
    
    // Create new test result
    const testResult = {
      date: new Date().toISOString(),
      wpm: wpm,
      accuracy: parseFloat(getAccuracy()),
      timeSeconds: gameTime / 1000,
      correctChars: totalCorrectChars,
      totalChars: totalChars
    };
    
    // Add to history
    userData.testHistory.push(testResult);
    
    // Update stats
    userData.stats.testsTaken++;
    
    // Calculate new average WPM
    const totalWpm = userData.testHistory.reduce((sum, test) => sum + test.wpm, 0);
    userData.stats.avgWpm = totalWpm / userData.testHistory.length;
    
    // Calculate new average accuracy
    const totalAccuracy = userData.testHistory.reduce((sum, test) => sum + test.accuracy, 0);
    userData.stats.avgAccuracy = parseFloat((totalAccuracy / userData.testHistory.length).toFixed(1));
    
    // Save updated data
    localStorage.setItem('monkeytype-user-data', JSON.stringify(userData));
  }
  
  // Update best WPM if current is better
  if (wpm > userData.stats.bestWpm) {
    userData.stats.bestWpm = wpm;
  }
  
  // Save updated data
  localStorage.setItem('monkeytype-user-data', JSON.stringify(userData));
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load saved preferences
  const savedTheme = localStorage.getItem('monkeytype-theme') || 'default';
  const savedTime = localStorage.getItem('monkeytype-time') || 30;
  
  setTheme(savedTheme);
  setTime(parseInt(savedTime));
  
  // Theme switcher event listeners
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.getAttribute('data-theme'));
    });
  });
  
  // Time option event listeners
  document.querySelectorAll('.time-option').forEach(btn => {
    btn.addEventListener('click', () => {
      setTime(parseInt(btn.getAttribute('data-time')));
      newGame();
    });
  });
  
  // New game button
  document.getElementById('newGameBtn').addEventListener('click', () => {
    newGame();
  });
  
  // Typing event
  document.getElementById('game').addEventListener('keyup', ev => {
    const key = ev.key;
    const currentWord = document.querySelector('.word.current');
    const currentLetter = document.querySelector('.letter.current');
    const expected = currentLetter?.innerHTML || ' ';
    const isLetter = key.length === 1 && key !== ' ';
    const isSpace = key === ' ';
    const isBackspace = key === 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;

    if (document.querySelector('#game.over')) return;

    // Start timer on first keystroke
    if (!window.timer && (isLetter || isSpace)) {
      window.gameStart = Date.now();
      window.timer = setInterval(() => {
        const sPassed = Math.round((Date.now() - window.gameStart) / 1000);
        const sLeft = Math.round((gameTime / 1000) - sPassed);
        
        // Update time display
        document.getElementById('info').textContent = sLeft;
        
        // Update stats in real-time
        updateStats();
        
        if (sLeft <= 0) {
          gameOver();
          return;
        }
      }, 1000);
    }

    if (isLetter) {
      if (currentLetter) {
        // Track accuracy
        totalChars++;
        if (key === expected) {
          totalCorrectChars++;
        }
        
        addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
        removeClass(currentLetter, 'current');
        if (currentLetter.nextSibling) {
          addClass(currentLetter.nextSibling, 'current');
        }
      } else {
        const incorrectLetter = document.createElement('span');
        incorrectLetter.innerHTML = key;
        incorrectLetter.className = 'letter incorrect extra';
        currentWord.appendChild(incorrectLetter);
        totalChars++;
      }
    }

    if (isSpace) {
      if (expected !== ' ') {
        const uncheckedLetters = [...document.querySelectorAll('.word.current .letter:not(.correct):not(.incorrect)')];
        uncheckedLetters.forEach(letter => {
          addClass(letter, 'incorrect');
          totalChars++;
        });
      }
      removeClass(currentWord, 'current');
      const nextWord = currentWord.nextSibling;
      if (nextWord) {
        addClass(nextWord, 'current');
        if (currentLetter) removeClass(currentLetter, 'current');
        if (nextWord.firstChild) addClass(nextWord.firstChild, 'current');
      }
    }

    if (isBackspace) {
      if (currentLetter && isFirstLetter) {
        // Move to previous word
        removeClass(currentWord, 'current');
        if (currentWord.previousSibling) {
          addClass(currentWord.previousSibling, 'current');
          removeClass(currentLetter, 'current');
          const lastLetter = currentWord.previousSibling.lastChild;
          if (lastLetter) {
            addClass(lastLetter, 'current');
            removeClass(lastLetter, 'incorrect');
            removeClass(lastLetter, 'correct');
          }
        }
      } else if (currentLetter && !isFirstLetter) {
        // Move to previous letter
        removeClass(currentLetter, 'current');
        if (currentLetter.previousSibling) {
          addClass(currentLetter.previousSibling, 'current');
          removeClass(currentLetter.previousSibling, 'incorrect');
          removeClass(currentLetter.previousSibling, 'correct');
        }
      } else if (!currentLetter) {
        // Move to last letter of current word
        const last = currentWord.lastChild;
        if (last) {
          addClass(last, 'current');
          removeClass(last, 'incorrect');
          removeClass(last, 'correct');
        }
      }
    }

    // Scroll words up if needed
    if (currentWord?.getBoundingClientRect().top > 250) {
      const words = document.getElementById('words');
      const margin = parseInt(words.style.marginTop || '0px');
      words.style.marginTop = (margin - 35) + 'px';
    }

    // Update cursor position
    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    if (nextLetter || nextWord) {
      cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
      cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';
    }
    
    // Update stats in real-time
    updateStats();
  });
  
  // Start the game
  newGame();
});
