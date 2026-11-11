import { StartScene } from "./scenes/StartScene.js";
import { PlayScene } from "./scenes/PlayScene.js";
import { ResultScene } from "./scenes/ResultScene.js";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 960,
  height: 540,
  backgroundColor: "#fff9f2",
  scene: [StartScene, PlayScene, ResultScene],
});
