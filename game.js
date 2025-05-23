// game.js — клиентская логика игры

const socket = io();
let roomId = null;
let playerId = null;
let mySnake = null;

const menu = document.getElementById('menu');
const gameDiv = document.getElementById('game');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

document.getElementById('createRoom').onclick = () => {
  roomId = Math.random().toString(36).substr(2, 6); // случайный код
  showInviteLink(roomId);
  joinRoom(roomId);
};

document.getElementById('joinRoom').onclick = () => {
  const input = document.getElementById('joinRoomId').value.trim();
  if (input) {
    joinRoom(input);
  }
};

function showInviteLink(roomId) {
  const link = `${window.location.origin}/?room=${roomId}`;
  document.getElementById('inviteLink').value = link;
}

// Если есть параметр room в ссылке — сразу подключаемся
window.onload = () => {
  const url = new URL(window.location.href);
  const urlRoom = url.searchParams.get('room');
  if (urlRoom) {
    joinRoom(urlRoom);
  }
};

function joinRoom(id) {
  socket.emit('joinRoom', id);
}

socket.on('joined', (data) => {
  roomId = data.roomId;
  playerId = data.playerId;
  menu.style.display = 'none';
  gameDiv.style.display = '';
  status.textContent = 'Ожидание второго игрока...';
});

socket.on('startGame', () => {
  status.textContent = 'Игра началась!';
});

socket.on('roomFull', () => {
  alert('Комната уже полная!');
});

socket.on('playerLeft', () => {
  status.textContent = 'Второй игрок вышел. Игра окончена.';
});

socket.on('gameOver', ({ winner }) => {
  if (winner === playerId) {
    status.textContent = 'Вы победили!';
  } else {
    status.textContent = 'Вы проиграли!';
  }
});

// Управление с клавиатуры
document.addEventListener('keydown', (e) => {
  if (!roomId) return;
  let dx = 0, dy = 0;
  if (e.key === 'ArrowUp') dy = -20;
  else if (e.key === 'ArrowDown') dy = 20;
  else if (e.key === 'ArrowLeft') dx = -20;
  else if (e.key === 'ArrowRight') dx = 20;
  if (dx !== 0 || dy !== 0) {
    socket.emit('direction', { roomId, dx, dy });
  }
});

socket.on('state', (game) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Еда
  ctx.fillStyle = 'red';
  ctx.fillRect(game.food.x, game.food.y, 20, 20);

  // Змейки
  for (const id in game.players) {
    const snake = game.players[id];
    ctx.fillStyle = id === playerId ? 'green' : 'blue';
    for (const part of snake.tail) {
      ctx.fillRect(part.x, part.y, 20, 20);
    }
  }
});
// ...начало файла
const roomIdDisplay = document.getElementById('roomIdDisplay');
const roomIdInGame = document.getElementById('roomIdInGame');

// ...функция showInviteLink
function showInviteLink(roomId) {
  const link = `${window.location.origin}/?room=${roomId}`;
  document.getElementById('inviteLink').value = link;
  roomIdDisplay.textContent = roomId; // ← Показываем код при создании
}

// ...после socket.on('joined', (data) => { 
socket.on('joined', (data) => {
  roomId = data.roomId;
  playerId = data.playerId;
  menu.style.display = 'none';
  gameDiv.style.display = '';
  status.textContent = 'Ожидание второго игрока...';
  roomIdInGame.textContent = roomId; // ← Показываем код внутри игры
});

// ...когда присоединяемся по коду вручную:
document.getElementById('joinRoom').onclick = () => {
  const input = document.getElementById('joinRoomId').value.trim();
  if (input) {
    joinRoom(input);
    roomIdDisplay.textContent = input; // ← Показываем введённый код в меню
  }
};