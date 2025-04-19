let adsManager;
let adsLoader;
let adDisplayContainer;
let videoElement;
let isAdPlaying = false;

function initializeIMA() {
  videoElement = document.getElementById('videoElement');
  adDisplayContainer = new google.ima.AdDisplayContainer(
    document.getElementById('adContainer'),
    videoElement
  );
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  
  adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false
  );
  
  adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false
  );
}

const videoIds = [
  'YOUR_VIDEO_ID_1', // Substitua pelos IDs dos seus vídeos
  'YOUR_VIDEO_ID_2',
  'YOUR_VIDEO_ID_3'
];

function requestAd() {
  let videoId;
  let isPaidAd = false;
  if (arguments.length > 0 && arguments[0]) {
    // Se uma URL específica foi fornecida
    isPaidAd = true;
    videoId = arguments[0];
  } else {
    // Caso contrário, use um vídeo aleatório
    videoId = videoIds[Math.floor(Math.random() * videoIds.length)];
  }

  const adContainer = document.getElementById('adContainer');
  adContainer.innerHTML = `
    <iframe 
      width="640" 
      height="360" 
      id="youtubePlayer"
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
    <button onclick="closeAd()" class="close-button" style="${isPaidAd ? 'background: #FFD700; color: black; display: none;' : ''}" id="closeButton">Fechar (<span id="timer">10</span>s)</button>
  `;

  if (isPaidAd) {
    let timeLeft = 10;
    const timerInterval = setInterval(() => {
      timeLeft--;
      const timerSpan = document.getElementById('timer');
      if (timerSpan) timerSpan.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        const closeButton = document.getElementById('closeButton');
        if (closeButton) closeButton.style.display = 'block';
      }
    }, 1000);
  }
  adContainer.style.display = 'block';
  isAdPlaying = true;
}

let userCoins = parseInt(localStorage.getItem('userCoins')) || 100;
document.getElementById('coinCount').textContent = userCoins;
let adStartTime = 0;
let dropValue = 0;
let dropClaimed = false;

function createDrop(value) {
  if (value <= 0) return;
  dropValue = value;
  dropClaimed = false;
  
  const sections = ['sobre', 'coins'];
  sections.forEach(sectionId => {
    const section = sectionId === 'sobre' ? 
      document.querySelector('.sobre') : 
      document.getElementById(sectionId);
    
    if (section) {
      const existingDrop = section.querySelector('.drop-button');
      if (existingDrop) {
        existingDrop.remove();
      }
      
      const dropButton = document.createElement('button');
      dropButton.innerHTML = 'RESGATAR DROP';
      dropButton.className = 'drop-button';
      dropButton.onclick = claimDrop;
      section.appendChild(dropButton);
    }
  });
}

function claimDrop() {
  if (dropClaimed) return;
  
  userCoins += dropValue;
  localStorage.setItem('userCoins', userCoins);
  document.getElementById('coinCount').textContent = userCoins;
  
  const dropButton = document.querySelector('.drop-button');
  dropButton.innerHTML = 'JÁ RESGATADO';
  dropButton.disabled = true;
  dropButton.style.opacity = '0.5';
  dropClaimed = true;
  
  alert(`Você resgatou ${dropValue} coins!`);
}
let isWatchingForCoins = false;
let isBanned = false;
let banEndTime = 0;

function closeAd() {
  const iframe = document.getElementById('youtubePlayer');
  if (iframe) {
    iframe.src = '';
  }
  
  if (isWatchingForCoins) {
    const currentTime = Date.now();
    const watchTime = currentTime - adStartTime;
    
    if (watchTime < 10000) { // Menos de 10 segundos
      banUser();
      return;
    }
    
    showRewardButton();
    return; // Não fecha o container para mostrar o botão de recompensa
  }
  
  const adContainer = document.getElementById('adContainer');
  adContainer.style.display = 'none';
  isAdPlaying = false;
  isWatchingForCoins = false;
}

function banUser() {
  isBanned = true;
  banEndTime = Date.now() + 10000; // 10 segundos
  localStorage.setItem('banEndTime', banEndTime);
  alert('Você foi banido por 10 segundos por fechar um anúncio precioso');
  window.location.href = window.location.href;
}

