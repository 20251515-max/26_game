export class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    this.add.text(480, 100, "플레이 화면", {
      color: "#4b2d25",
      fontFamily: "Malgun Gothic, sans-serif",
      fontSize: "38px",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(480, 180, "주문과 제한 시간은 다음 작업에서 추가됩니다.", {
      color: "#7a5144",
      fontFamily: "Malgun Gothic, sans-serif",
      fontSize: "22px",
    }).setOrigin(0.5);
  }

  finishRound(result) {
    this.scene.start("ResultScene", result);
  }
}
