(() => {
  const WINNING_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  // ==== Elements ====
  const boardEl = document.getElementById('board');
  const cells = Array.from(boardEl.querySelectorAll('.cell'));
  const statusEl = document.getElementById('status');
  const restartBtn = document.getElementById('restartBtn');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreTiesEl = document.getElementById('scoreTies');
  const playerXDisplay = document.getElementById('playerXDisplay');
  const playerODisplay = document.getElementById('playerODisplay');

  // Screens & popups
  const menuScreen = document.getElementById('menuScreen');
  const gameScreen = document.getElementById('gameScreen');
  const pauseScreen = document.getElementById('pauseScreen');
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popupMessage');
  const playerNamePopup = document.getElementById('playerNamePopup');
  const playerXNameInput = document.getElementById('playerXName');
  const playerONameInput = document.getElementById('playerOName');

  // Buttons
  const startGameBtn = document.getElementById('startGameBtn');
  const startWithNamesBtn = document.getElementById('startWithNamesBtn');
  const cancelNameBtn = document.getElementById('cancelNameBtn');
  const resetScoreBtnMenu = document.getElementById('resetScoreBtnMenu');
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtnPause = document.getElementById('restartBtnPause');
  const backMenuPause = document.getElementById('backMenuPause');
  const backToMenuBtn = document.getElementById('backToMenuBtn');
  const popupRestartBtn = document.getElementById('popupRestartBtn');
  const popupMenuBtn = document.getElementById('popupMenuBtn');

  // ==== Game state ====
  let board = Array(9).fill(null);
  let currentPlayer = 'X';
  let isGameActive = false;
  const scores = { X:0, O:0, T:0 };
  let playerNames = { X:'Player X', O:'Player O' };

  // ==== SOUND SYSTEM ====
  let sounds = {};
  let audioUnlocked = false;

  function initSounds() {
    sounds = {
      click: new Audio("sounds/click.mp3"),
      win: new Audio("sounds/win.mp3"),
      tie: new Audio("sounds/tie.mp3")
    };
    for (let key in sounds) {
      sounds[key].load();
      sounds[key].volume = 0.5; // adjust volume
    }
    audioUnlocked = true;
  }

  function playSound(name) {
    if (!audioUnlocked || !sounds[name]) return;
    try {
      sounds[name].currentTime = 0;
      sounds[name].play();
    } catch (err) {
      console.warn("Sound play error:", err);
    }
  }

  // Unlock sounds on first click anywhere
  window.addEventListener("click", () => {
    if (!audioUnlocked) initSounds();
  }, { once: true });

  // ==== Game logic ====
  function renderBoard(){
    cells.forEach((c,i) => {
      c.textContent = board[i] || '';
      c.className = 'cell'+(board[i]?' '+board[i].toLowerCase():'');
    });
  }

  function updateStatus(text,color){
    statusEl.textContent = text;
    statusEl.style.color = color || 'var(--accent)';
  }

  function checkWinner(){
    for(let combo of WINNING_COMBOS){
      const [a,b,c] = combo;
      if(board[a] && board[a]===board[b] && board[a]===board[c])
        return { winner:board[a], combo };
    }
    if(board.every(Boolean)) return { winner:'TIE' };
    return null;
  }

  function makeMove(i){
    if(!isGameActive || board[i]) return;
    board[i] = currentPlayer;
    renderBoard();
    playSound("click");
    const result = checkWinner();
    if(result) return endRound(result);
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`${playerNames[currentPlayer]}'s turn`);
  }

  function endRound(result){
    isGameActive = false;
    if(result.winner === 'TIE'){
      scores.T++;
      scoreTiesEl.textContent = scores.T;
      showPopup("It's a Tie!", 'var(--danger)');
      playSound("tie");
    } else {
      scores[result.winner]++;
      scoreXEl.textContent = scores.X;
      scoreOEl.textContent = scores.O;
      result.combo.forEach(i => cells[i].classList.add('win'));
      showPopup(`${playerNames[result.winner]} Wins!`, 'var(--win)');
      playSound("win");
    }
  }

  function resetRound(){
    board.fill(null);
    currentPlayer = 'X';
    isGameActive = true;
    renderBoard();
    updateStatus(`${playerNames[currentPlayer]}'s turn`);
  }

  // ==== Screens ====
  function showMenu(){
    menuScreen.classList.add('active');
    gameScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    popup.classList.add('hidden');
    playerNamePopup.classList.add('hidden');
    isGameActive = false;
  }

  function showPlayerNamePopup(){
    menuScreen.classList.add('hidden');
    playerNamePopup.classList.remove('hidden');
    playerXNameInput.value = '';
    playerONameInput.value = '';
  }

  function startGameWithNames(){
    const xName = playerXNameInput.value.trim() || 'Player X';
    const oName = playerONameInput.value.trim() || 'Player O';
    playerNames.X = xName;
    playerNames.O = oName;
    playerXDisplay.textContent = xName;
    playerODisplay.textContent = oName;
    playerNamePopup.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resetRound();
  }

  function showGame(){
    menuScreen.classList.remove('active');
    gameScreen.classList.remove('hidden');
    pauseScreen.classList.add('hidden');
    popup.classList.add('hidden');
    resetRound();
  }

  function showPause(){
    pauseScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    isGameActive = false;
  }

  function showPopup(msg,color){
    popupMessage.textContent = msg;
    popupMessage.style.color = color || 'var(--accent)';
    popup.classList.remove('hidden');
  }

  // ==== Event Listeners ====
  cells.forEach((cell,i)=>cell.addEventListener('click',()=>makeMove(i)));

  restartBtn.addEventListener('click', () => { playSound("click"); resetRound(); });
  pauseBtn.addEventListener('click', () => { playSound("click"); showPause(); });
  startGameBtn.addEventListener('click', () => { playSound("click"); showPlayerNamePopup(); });
  startWithNamesBtn.addEventListener('click', () => { playSound("click"); startGameWithNames(); });
  cancelNameBtn.addEventListener('click', () => { playSound("click"); showMenu(); });

  resumeBtn.addEventListener('click', () => {
    playSound("click");
    pauseScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    isGameActive = true;
    updateStatus(`${playerNames[currentPlayer]}'s turn`);
  });

  restartBtnPause.addEventListener('click', () => { playSound("click"); showGame(); });
  backMenuPause.addEventListener('click', () => { playSound("click"); showMenu(); });
  backToMenuBtn.addEventListener('click', () => { playSound("click"); showMenu(); });
  popupRestartBtn.addEventListener('click', () => { playSound("click"); popup.classList.add('hidden'); resetRound(); });
  popupMenuBtn.addEventListener('click', () => { playSound("click"); showMenu(); });

  resetScoreBtnMenu.addEventListener('click', () => {
    playSound("click");
    scores.X = scores.O = scores.T = 0;
    scoreXEl.textContent = scoreOEl.textContent = scoreTiesEl.textContent = '0';
  });

  // ==== Init ====
  showMenu();
})();
