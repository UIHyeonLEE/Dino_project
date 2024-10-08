import { sendEvent } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  currentStage = 0;
  STAGE_SCORE_INCREMENT = 500;
  itemData = [];
  unlockedItems = [];
  itemUnlockMap = {};

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.loadItemData();
    this.loadItemUnlockMap();
  }

  async loadItemData() {
    try {
      const response = await fetch('/assets/item.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (!data || !Array.isArray(data.data)) {
        throw new Error('Item data is not an array');
      }

      this.itemData = data.data;
      console.log('Item data loaded successfully:', this.itemData);
    } catch (error) {
      console.error('Error loading item data:', error);
    }
  }

  async loadItemUnlockMap() {
    try {
      const response = await fetch('/assets/item_unlock.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const unlockData = await response.json();

      unlockData.data.forEach((item) => {
        const stage = item.stage_id - 501;
        if (!this.itemUnlockMap[stage]) this.itemUnlockMap[stage] = [];
        this.itemUnlockMap[stage].push(item.item_id);
      });

      console.log('Item unlock map loaded successfully:', this.itemUnlockMap);
    } catch (error) {
      console.error('Error loading item unlock map:', error);
    }
  }
  async loadUnlockedItems(stage) {
    this.unlockedItems = this.getItemUnlockIds(stage);
  }

  async update(deltaTime) {
    this.score += deltaTime * 0.01;

    const newStage = Math.floor(this.score / this.STAGE_SCORE_INCREMENT);
    if (newStage > this.currentStage) {
      this.currentStage = newStage;
      console.log(`Stage changed to: ${this.currentStage}`);
      await this.loadUnlockedItems(this.currentStage);
      sendEvent(11, {
        currentStage: this.currentStage,
        targetStage: this.currentStage * this.STAGE_SCORE_INCREMENT + 1,
      });
    }
  }

  getItemUnlockIds(stage) {
    return this.itemUnlockMap[stage] || [];
  }

  getItem(itemId) {
    const itemInfo = this.getItemData(itemId);
    if (itemInfo) {
      this.score += itemInfo.score;
      console.log(`Item ${itemId} acquired. Score increased by ${itemInfo.score}.`);
      sendEvent(3, { itemId, stageId: this.currentStage });
    } else {
      console.warn(`Item ${itemId} not found.`);
    }
  }

  getItemData(itemId) {
    return this.itemData.find((item) => item.id === itemId);
  }

  reset() {
    this.score = 0;
    this.currentStage = 0;
    this.unlockedItems = [];
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
      sendEvent('updateScore', Math.floor(this.score));
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
