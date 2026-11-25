import { FRUIT_INGREDIENTS } from '../production/MochiMaker.js';
import { drawDough, drawFruitIcon } from './CuteShapes.js';
import { textStyle } from './Widgets.js';

const TILE_Y = 503;

// 아래쪽 재료 칸: 찹쌀 반죽과 과일들, 과일 칸에는 손질된 개수를 표시한다.
export class IngredientTray {
  constructor(scene, graphics, onDough, onFruit) {
    this.scene = scene;

    graphics.fillStyle(0xfff1b8, 1);
    graphics.fillRoundedRect(445, 452, 745, 102, 26);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(445, 452, 745, 102, 26);

    this.doughTile = this.createTile(537, '찹쌀 반죽', (icon) => drawDough(icon, 0, 0, 52, 42), onDough);

    this.fruitTiles = {};
    FRUIT_INGREDIENTS.forEach((fruit, index) => {
      this.fruitTiles[fruit] = this.createTile(
        677 + index * 140,
        fruit,
        (icon) => drawFruitIcon(icon, fruit, 0, 0, 20),
        () => onFruit(fruit),
        true,
      );
    });
  }

  // 손님이 없으면 반죽 칸을 흐리게, 손님이 있을 때 손질된 과일이 없으면 과일 칸을 흐리게 한다.
  update(phase, prep) {
    this.doughTile.container.setAlpha(phase === 'serving' ? 1 : 0.45);
    FRUIT_INGREDIENTS.forEach((fruit) => {
      const tile = this.fruitTiles[fruit];

      tile.badge.setText(String(prep.stock[fruit]));
      tile.container.setAlpha(phase === 'serving' && !prep.hasStock(fruit) ? 0.55 : 1);
    });
  }

  fruitTile(fruit) {
    return this.fruitTiles[fruit].container;
  }

  pop(container) {
    this.scene.tweens.add({ targets: container, scale: 1.15, duration: 100, yoyo: true });
  }

  createTile(x, label, drawIcon, onClick, withBadge = false) {
    const { scene } = this;
    const tile = scene.add.graphics();
    const icon = scene.add.graphics({ x: 0, y: -10 });
    const text = scene.add.text(0, 26, label, textStyle(20)).setOrigin(0.5);

    tile.fillStyle(0xffffff, 1);
    tile.fillRoundedRect(-55, -42, 110, 84, 22);
    tile.lineStyle(3, 0x5a466b, 1);
    tile.strokeRoundedRect(-55, -42, 110, 84, 22);
    drawIcon(icon);

    const parts = [tile, icon, text];
    let badge = null;

    // 손질된 과일 개수
    if (withBadge) {
      const badgeCircle = scene.add.graphics();

      badgeCircle.fillStyle(0xffa9c0, 1);
      badgeCircle.fillCircle(42, -32, 15);
      badgeCircle.lineStyle(3, 0x5a466b, 1);
      badgeCircle.strokeCircle(42, -32, 15);
      badge = scene.add.text(42, -32, '0', {
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      parts.push(badgeCircle, badge);
    }

    const container = scene.add.container(x, TILE_Y, parts);
    const zone = scene.add.zone(x, TILE_Y, 110, 84).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => container.setScale(1.06));
    zone.on('pointerout', () => container.setScale(1));
    zone.on('pointerdown', () => {
      scene.tweens.add({ targets: container, scale: 0.92, duration: 70, yoyo: true });
      onClick();
    });

    return { container, badge };
  }
}
