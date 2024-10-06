import Cactus from "./Cactus.js";

class CactiController {

    CACTUS_INTERVAL_MIN = 500;
    CACTUS_INTERVAL_MAX = 2000;

    nextCactusInterval = null;
    cacti = [];


    constructor(ctx, cactiImages, scaleRatio, speed) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.cactiImages = cactiImages;
        this.scaleRatio = scaleRatio;
        this.speed = speed;

        this.setNextCactusTime();
    }

    setNextCactusTime() {
        this.nextCactusInterval = this.getRandomNumber(
            this.CACTUS_INTERVAL_MIN,
            this.CACTUS_INTERVAL_MAX
        );
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    createCactus() {
        const index = this.getRandomNumber(0, this.cactiImages.length - 1);
        const cactusImage = this.cactiImages[index];
        const x = this.canvas.width * 1.5;
        const y = this.canvas.height - cactusImage.height;

        const cactus = new Cactus(
            this.ctx,
            x,
            y,
            cactusImage.width,
            cactusImage.height,
            cactusImage.image
        );

        this.cacti.push(cactus);
    }


    update(gameSpeed, deltaTime) {
        if(this.nextCactusInterval <= 0) {
            // 선인장 생성
            this.createCactus();
            this.setNextCactusTime();
        }

        this.nextCactusInterval -= deltaTime;

        this.cacti.forEach((cactus) => {
            cactus.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
        })

        // 지나간 선인장 삭제
        this.cacti = this.cacti.filter(cactus => cactus.x > -cactus.width);
    }

    draw() {
        this.cacti.forEach((cactus) => cactus.draw());
    }

    collideWith(sprite) {
        return this.cacti.some(cactus => cactus.collideWith(sprite));
    }

    reset() {
        this.cacti = [];
    }
}

export default CactiController;