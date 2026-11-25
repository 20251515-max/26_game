export class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  create() {
    this.add.text(480, 190, "모찌 공장", {
      color: "#4b2d25",
      fontFamily: "Malgun Gothic, sans-serif",
      fontSize: "56px",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(480, 255, "손님 주문에 맞춰 과일 모찌를 만들어 보세요.", {
      color: "#7a5144",
      fontFamily: "Malgun Gothic, sans-serif",
      fontSize: "22px",
    }).setOrigin(0.5);

    const startButton = this.add.text(480, 355, "시작", {
      backgroundColor: "#d67a5c",
      color: "#ffffff",
      fontFamily: "Malgun Gothic, sans-serif",
      fontSize: "28px",
      padding: { x: 34, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startButton.on("pointerup", () => this.scene.start("PlayScene"));
  }
}
