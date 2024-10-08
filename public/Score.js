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

  // 아이템 데이터 로드
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

  // 아이템 잠금 해제 맵 로드
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

  // 잠금 해제된 아이템 로드
  async loadUnlockedItems(stage) {
    this.unlockedItems = this.getItemUnlockIds(stage);
  }

  // 점수 업데이트
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
      this.broadcastStageChange();
    }
  }

  // 스테이지 변경 방송
  broadcastStageChange() {
    sendEvent('broadcast', {
      message: `Stage has changed to: ${this.currentStage}`,
    });
  }

  // 특정 스테이지의 잠금 해제된 아이템 ID 가져오기
  getItemUnlockIds(stage) {
    return this.itemUnlockMap[stage] || [];
  }

  // 아이템 획득
  getItem(itemId) {
    const itemInfo = this.getItemData(itemId);
    if (itemInfo) {
      this.score += itemInfo.score;
      console.log(`Item ${itemId} acquired. Score increased by ${itemInfo.score}.`);
      sendEvent(3, { itemId, stageId: this.currentStage });
      this.broadcastItemAcquisition(itemId);
    } else {
      console.warn(`Item ${itemId} not found.`);
    }
  }

  // 아이템 획득 방송
  broadcastItemAcquisition(itemId) {
    sendEvent('broadcast', {
      message: `Item ${itemId} has been acquired!`,
    });
  }

  // 아이템 데이터 가져오기
  getItemData(itemId) {
    return this.itemData.find((item) => item.id === itemId);
  }

  // 점수 및 스테이지 리셋
  reset() {
    this.score = 0;
    this.currentStage = 0;
    this.unlockedItems = [];
  }

  // 배경색 가져오기
  getBackgroundColor() {
    const stageColors = [
      'lightblue', // 0 - 499 점
      'lightgreen', // 500 - 999 점
      'lightcoral', // 1000 - 1499 점
      'lightgoldenrodyellow', // 1500 - 1999 점
      'lightpink', // 2000 - 2499 점
      'lightyellow', // 2500 - 2999 점
      'lightgray', // 3000 점 이상
    ];
    return stageColors[this.currentStage] || 'white'; // 기본 흰색
  }

  // 최고 점수 설정
  async setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
      sendEvent('updateScore', Math.floor(this.score));

      // Redis에 점수 저장
      await this.saveScore('player:1', Math.floor(this.score)); // API를 통해 저장
    }
  }

  // 점수를 저장하는 함수 (API 호출)
  async saveScore(playerId, score) {
    const response = await fetch('/api/saveScore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, score }),
    });

    if (!response.ok) {
      console.error('Failed to save score:', response.statusText);
      return;
    }

    const data = await response.json();
    console.log(data.message);
  }

  // 점수와 스테이지 그리기
  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 200 * this.scaleRatio;
    const stageX = scoreX - 115 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, '0');
    const highScorePadded = highScore.toString().padStart(6, '0');

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
    this.ctx.fillText(`Stage: ${this.currentStage}`, stageX, y);
  }
}
export default Score;
