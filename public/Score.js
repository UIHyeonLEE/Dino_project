import { sendEvent } from './Socket.js';
import itemData from './assets/item.json';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;
  currentStage = 0; // 현재 스테이지 초기화
  STAGE_SCORE_INCREMENT = 500; // 스테이지 변경 점수 초기화

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(deltaTime) {
    this.score += deltaTime * 0.01;

    const newStage = Math.floor(this.score / this.STAGE_SCORE_INCREMENT);
    if (newStage > this.currentStage) {
      this.currentStage = newStage;
      console.log(`Stage changed to: ${this.currentStage}`);
      sendEvent(11, {
        currentStage: this.currentStage * this.STAGE_SCORE_INCREMENT,
        targetStage: this.currentStage * this.STAGE_SCORE_INCREMENT + 1,
      });
    }
  }

  getItem(itemId) {
    const itemInfo = this.getItemData(itemId);
    if (itemInfo) {
      this.score += itemInfo.score;
      sendEvent(3, { itemId, stageId: this.currentStage });
    }
  }

  getItemData(itemId) {
    return itemData.find((item) => item.id === itemId);
  }

  reset() {
    this.score = 0;
    this.currentStage = 0; // 스테이지 초기화
  }

  getBackgroundColor() {
    const stageColors = [
      'lightblue', // 0~499점
      'lightgreen', // 500~999점
      'lightcoral', // 1000~1499점
      'lightgoldenrodyellow', // 1500~1999점
      'lightpink', // 2000~2499점
      'lightyellow', // 2500~2999점
      'lightgray', // 3000점 이상
    ];
    return stageColors[this.currentStage] || 'white'; // 색상이 없으면 기본 흰색
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 200 * this.scaleRatio;
    const stageX = scoreX - 115 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
    this.ctx.fillText(`Stage: ${this.currentStage}`, stageX, y);
  }
}

export default Score;
