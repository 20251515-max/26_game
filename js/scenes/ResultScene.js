export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(result = {}) {
    const title = result.success ? "성공" : "결과";

    this.add.text(480, 180, title, {
      color: "#4b2d25",
      fontFamily: "Malgun Gothic, sans-serif",
      fontSize: "52px",
      fontStyle: "bold",
    }).setOrigin(0.5);

    const restartButton = this.add.text(480, 330, "다시 하기", {
      backgroundColor: "#d67a5c",
      color: "#ffffff",
      fontFamily: "Malgun Gothic, sans-serif",
      fontSize: "28px",
      padding: { x: 30, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartButton.on("pointerup", () => this.scene.start("PlayScene"));
  }
}
