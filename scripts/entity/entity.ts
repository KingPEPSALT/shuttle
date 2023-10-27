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

}