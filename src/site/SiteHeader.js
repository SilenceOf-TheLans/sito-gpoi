import './SiteHeader.css';
import logoMark from '../assets/logos/logo-mark.png';

const LINKS = [
  { id: 'business', index: '01', label: 'Business' },
  { id: 'system', index: '02', label: 'Sistema' },
  { id: 'scan', index: '03', label: 'Visual' },
  { id: 'need', index: '04', label: 'Valore' },
  { id: 'contacts', index: '05', label: 'Contatti' }
];

export function createSiteHeader() {
  const element = document.createElement('header');
  element.className = 'site-header';
  element.innerHTML = `
    <div class="site-header__inner">
      <a class="site-header__brand" href="#business" aria-label="IRIS ORION, torna alla sezione Business">
        <img class="site-header__mark" src="${logoMark}" alt="" aria-hidden="true">
        <span>IRIS ORION</span>
      </a>
      <nav class="site-header__nav" aria-label="Sezioni del sito">
        ${LINKS.map(
          (link) => `
            <a
              class="site-header__link"
              href="#${link.id}"
              data-scene-link="${link.id}"
            ><span class="site-header__index">${link.index}</span><span class="site-header__label">${link.label}</span></a>
          `
        ).join('')}
      </nav>
      <div class="site-header__meta">
        <span class="site-header__live">MONITORING-AS-A-SERVICE</span>
        <span class="site-header__counter" data-scene-counter>01 / 05</span>
      </div>
    </div>
    <div class="site-header__progress" aria-hidden="true">
      <span data-scroll-progress></span>
    </div>
  `;

  const links = Array.from(element.querySelectorAll('[data-scene-link]'));
  const counter = element.querySelector('[data-scene-counter]');
  const progress = element.querySelector('[data-scroll-progress]');

  return {
    element,
    setActive(id, index, total) {
      links.forEach((link) => {
        if (link.dataset.sceneLink === id) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    },
    setProgress(value) {
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
    }
  };
}
