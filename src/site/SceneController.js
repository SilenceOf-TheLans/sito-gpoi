export default class SceneController {
  constructor({ scenes, header, onSceneChange }) {
    this.scenes = scenes;
    this.header = header;
    this.onSceneChange = onSceneChange;
    this.activeScene = null;
    this.frame = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.motionTargets = new Map(
      scenes.map((scene) => [
        scene,
        scene.querySelector('.scene__inner') || scene.querySelector('.scanner-stage')
      ])
    );
    this.navigationLocked = false;
    this.navigationTarget = null;
    this.navigationTimer = null;
    this.navigationFrame = null;
    this.wheelDelta = 0;
    this.lastWheelTime = 0;

    this.update = this.update.bind(this);
    this.scheduleUpdate = this.scheduleUpdate.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleScrollEnd = this.handleScrollEnd.bind(this);
  }

  start() {
    window.addEventListener('scroll', this.scheduleUpdate, { passive: true });
    window.addEventListener('resize', this.scheduleUpdate);
    window.addEventListener('wheel', this.handleWheel, { passive: false });
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('scrollend', this.handleScrollEnd);
    this.update();
  }

  scheduleUpdate() {
    if (this.frame !== null) {
      return;
    }

    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.update();
    });
  }

  update() {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;
    let nearestScene = this.scenes[0];
    let nearestDistance = Infinity;

    this.scenes.forEach((scene) => {
      const rect = scene.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);

      this.setSceneMotion(scene, rect.top / viewportHeight);

      if (distance < nearestDistance) {
        nearestScene = scene;
        nearestDistance = distance;
      }
    });

    if (nearestScene !== this.activeScene) {
      this.activeScene = nearestScene;
      this.scenes.forEach((scene) => {
        scene.classList.toggle('is-active', scene === nearestScene);
      });

      const index = this.scenes.indexOf(nearestScene);
      const id = nearestScene.dataset.scene;

      this.header.setActive(id, index, this.scenes.length);
      document.documentElement.dataset.scene = id;
      this.onSceneChange?.(nearestScene);
    }

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    this.header.setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
  }

  handleWheel(event) {
    if (event.ctrlKey || event.metaKey || event.deltaY === 0) {
      return;
    }

    event.preventDefault();

    const now = performance.now();

    if (this.navigationLocked) {
      this.lastWheelTime = now;
      return;
    }

    if (this.wheelDelta === 0 && now - this.lastWheelTime < 140) {
      this.lastWheelTime = now;
      return;
    }

    const scale =
      event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;

    if (now - this.lastWheelTime > 180) {
      this.wheelDelta = 0;
    }

    this.lastWheelTime = now;
    this.wheelDelta += event.deltaY * scale;

    if (Math.abs(this.wheelDelta) < 32) {
      return;
    }

    const direction = Math.sign(this.wheelDelta);
    this.wheelDelta = 0;
    this.navigate(direction);
  }

  handleKeydown(event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    let targetIndex = null;
    const currentIndex = this.scenes.indexOf(this.activeScene);
    const interactive = event.target.closest?.('a, button, input, textarea, select, [contenteditable="true"]');

    switch (event.key) {
      case 'PageDown':
      case 'ArrowDown':
        targetIndex = Math.min(this.scenes.length - 1, currentIndex + 1);
        break;
      case 'PageUp':
      case 'ArrowUp':
        targetIndex = Math.max(0, currentIndex - 1);
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = this.scenes.length - 1;
        break;
      case ' ':
        if (interactive) {
          return;
        }

        targetIndex = Math.min(this.scenes.length - 1, currentIndex + 1);
        break;
      default:
        return;
    }

    event.preventDefault();

    if (!this.navigationLocked && targetIndex !== currentIndex) {
      this.scrollToScene(targetIndex);
    }
  }

  handleScrollEnd() {
    if (!this.navigationLocked) {
      return;
    }

    this.navigationLocked = false;
    this.navigationTarget = null;
    this.wheelDelta = 0;
    window.clearTimeout(this.navigationTimer);
    this.navigationTimer = null;

    if (this.navigationFrame !== null) {
      cancelAnimationFrame(this.navigationFrame);
      this.navigationFrame = null;
    }
  }

  trackNavigation() {
    if (this.navigationFrame !== null) {
      cancelAnimationFrame(this.navigationFrame);
    }

    const tick = () => {
      this.navigationFrame = null;

      if (!this.navigationLocked) {
        return;
      }

      if (Math.abs(window.scrollY - this.navigationTarget) <= 1) {
        this.handleScrollEnd();
        return;
      }

      this.navigationFrame = requestAnimationFrame(tick);
    };

    this.navigationFrame = requestAnimationFrame(tick);
  }

  navigate(direction) {
    const currentIndex = this.scenes.indexOf(this.activeScene);
    const targetIndex = Math.min(
      this.scenes.length - 1,
      Math.max(0, currentIndex + direction)
    );

    if (targetIndex !== currentIndex) {
      this.scrollToScene(targetIndex);
    }
  }

  scrollToScene(index) {
    const scene = this.scenes[index];

    if (!scene) {
      return;
    }

    this.navigationLocked = true;
    this.navigationTarget = scene.offsetTop;
    window.clearTimeout(this.navigationTimer);
    this.navigationTimer = window.setTimeout(this.handleScrollEnd, 1200);
    window.scrollTo({
      top: this.navigationTarget,
      behavior: this.reducedMotion.matches ? 'auto' : 'smooth'
    });
    this.trackNavigation();
  }

  setSceneMotion(scene, offset) {
    const target = this.motionTargets.get(scene);

    if (!target) {
      return;
    }

    if (this.reducedMotion.matches) {
      if (target.style.opacity || target.style.transform) {
        target.style.removeProperty('opacity');
        target.style.removeProperty('transform');
      }

      return;
    }

    const amount = Math.min(1, Math.abs(offset));
    const opacity = 1 - amount * 0.6;
    const shift = -offset * window.innerHeight * 0.05;
    const scale = 1 - amount * 0.025;

    target.style.opacity = opacity.toFixed(3);
    target.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
  }

  destroy() {
    window.removeEventListener('scroll', this.scheduleUpdate);
    window.removeEventListener('resize', this.scheduleUpdate);
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('scrollend', this.handleScrollEnd);
    window.clearTimeout(this.navigationTimer);

    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }
}
