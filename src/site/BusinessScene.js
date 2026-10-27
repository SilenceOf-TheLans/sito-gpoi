import './BusinessScene.css';
import logoTransparent from '../assets/logos/logo-transparent.png';

export function createBusinessScene() {
  const section = document.createElement('section');
  section.className = 'scene scene--business scene--page';
  section.id = 'business';
  section.dataset.scene = 'business';
  section.setAttribute('aria-labelledby', 'business-title');
  section.innerHTML = `
    <span class="scene-watermark" aria-hidden="true">01</span>

    <div class="scene__inner business__inner">
      <div class="scene__topline scene-enter">
        <p class="scene-kicker scene-kicker--bright">01 / BUSINESS</p>
      </div>

      <div class="business__layout">
        <div class="business__copy">
          <h1 class="business__slogan scene-enter scene-enter--delay" id="business-title">
            <span>UNA RETE.</span>
            <span class="scene-title__accent">NESSUN CONFINE.</span>
          </h1>
          <p class="business__catchphrase scene-enter scene-enter--delay-2">
            Monitoraggio aereo autonomo a costellazione per siti industriali,
            infrastrutture e grandi proprietà private.
          </p>
        </div>

        <figure class="brand-lockup scene-enter scene-enter--delay-2">
          <img class="brand-lockup__image" src="${logoTransparent}" alt="IRIS ORION" />
        </figure>
      </div>

      <div class="scene__footer scene-enter">
        <p class="scene-kicker">IRIS ORION</p>
        <a class="scene-scroll" href="#system">
          <span>SCROLL</span>
          <span class="scene-scroll__line" aria-hidden="true"></span>
        </a>
        <p class="scene-kicker">01 / 05</p>
      </div>
    </div>
  `;

  return section;
}
