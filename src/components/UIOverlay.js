import '../styles/hud.css';

const TEMPLATE = `
  <div class="hud-frame" aria-hidden="true">
    <span class="corner corner--tl"></span>
    <span class="corner corner--tr"></span>
    <span class="corner corner--bl"></span>
    <span class="corner corner--br"></span>
  </div>
  <div class="hud-scanlines" aria-hidden="true"></div>
  <div class="hud-vignette" aria-hidden="true"></div>

  <header class="hud-brand">
    <p class="hud-eyebrow">IRIS ORION - AERIAL MONITORING</p>
    <p class="hud-subtitle">HUB &amp; SPOKE // COSTELLAZIONE</p>
    <p class="hud-status" data-state="waiting" role="status" aria-live="polite">
      <span class="status-dot" aria-hidden="true"></span>
      <span data-status>ACQUIRING SIGNAL</span>
    </p>
  </header>

  <div class="hud-actions">
    <button class="hud-button" type="button" data-action="rotate" aria-pressed="true">
      AUTO ROTATE
    </button>
    <button class="hud-button" type="button" data-action="reset">RESET VIEW</button>
  </div>

  <div class="hud-boot" data-boot role="status" aria-live="polite">
    <div class="boot-reticle" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <p class="boot-kicker">IRIS ORION // DEEP SCAN</p>
    <h2 class="boot-title" data-boot-title>ACQUIRING SCAN DATA</h2>
    <p class="boot-file" data-boot-file>SCANNING ASSET</p>
    <div class="boot-track" aria-hidden="true"><span></span></div>
    <p class="boot-error" data-boot-error hidden></p>
    <button class="hud-button" type="button" data-action="retry" hidden>RETRY LINK</button>
  </div>
`;

export default class UIOverlay {
  constructor(root, { onResetView, onToggleAutoRotate, autoRotate = true } = {}) {
    this.onResetView = onResetView || (() => {});
    this.onToggleAutoRotate = onToggleAutoRotate || (() => false);

    this.host = document.createElement('div');
    this.host.className = 'hud';
    this.host.innerHTML = TEMPLATE;
    root.appendChild(this.host);

    this.refs = {
      status: this.host.querySelector('[data-status]'),
      statusPanel: this.host.querySelector('.hud-status'),
      boot: this.host.querySelector('[data-boot]'),
      bootTitle: this.host.querySelector('[data-boot-title]'),
      bootFile: this.host.querySelector('[data-boot-file]'),
      bootError: this.host.querySelector('[data-boot-error]'),
      retryButton: this.host.querySelector('[data-action="retry"]'),
      rotateButton: this.host.querySelector('[data-action="rotate"]'),
      resetButton: this.host.querySelector('[data-action="reset"]')
    };

    this.rotateButton = this.refs.rotateButton;
    this.resetButton = this.refs.resetButton;

    this.handleButtonReset = () => this.onResetView();
    this.handleButtonRotate = () => this.toggleAutoRotate();
    this.handleRetry = () => window.location.reload();

    this.rotateButton.addEventListener('click', this.handleButtonRotate);
    this.resetButton.addEventListener('click', this.handleButtonReset);
    this.refs.retryButton.addEventListener('click', this.handleRetry);

    this.handleKeydown = (event) => this.onKeydown(event);
    window.addEventListener('keydown', this.handleKeydown);
    this.setAutoRotate(autoRotate);
  }

  onKeydown(event) {
    if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const target = event.target;

    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]')) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 'r') {
      this.onResetView();
    } else if (key === 'a') {
      this.toggleAutoRotate();
    }
  }

  toggleAutoRotate() {
    const enabled = Boolean(this.onToggleAutoRotate());
    this.setAutoRotate(enabled);
  }

  setAutoRotate(enabled) {
    this.rotateButton.classList.toggle('is-active', enabled);
    this.rotateButton.setAttribute('aria-pressed', String(enabled));
  }

  setStatus(text, state = 'online') {
    this.refs.status.textContent = text;
    this.refs.statusPanel.dataset.state = state;
  }

  beginLoading(fileName) {
    this.refs.boot.classList.remove('is-hidden', 'is-error');
    this.refs.boot.removeAttribute('aria-hidden');
    this.refs.bootTitle.textContent = 'ACQUIRING SCAN DATA';
    this.refs.bootFile.textContent = fileName || 'SCANNING ASSET';
    this.refs.bootError.hidden = true;
    this.refs.bootError.textContent = '';
    this.refs.retryButton.hidden = true;
    this.setStatus('ACQUIRING SIGNAL', 'waiting');
  }

  finishLoading() {
    this.refs.boot.classList.add('is-hidden');
    this.refs.boot.setAttribute('aria-hidden', 'true');
    this.setStatus('SIGNAL LOCKED', 'online');
  }

  failLoading(message) {
    this.refs.boot.classList.remove('is-hidden');
    this.refs.boot.classList.add('is-error');
    this.refs.boot.removeAttribute('aria-hidden');
    this.refs.bootTitle.textContent = 'SIGNAL LOST';
    this.refs.bootError.textContent = message;
    this.refs.bootError.hidden = false;
    this.refs.retryButton.hidden = false;
    this.setStatus('SIGNAL LOST', 'error');
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeydown);
    this.rotateButton.removeEventListener('click', this.handleButtonRotate);
    this.resetButton.removeEventListener('click', this.handleButtonReset);
    this.refs.retryButton.removeEventListener('click', this.handleRetry);
    this.host.remove();
  }
}
