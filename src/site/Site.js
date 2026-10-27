import './Site.css';
import { createSiteHeader } from './SiteHeader.js';
import { createBusinessScene } from './BusinessScene.js';
import { createSystemScene } from './SystemScene.js';
import ScannerScene from './ScannerScene.js';
import { createNeedScene } from './NeedScene.js';
import { createContactsScene } from './ContactsScene.js';
import SceneController from './SceneController.js';

export default class Site {
  constructor(root) {
    if (!root) {
      throw new Error('Site root element was not found.');
    }

    this.root = root;
    this.scannerScene = null;
    this.controller = null;
  }

  mount() {
    const header = createSiteHeader();
    const business = createBusinessScene();
    const system = createSystemScene();
    const need = createNeedScene();
    const contacts = createContactsScene();
    const main = document.createElement('main');

    this.scannerScene = new ScannerScene();

    main.className = 'site-main';
    main.append(
      business,
      system,
      this.scannerScene.element,
      need,
      contacts
    );
    this.root.append(header.element, main);

    this.controller = new SceneController({
      scenes: [
        business,
        system,
        this.scannerScene.element,
        need,
        contacts
      ],
      header,
      onSceneChange: (scene) => {
        this.scannerScene.setActive(scene === this.scannerScene.element);
      }
    });
    this.controller.start();

    return this;
  }

  destroy() {
    this.controller?.destroy();
    this.scannerScene?.destroy();
    this.root.replaceChildren();
    this.controller = null;
    this.scannerScene = null;
  }
}
