class Item {
    constructor(ctx, id, x, y, width, height, image) {
        this.ctx = ctx;
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
    }

    update(speed, gameSpeed, deltaTime, scaleRatio) {
        this.x -= speed * gameSpeed * deltaTime * scaleRatio;
    }

    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    collideWith = (sprite) => {
        const adjustBy = 1.4;
        const result = (
            this.x < sprite.x + sprite.width / adjustBy &&
            this.x + this.width / adjustBy > sprite.x &&
            this.y < sprite.y + sprite.height / adjustBy &&
            this.y + this.height / adjustBy > sprite.y
        );

        if (result) {
            this.width = 0;
            this.height = 0;
            this.x = 0;
            this.y = 0;
        }

        // 충돌
        return result;
    }
}

export default Item