import { mountLiquidEther } from './LiquidEtherVanilla.js?v=20260811-5';

const layer = document.querySelector('[data-liquid-ether]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 700px)');
const LIQUID_PALETTE = ['#2b211c', '#6a2c32', '#a47b43'];

let disposeEther = () => {};
let motionContext = null;

function canRenderWebGL() {
  return Boolean(window.WebGLRenderingContext);
}

function mountEffect() {
  disposeEther();
  disposeEther = () => {};

  if (!layer || reducedMotion.matches || !canRenderWebGL()) {
    layer?.classList.add('is-static');
    return;
  }

  layer.classList.remove('is-static');
  const compact = mobile.matches;

  try {
    disposeEther = mountLiquidEther(layer, {
      mouseForce: 26,
      cursorSize: compact ? 82 : 110,
      isViscous: true,
      viscous: 30,
      iterationsViscous: compact ? 16 : 32,
      iterationsPoisson: compact ? 18 : 32,
      colors: LIQUID_PALETTE,
      autoDemo: true,
      autoSpeed: 0.4,
      autoIntensity: compact ? 1.25 : 1.55,
      isBounce: true,
      resolution: compact ? 0.36 : 0.5,
      autoResumeDelay: 1000,
      autoRampDuration: 0.6,
      className: 'hero-liquid-surface'
    });
    layer.classList.add('is-ready');
  } catch (error) {
    console.warn('LiquidEther fallback enabled:', error);
    layer.classList.add('is-static');
  }
}

function mountScrollTransition() {
  motionContext?.revert();
  motionContext = null;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!layer || !gsap || !ScrollTrigger || reducedMotion.matches) return;

  gsap.registerPlugin(ScrollTrigger);
  motionContext = gsap.matchMedia();
  motionContext.add('(prefers-reduced-motion: no-preference)', () => {
    const baseOpacity = Number.parseFloat(getComputedStyle(layer).opacity) || 0.42;
    const timeline = gsap.timeline({
      scrollTrigger: {
        id: 'hero-liquid-transition',
        trigger: '.intro-stage',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.72,
        invalidateOnRefresh: true
      }
    });

    timeline
      .fromTo(layer, { autoAlpha: baseOpacity, yPercent: -2, scale: 1 }, {
        autoAlpha: 0,
        yPercent: 16,
        scale: 1.08,
        duration: 1,
        ease: 'none',
        force3D: true
      }, 0)
      .to('.intro-stage .hero-copy', {
        autoAlpha: 0.34,
        y: -30,
        duration: 0.56,
        ease: 'none',
        force3D: true
      }, 0.42)
      .to(['.hero-note-left', '.hero-note-right', '.intro-stage > .scroll-cue'], {
        autoAlpha: 0,
        y: -12,
        duration: 0.38,
        ease: 'none',
        stagger: 0.025
      }, 0.58);

    return () => timeline.scrollTrigger?.kill();
  });
}

function refresh() {
  mountEffect();
  mountScrollTransition();
  window.ScrollTrigger?.refresh();
}

mountEffect();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountScrollTransition, { once: true });
} else {
  mountScrollTransition();
}

reducedMotion.addEventListener('change', refresh);
mobile.addEventListener('change', refresh);

window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  disposeEther();
  motionContext?.revert();
  reducedMotion.removeEventListener('change', refresh);
  mobile.removeEventListener('change', refresh);
}, { once: true });
