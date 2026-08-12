const DEFAULTS = {
  text: '',
  disabled: false,
  speed: 2.5,
  delay: 1.1,
  color: '#b5b5b5',
  shineColor: '#8fc9b7',
  accentStart: '#d4aa58',
  accentEnd: '#a66f97',
  spread: 120,
  yoyo: false,
  pauseOnHover: false,
  direction: 'left',
  phaseDelay: 0
};

export function mountShinyText(element, options = {}) {
  if (!element) return () => {};

  const config = { ...DEFAULTS, ...options };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsTextClip = CSS.supports('-webkit-background-clip', 'text') || CSS.supports('background-clip', 'text');
  let isHoverPaused = false;
  let isVisible = true;

  if (config.text) element.textContent = config.text;
  element.style.setProperty('--shiny-base', config.color);
  element.style.setProperty('--shiny-highlight', config.shineColor);
  element.style.setProperty('--shiny-accent-start', config.accentStart);
  element.style.setProperty('--shiny-accent-end', config.accentEnd);
  element.style.setProperty('--shiny-spread', `${config.spread}deg`);
  element.style.setProperty('--shiny-cycle', `${Math.max(1.6, config.speed + config.delay)}s`);
  element.style.setProperty('--shiny-phase-delay', `${config.phaseDelay}s`);
  element.classList.toggle('is-shiny-reverse', config.direction === 'right');
  element.classList.toggle('is-shiny-yoyo', config.yoyo);

  const shouldPause = () => (
    config.disabled || reducedMotion.matches || isHoverPaused || !isVisible || document.hidden
  );

  const syncPlayState = () => {
    element.style.animationPlayState = shouldPause() ? 'paused' : 'running';
  };

  const syncMotionPreference = () => {
    const shouldAnimate = !config.disabled && !reducedMotion.matches && supportsTextClip;
    element.classList.toggle('is-shiny-ready', shouldAnimate);
    syncPlayState();
  };

  const handleMouseEnter = () => {
    if (!config.pauseOnHover) return;
    isHoverPaused = true;
    syncPlayState();
  };

  const handleMouseLeave = () => {
    if (!config.pauseOnHover) return;
    isHoverPaused = false;
    syncPlayState();
  };

  const handleVisibility = () => syncPlayState();
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        isVisible = entries[0]?.isIntersecting ?? true;
        syncPlayState();
      }, { rootMargin: '12% 0px' })
    : null;

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);
  document.addEventListener('visibilitychange', handleVisibility);
  reducedMotion.addEventListener('change', syncMotionPreference);
  observer?.observe(element);
  syncMotionPreference();

  return () => {
    observer?.disconnect();
    reducedMotion.removeEventListener('change', syncMotionPreference);
    document.removeEventListener('visibilitychange', handleVisibility);
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    element.classList.remove('is-shiny-ready', 'is-shiny-reverse', 'is-shiny-yoyo');
    element.style.animationPlayState = '';
  };
}
