import './styles/global.css';
import Site from './site/Site.js';

const root = document.querySelector('#site');

try {
  new Site(root).mount();
} catch (error) {
  console.error(error);

  if (root) {
    root.innerHTML = `
      <div class="fatal">
        <p class="fatal-code">ERR // SITO NON DISPONIBILE</p>
        <h1>AVVIO NON RIUSCITO</h1>
        <p>Impossibile inizializzare il sito. Ricarica la pagina per riprovare.</p>
      </div>
    `;
  }
}
