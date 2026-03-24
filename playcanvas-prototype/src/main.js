import './style.css';
import { bootstrapPlayCanvas } from './runtime/bootstrap.js';

const root = document.querySelector('#app');

if (!root) {
  throw new Error('Missing root element for PlayCanvas prototype.');
}

bootstrapPlayCanvas(root);
