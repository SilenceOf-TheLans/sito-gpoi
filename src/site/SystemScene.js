import './SystemScene.css';

export function createSystemScene() {
  const section = document.createElement('section');
  section.className = 'scene scene--system scene--page';
  section.id = 'system';
  section.dataset.scene = 'system';
  section.setAttribute('aria-labelledby', 'system-title');
  section.innerHTML = `
    <span class="scene-watermark" aria-hidden="true">02</span>

    <div class="scene__inner system__inner">
      <div class="scene__topline scene-enter">
        <p class="scene-kicker scene-kicker--bright">02 / SISTEMA</p>
        <p class="scene-kicker">DESCRIZIONE</p>
      </div>

      <div class="system__layout">
        <div class="system__intro">
          <p class="scene-eyebrow scene-enter">SISTEMA</p>
          <h2 class="scene-title system__title scene-enter scene-enter--delay" id="system-title">
            <span>DESCRIZIONE</span>
          <span class="scene-title__accent">SISTEMA</span>

          </h2>
        </div>

        <div class="system__copy scene-enter scene-enter--delay-2">
          <p class="system__lede">
            IRIS ORION offre piattaforme autonome di monitoraggio aereo modulare a
            costellazione, erogate come servizio gestito di
            Monitoring&#8209;as&#8209;a&#8209;Service.
          </p>
          <p class="system__body">
            Una sola infrastruttura aerea garantisce sicurezza perimetrale continua,
            pattugliamento autonomo, ispezione termica e risposta rapida ad anomalie
            e intrusioni su grandi superfici industriali o private.
          </p>

          <dl class="system__facts">
            <div class="system__fact">
              <dt>SERVIZIO</dt>
              <dd>MaaS</dd>
            </div>
            <div class="system__fact">
              <dt>COPERTURA</dt>
              <dd>24/7</dd>
            </div>
            <div class="system__fact">
              <dt>DRONI</dt>
              <dd>DJI</dd>
            </div>
          </dl>

          <p class="system__pricing">
            <span>CANONE INDICATIVO</span>
            <strong>€1.500–€4.000 / mese</strong>
            <small>per sito, in base alla configurazione</small>
          </p>
        </div>
      </div>

      <div class="scene__footer scene-enter">
        <p class="scene-kicker">IRIS ORION</p>
        <p class="scene-kicker">02 / 05</p>
      </div>
    </div>
  `;

  return section;
}
