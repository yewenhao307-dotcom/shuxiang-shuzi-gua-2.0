import { mountShinyText } from './ShinyText.js';

const primary = document.querySelector('[data-shiny-line="primary"]');
const secondary = document.querySelector('[data-shiny-line="secondary"]');

const cleanups = [
  mountShinyText(primary, {
    speed: 2.45,
    delay: 1.05,
    color: '#2b211a',
    accentStart: '#d7aa50',
    shineColor: '#83c7b2',
    accentEnd: '#a76d99',
    spread: 116,
    direction: 'left'
  }),
  mountShinyText(secondary, {
    speed: 2.45,
    delay: 1.05,
    phaseDelay: 0.18,
    color: '#5b2a2a',
    accentStart: '#dfb45a',
    shineColor: '#8bcdb9',
    accentEnd: '#bc7395',
    spread: 118,
    direction: 'left'
  })
];

window.addEventListener('pagehide', event => {
  if (!event.persisted) cleanups.forEach(cleanup => cleanup());
});
