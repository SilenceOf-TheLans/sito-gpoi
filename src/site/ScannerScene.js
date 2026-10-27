import Viewer from '../components/Viewer.js';
import UIOverlay from '../components/UIOverlay.js';
import { loadPointCloud } from '../loaders/PointLoader.js';
import { resolvePointCloud } from '../data/pointClouds.js';
import './ScannerScene.css';

export default class ScannerScene {
  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'scene scene--scan';
    this.element.id = 'scan';
    this.element.dataset.scene = 'scan';
    this.element.setAttribute('aria-labelledby', 'scan-title');
    this.element.innerHTML = `
      <span class="scene-watermark scene-watermark--left scan__watermark" aria-hidden="true">03</span>

      <div class="scene__inner scan__inner">
        <div class="scene__topline scene-enter">
          <p class="scene-kicker scene-kicker--bright">03 / SISTEMA</p>
          <p class="scene-kicker">VISUALIZZAZIONE</p>
        </div>

        <div class="scan__layout">
          <div class="scan__copy scene-enter scene-enter--delay">
            <p class="scene-eyebrow">SISTEMA AEREO</p>
            <h2 class="scene-title scan__title" id="scan-title">
              <span>HUB &amp;</span>
              <span class="scene-title__accent">SPOKE</span>
            </h2>
            <p class="scan__lede">
              Un drone tethered presidia il sito come nodo master e ponte radio. I
              micro-droni orbitano attorno all&rsquo;area per pattugliamento e ispezione
              termica, mentre l&rsquo;Orchestrator coordina decollo, missioni e rientro
              senza intervento umano diretto.
            </p>
            <ul class="scan__tags">
              <li class="scan__tag"><span>HUB</span><strong>TETHERED</strong></li>
              <li class="scan__tag"><span>NODI</span><strong>ORBITANTI</strong></li>
              <li class="scan__tag"><span>SOFTWARE</span><strong>ORCHESTRATOR</strong></li>
            </ul>
          </div>

          <div class="scanner-stage" data-scanner-stage>
            <div class="scanner-stage__standby" data-scanner-standby aria-hidden="true">
              <span class="scanner-stage__bracket"></span>
              <p>RICOSTRUZIONE IN ATTESA</p>
              <span>SCORRI PER INIZIALIZZARE</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.stage = this.element.querySelector('[data-scanner-stage]');
    this.active = false;
    this.started = false;
    this.disposed = false;
    this.viewer = null;
    this.ui = null;

    this.handleIntersection = (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.initialize();
      }
    };

    this.observer = new IntersectionObserver(this.handleIntersection, {
      rootMargin: '320px 0px'
    });
    this.observer.observe(this.element);
  }

  setActive(active) {
    this.active = Boolean(active);
    this.viewer?.setActive(this.active);
  }

  async initialize() {
    if (this.started || this.disposed) {
      return;
    }

    this.started = true;
    this.observer.disconnect();
    this.element.querySelector('[data-scanner-standby]')?.remove();

    let viewer;

    try {
      viewer = new Viewer(this.stage);
    } catch (error) {
      this.showFatalError(error);
      return;
    }

    const ui = new UIOverlay(this.stage, {
      autoRotate: viewer.isAutoRotating(),
      onResetView: () => viewer.resetView(),
      onToggleAutoRotate: () => viewer.toggleAutoRotate()
    });

    this.viewer = viewer;
    this.ui = ui;
    viewer.setActive(this.active);

    const cloud = resolvePointCloud();

    if (!cloud) {
      ui.beginLoading('NO ASSET LINK');
      ui.failLoading('NO SCAN ASSETS WERE FOUND.');
      return;
    }

    ui.beginLoading(cloud.file.toUpperCase());

    try {
      const { positions } = await loadPointCloud(cloud.url, {
        name: cloud.name
      });

      if (this.disposed) {
        return;
      }

      viewer.setPointCloud(positions);
      ui.finishLoading();
    } catch (error) {
      console.error(error);
      ui.failLoading('UNABLE TO ACQUIRE SCAN DATA. VERIFY THE ASSET LINK AND RELOAD.');
    }
  }

  showFatalError(error) {
    console.error(error);
    this.stage.innerHTML = `
      <div class="fatal fatal--inline">
        <p class="fatal-code">ERR // RENDERER NON DISPONIBILE</p>
        <h1>WEBGL NON DISPONIBILE</h1>
        <p>
          Il visualizzatore richiede WebGL. Aggiorna il browser, abilita
          l&rsquo;accelerazione hardware e ricarica la pagina.
        </p>
      </div>
    `;
  }

  destroy() {
    this.disposed = true;
    this.observer.disconnect();
    this.ui?.destroy();
    this.viewer?.dispose();
    this.ui = null;
    this.viewer = null;
  }
}
