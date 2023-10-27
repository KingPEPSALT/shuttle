class Shuttle extends Entity {

    fire_delay: number;
    last_fire: number;

    constructor(sprite: Sprite, position: Vector){
        super(sprite, position);
        this.fire_delay = 400; //ms
        this.last_fire = 0;
    }
    
    fire(): Entity | undefined {
        let now = performance.now();
        if(now - this.last_fire < this.fire_delay)  
            return;
        this.last_fire = now;
        return new Entity(
            new Sprite(Vector.ONE, "-", Vector.ZERO, ["blue-glow"]),
            new Vector(1, this.position.y)
        );
    }

}