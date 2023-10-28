class Entity {
    sprite: Sprite;
    position: Vector;
    constructor(sprite: Sprite, position: Vector){
        this.sprite = sprite;
        this.position = position;
    }

    translate(vector: Vector){
        this.position = this.position.add(vector);
    }

    globalToSpriteSpace(globalVector: Vector){
        return globalVector.sub(this.bottomLeft());
    }

    bottomLeft(){
        return this.position.round().sub(this.sprite.center);
    }
    topRight(){
        return this.bottomLeft().add(this.sprite.size.sub(Vector.ONE));
    }

    isCollidingWith(entity: Entity){
        for(let y = 0; y < entity.sprite.size.y; y++){
            for(let x = 0; x < entity.sprite.size.x; x++){
                let vector = new Vector(x, y);
                if(entity.sprite.get(vector) === " " && entity.sprite.config[SpriteConfig.TransparentWhitespace])
                    continue;
                if(entity.bottomLeft().add(vector).within(this.bottomLeft(), this.topRight())){
                    if(this.sprite.get(this.globalToSpriteSpace(entity.bottomLeft().add(vector))) === " " && entity.sprite.config[SpriteConfig.TransparentWhitespace])
                        continue;
                    return true;
                }
            }
        }
        return false;
    }

}