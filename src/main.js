import './style.css';
import { GameApp } from './core/GameApp.js';

const container = document.querySelector('#app');

if (!container) {
  throw new Error('Missing app container.');
}

const app = new GameApp(container);
app.start();
