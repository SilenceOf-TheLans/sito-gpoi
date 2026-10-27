import './ContactsScene.css';

export function createContactsScene() {
  const section = document.createElement('section');
  section.className = 'scene scene--contacts scene--page';
  section.id = 'contacts';
  section.dataset.scene = 'contacts';
  section.setAttribute('aria-labelledby', 'contacts-title');
  section.innerHTML = `
    <span class="scene-watermark" aria-hidden="true">05</span>

    <div class="scene__inner contacts__inner">
      <div class="scene__topline scene-enter">
        <p class="scene-kicker scene-kicker--bright">05 / CONTATTI</p>
        <p class="scene-kicker">IRIS ORION</p>
      </div>

      <div class="contacts__layout">
        <div class="contacts__intro">
          <p class="scene-eyebrow scene-enter">CONTATTI</p>
          <h2 class="scene-title contacts__title scene-enter scene-enter--delay" id="contacts-title">
            <span>CONTATTI</span>
            <span class="scene-title__accent">IRIS ORION</span>
          </h2>
        </div>

        <dl class="contacts__list scene-enter scene-enter--delay-2">
          <div class="contacts__row">
            <dt class="contacts__label">EMAIL</dt>
            <dd class="contacts__value">info@irisorion.com</dd>
          </div>
          <div class="contacts__row">
            <dt class="contacts__label">TELEFONO</dt>
            <dd class="contacts__value">+39 02 8000 2147</dd>
          </div>
          <div class="contacts__row">
            <dt class="contacts__label">LINKEDIN</dt>
            <dd class="contacts__value">/company/iris-orion</dd>
          </div>
          <div class="contacts__row">
            <dt class="contacts__label">SEDE</dt>
            <dd class="contacts__value">Milano, Italia</dd>
          </div>
        </dl>
      </div>

      <div class="scene__footer scene-enter">
        <p class="scene-kicker">IRIS ORION</p>
        <p class="scene-kicker">05 / 05</p>
      </div>
    </div>
  `;

  return section;
}