function showAdForCoins() {
  const storedBanEndTime = localStorage.getItem('banEndTime');
  if (storedBanEndTime && Date.now() < parseInt(storedBanEndTime)) {
    const remainingTime = Math.ceil((parseInt(storedBanEndTime) - Date.now()) / 1000);
    alert(`Você está banido por mais ${remainingTime} segundos`);
    return;
  }
  localStorage.removeItem('banEndTime');
  
  isWatchingForCoins = true;
  adStartTime = Date.now();
  requestAd();
}

function showRewardButton() {
  const adContainer = document.getElementById('adContainer');
  adContainer.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <h3>Parabéns!</h3>
      <button onclick="claimReward()" class="reward-button">Resgatar Prêmio</button>
    </div>
  `;
  adContainer.style.display = 'block';
}

function claimReward() {
  userCoins++;
  localStorage.setItem('userCoins', userCoins);
  document.getElementById('coinCount').textContent = userCoins;
  document.getElementById('adContainer').style.display = 'none';
  
  if (userCoins >= 10) {
    document.getElementById('placeAdSection').style.display = 'block';
  }
}

function submitAd() {
  const videoUrl = document.getElementById('adVideoUrl').value;
  const description = document.getElementById('adDescription').value;
  const adCost = 10;
  
  if (!description) {
    alert('Por favor, adicione uma descrição para o anúncio');
    return;
  }

  if (userCoins < adCost) {
    alert(`Você precisa de ${adCost} coins para publicar um anúncio!`);
    return;
  }
  
  userCoins -= adCost;
  localStorage.setItem('userCoins', userCoins);
  document.getElementById('coinCount').textContent = userCoins;

  // Criar novo anúncio no formato atual
  const newAd = {
    title: "Anúncio Patrocinado",
    description: description,
    videoUrl: videoUrl
  };
  
  // Atualizar ads.json com o novo anúncio
  fetch('ads.json')
    .then(response => response.json())
    .then(data => {
      data.ads.unshift(newAd); // Adiciona no início da lista
      return fetch('ads.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    })
    .then(() => {
      loadAds(); // Recarrega os anúncios
      alert('Anúncio enviado com sucesso! Já está sendo exibido.');
    })
    .catch(error => {
      console.error('Erro ao salvar anúncio:', error);
      alert('Erro ao salvar o anúncio. Tente novamente.');
    });
}

function authorizeDiscord() {
  const token = 'MTM0NDQyODM4MTU5NjQxODEyOA.GxaZqA.xjEbttHgZJtLolox7ojjJwg23Q5DZR_UzmoYHA';
  // Implementar lógica de autorização do Discord
  // Nota: Por segurança, o token deve ser armazenado de forma segura
  alert('Autorização concluída com sucesso!');
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  const adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsManager = adsManagerLoadedEvent.getAdsManager(videoElement, adsRenderingSettings);
  
  adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => {
    document.getElementById('adContainer').style.display = 'none';
    isAdPlaying = false;
  });
  
  try {
    adDisplayContainer.initialize();
    adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
    adsManager.start();
    document.getElementById('adContainer').style.display = 'block';
    isAdPlaying = true;
  } catch (adError) {
    console.error('AdsManager init error:', adError);
  }
}

function onAdError(adErrorEvent) {
  console.error('Ad error:', adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
  document.getElementById('adContainer').style.display = 'none';
  isAdPlaying = false;
}

function showRandomAd() {
  if (!isAdPlaying) {
    initializeIMA();
    requestAd();
  }
}

// Mostrar anúncios a cada 60 segundos
setInterval(showRandomAd, 60000);

async function loadAds() {
  const adSpaces = document.querySelectorAll('.ad-space');
  
  try {
    // Carregar anúncios pagos do ads.json
    const response = await fetch('ads.json');
    const data = await response.json();
    
    // Primeiro espaço - anúncio pago se existir
    if (adSpaces[0] && data.ads.length > 0) {
      const paidAd = data.ads[0];
      adSpaces[0].innerHTML = `
        <div class="ad-link">
          <h3>${paidAd.title}</h3>
          <p>${paidAd.description}</p>
          <button onclick="requestAd('${paidAd.videoUrl}')" class="ad-button">Assistir Anúncio</button>
        </div>
      `;
      adSpaces[0].style.display = 'block';
    }

    // Segundo espaço - anúncio aleatório do YouTube
    if (adSpaces[1]) {
      const randomVideoId = videoIds[Math.floor(Math.random() * videoIds.length)];
      adSpaces[1].innerHTML = `
        <div class="ad-link">
          <h3>Anúncio do YouTube</h3>
          <p>Conteúdo recomendado para você!</p>
          <button onclick="requestAd('${randomVideoId}')" class="ad-button">Assistir</button>
        </div>
      `;
      adSpaces[1].style.display = 'block';
    }
  } catch (error) {
    console.error('Erro ao carregar anúncios:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAds();
  showSection('sobre');
});

function toggleMenu() {
  document.getElementById("menuDropdown").classList.toggle("show");
}

function executeCommand() {
  const command = document.getElementById('adminCommand').value;
  if (command.startsWith('/drop ')) {
    const value = parseInt(command.split(' ')[1]);
    if (!isNaN(value)) {
      createDrop(value);
      alert(`Drop de ${value} coins criado!`);
    }
    document.getElementById('adminCommand').value = '';
    return;
  }
  const parts = command.split(' ');
  
  if (parts[0] === '$addcoins' && parts.length === 2) {
    const amount = parseInt(parts[1]);
    if (!isNaN(amount)) {
      userCoins += amount;
      localStorage.setItem('userCoins', userCoins);
      document.getElementById('coinCount').textContent = userCoins;
      alert(`Adicionado ${amount} coins com sucesso!`);
    }
  } else if (parts[0] === '$rmvads') {
    const seconds = parseInt(parts[1]) || 60; // Padrão 60 segundos se não especificado
    const adSpaces = document.querySelectorAll('.ad-space');
    adSpaces.forEach(adSpace => {
      adSpace.innerHTML = '<div class="ad-link"><h3>Anúncios bloqueados por ' + seconds + ' segundos</h3></div>';
      adSpace.style.display = 'none';
    });
    
    setTimeout(() => {
      loadAds();
      alert('Anúncios reativados!');
    }, seconds * 1000);
    
    alert('Anúncios removidos por ' + seconds + ' segundos!');
  } else if (parts[0] === '$ajuda') {
    alert('Comandos disponíveis:\n\n' +
          '$addcoins [número] - Adiciona coins (exemplo: $addcoins 10)\n' +
          '$rmvads - Remove todos os anúncios\n' +
          '$tstads - Mostra anúncios do Google Ads (beta)\n' +
          '/drop [valor] - Cria um drop de coins (exemplo: /drop 100)\n' +
          '$ajuda - Mostra esta lista de comandos');
  } else if (parts[0] === '$tstads') {
    const adSpaces = document.querySelectorAll('.ad-space');
    adSpaces.forEach(adSpace => {
      adSpace.innerHTML = `
        <div class="ad-link" style="background:#1a1a1a;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(76,175,80,0.5);">
          <h3 style="color:#4caf50;font-size:24px;margin-bottom:15px;">Anúncio Premium</h3>
          <p style="color:#fff;font-size:18px;margin-bottom:20px;">Anúncio personalizado para você!</p>
          <div style="width:100%;height:250px;background:linear-gradient(45deg,#2a2a5a,#1c1c3c);display:flex;align-items:center;justify-content:center;border-radius:8px;border:2px solid #4caf50">
            <span style="color:#fff;font-size:20px;font-weight:bold">Seu anúncio aqui</span>
          </div>
          <button class="ad-button" style="display:block;width:100%;margin-top:20px;opacity:1;transform:none">Ver Anúncio</button>
        </div>`;
      adSpace.style.display = 'block';
    });
    alert('Anúncios ativados! Agora você deve vê-los na tela.');
  } else {
    alert('Comando inválido!\nDigite $ajuda para ver todos os comandos disponíveis');
  }
  
  document.getElementById('adminCommand').value = '';
}

// Mostrar console admin ao pressionar Ctrl+Shift+A
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
      adminSection.style.display = adminSection.style.display === 'none' ? 'block' : 'none';
    }
  }
});

function showSection(section) {
  const sections = document.querySelectorAll('main > section, #jogo');
  const adSpaces = document.querySelectorAll('.ad-space');
  const adminSection = document.getElementById('adminSection');
  
  sections.forEach(s => {
    if ((section === 'sobre' && s.classList.contains('sobre')) || 
        (section === 'coins' && s.id === 'coins') ||
        (section === 'jogo' && s.id === 'jogo')) {
      s.style.display = 'block';
      if (section === 'coins') {
        if (adminSection) {
          adminSection.style.display = 'none';
        }
      }
    } else if (section === 'patrocinios') {
      s.style.display = 'none';
      adSpaces.forEach(ad => ad.style.display = 'block');
    } else {
      s.style.display = 'none';
    }
  });
  
  if (section === 'sobre' || section === 'coins') {
    adSpaces.forEach(ad => ad.style.display = 'none');
  }
  
  toggleMenu();
}

window.onclick = function(event) {
  if (!event.target.matches('.menu-dots button')) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let dropdown of dropdowns) {
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    }
  }
}
// Jogo da Velha
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentDifficulty = '';
let currentBet = 0;

function startGame(difficulty) {
  if (userCoins <= 0) {
    alert('Você precisa ter coins para jogar!');
    return;
  }
  currentDifficulty = difficulty;
  document.getElementById('bet-modal').style.display = 'block';
}

function placeBet() {
  const betAmount = parseInt(document.getElementById('betAmount').value);
  if (betAmount <= 0 || betAmount > userCoins) {
    alert('Valor inválido!');
    return;
  }
  
  currentBet = betAmount;
  userCoins -= betAmount;
  document.getElementById('coinCount').textContent = userCoins;
  document.getElementById('bet-modal').style.display = 'none';
  
  initializeBoard();
}

function initializeBoard() {
  gameBoard = ['', '', '', '', '', '', '', '', ''];
  const board = document.getElementById('game-board');
  board.innerHTML = '';
  
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.onclick = () => makeMove(i);
    board.appendChild(cell);
  }
  
  document.getElementById('game-status').textContent = '';
}

function makeMove(index) {
  if (gameBoard[index] !== '') return;
  
  gameBoard[index] = 'X';
  updateBoard();
  
  if (checkWinner()) {
    endGame('player');
    return;
  }
  
  if (gameBoard.includes('')) {
    setTimeout(() => makeAIMove(), 500);
  } else {
    endGame('draw');
  }
}

function makeAIMove() {
  let index;
  switch (currentDifficulty) {
    case 'easy':
      index = getRandomMove();
      break;
    case 'medium':
      index = Math.random() < 0.5 ? getBestMove() : getRandomMove();
      break;
    case 'hard':
      index = getBestMove();
      break;
  }
  
  gameBoard[index] = 'O';
  updateBoard();
  
  if (checkWinner()) {
    endGame('ai');
  } else if (!gameBoard.includes('')) {
    endGame('draw');
  }
}

function getRandomMove() {
  const empty = gameBoard.reduce((acc, val, idx) => 
    val === '' ? [...acc, idx] : acc, []);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove;
  
  for (let i = 0; i < 9; i++) {
    if (gameBoard[i] === '') {
      gameBoard[i] = 'O';
      let score = minimax(gameBoard, 0, false);
      gameBoard[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  
  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  if (checkWinner('O')) return 1;
  if (checkWinner('X')) return -1;
  if (!board.includes('')) return 0;
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
        board[i] = '';
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
        board[i] = '';
      }
    }
    return bestScore;
  }
}

function updateBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    cell.textContent = gameBoard[i];
  });
}

function checkWinner(player = null) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  
  return winPatterns.some(pattern => {
    const line = pattern.map(i => gameBoard[i]);
    return line.every(cell => cell === (player || line[0]) && cell !== '');
  });
}

function endGame(result) {
  let message = '';
  switch(result) {
    case 'player':
      message = `Você ganhou ${currentBet * 2} coins!`;
      userCoins += currentBet * 2;
      break;
    case 'ai':
      message = `Você perdeu ${currentBet} coins!`;
      break;
    case 'draw':
      message = 'Empate! Suas coins foram devolvidas.';
      userCoins += currentBet;
      break;
  }
  
  document.getElementById('game-status').textContent = message;
  document.getElementById('coinCount').textContent = userCoins;
  localStorage.setItem('userCoins', userCoins);
  }
                                  
