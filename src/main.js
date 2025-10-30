import './styles/main.css';
import { setupGame } from './game/game.js';

const mainMenuView = document.getElementById('main-menu-view');
const gameView = document.getElementById('game-view');
const enterRiverButton = document.getElementById('main-menu-start-button');

const { resetToSetupScreen } = setupGame({
  onReturnToMenu: showMainMenu
});

function showMainMenu() {
  gameView.classList.add('hidden');
  mainMenuView.classList.remove('hidden');
}

function showGame() {
  mainMenuView.classList.add('hidden');
  gameView.classList.remove('hidden');
  resetToSetupScreen();
}

enterRiverButton?.addEventListener('click', () => {
  showGame();
});

showMainMenu();
