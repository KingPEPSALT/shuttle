class Asteroid extends Entity {

    hit_points: number;
    velocity: number; 

    constructor(sprite: Sprite, position: Vector, hit_points: number, velocity: number){
        super(sprite, position);
        this.hit_points = hit_points;
        this.velocity = velocity;
    }

}