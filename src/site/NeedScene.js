import './NeedScene.css';

export function createNeedScene() {
  const section = document.createElement('section');
  section.className = 'scene scene--need scene--page';
  section.id = 'need';
  section.dataset.scene = 'need';
  section.setAttribute('aria-labelledby', 'need-title');
  section.innerHTML = `
    <span class="scene-watermark" aria-hidden="true">04</span>

    <div class="scene__inner need__inner">
      <div class="scene__topline scene-enter">
        <p class="scene-kicker scene-kicker--bright">04 / VALORE</p>
        <p class="scene-kicker">AGGIUNTO</p>
      </div>

      <div class="need__layout">
        <div class="need__intro">
          <p class="scene-eyebrow scene-enter">VALORE AGGIUNTO</p>
          <h2 class="scene-title need__title scene-enter scene-enter--delay" id="need-title">
            <span>VALORE</span>
            <span class="scene-title__accent">AGGIUNTO</span>
          </h2>
        </div>

        <div class="need__copy scene-enter scene-enter--delay-2">
          <p class="need__lede">
            Grandi siti industriali, parchi fotovoltaici, porti, hub logistici e tenute
            private soffrono ancora di costi elevati per la vigilanza umana, punti ciechi
            nelle telecamere fisse e tempi di reazione lenti.
          </p>

          <ul class="need__values">
            <li class="need__value">
              <span class="need__value-index">01</span>
              <div>
                <h3>PAY-AS-YOU-GROW</h3>
                <p>
                  Nessun acquisto di droni complessi: aggiungi nodi alla costellazione
                  quando crescono le esigenze.
                </p>
              </div>
            </li>
            <li class="need__value">
              <span class="need__value-index">02</span>
              <div>
                <h3>ZERO BUROCRAZIA</h3>
                <p>
                  Licenze di volo, manutenzioni e piloti restano a carico del servizio
                  gestito.
                </p>
              </div>
            </li>
            <li class="need__value">
              <span class="need__value-index">03</span>
              <div>
                <h3>COPERTURA CONTINUA</h3>
                <p>
                  Pattugliamento autonomo e risposta rapida alle intrusioni, senza
                  soluzione di continuità.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="scene__footer scene-enter">
        <p class="scene-kicker">IRIS ORION</p>
        <p class="scene-kicker">04 / 05</p>
      </div>
    </div>
  `;

  return section;
}
