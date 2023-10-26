/**
 * 2-dimensional Vector
 * @class Vector
 */
class Vector {
    
    static ZERO = new Vector(0, 0);
    static ONE = new Vector(1, 1);
    static UP = new Vector(0, 1);
    static DOWN = new Vector(0, -1);
    static LEFT = new Vector(-1, 0);
    static right = new Vector(1, 0);

    x: number;
    y: number;

    /**
     * Creates an instance of Vector.
     * @param {number} x
     * @param {number} y
     * @memberof Vector
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds two vectors
     * @param {Vector} vector
     * @return {*}  {Vector}
     * @memberof Vector
     */
    add(vector: Vector): Vector {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    /**
     * Scales a vector by a multiple
     * @param {number} factor
     * @return {*}  {Vector}
     * @memberof Vector
     */
    scale(factor: number): Vector {
        return new Vector(this.x*factor, this.y*factor);
    }

    /**
     * Subtracts two vectors
     * @param {Vector} vector
     * @return {*}  {Vector}
     * @memberof Vector
     */
    sub(vector: Vector): Vector{
        return this.add(vector.scale(-1));
    }
    /**
     * Math.floor on the vector parameters
     * @return {*}  {Vector}
     * @memberof Vector
     */
    floor(): Vector{
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }

    /**
     * Math.ceil on the vector parameters
     * @return {*}  {Vector}
     * @memberof Vector
     */
    ceil(): Vector {
        return new Vector(Math.ceil(this.x), Math.ceil(this.y));
    }

    /**
     * Math.round on the vector parameters
     * @return {*}  {Vector}
     * @memberof Vector
     */
    round(): Vector{
        return new Vector(Math.round(this.x), Math.round(this.y));
    }

    /**
     * Checks if the vector is within the rectangle created by two vectors
     * @param {Vector} lower
     * @param {Vector} upper
     * @return {*}  {boolean}
     * @memberof Vector
     */
    within(lower: Vector, upper: Vector): boolean {
        return this.x >= lower.x && this.x <= upper.x && this.y >= lower.y && this.y <= upper.y;
    }
}

const WINDOW_SIZE = new Vector(50, 11);
const TARGET_FPS = 60;
let frames_this_interval = 0;
let last_interval = 0;

let canvas = Canvas.sized(WINDOW_SIZE);
let shuttle_sprite = new Sprite(
    Vector.ONE, 
    ">"
);

shuttle_sprite.fill(["blue-glow"]);
let shuttle = canvas.put(shuttle_sprite, new Vector(0, Math.floor((WINDOW_SIZE.y-1)/2)));

const asteroid_sprites = [
    new Sprite(Vector.ONE, "o"),
    new Sprite(Vector.ONE.scale(3), "/#\\###\\#/", Vector.ONE)
];

for(let sprite of asteroid_sprites)
    sprite.fill(["red-glow"]);

canvas.put(asteroid_sprites[0], new Vector(10, 3));

document.addEventListener('keydown', (event: KeyboardEvent) => {
    if(event.key.toLowerCase() == "w" || event.key == "ArrowUp")
        canvas.sprites[shuttle].pos = canvas.sprites[shuttle].pos.add(Vector.UP);
    if(event.key.toLowerCase() == "s" || event.key == "ArrowDown")
        canvas.sprites[shuttle].pos = canvas.sprites[shuttle].pos.add(Vector.DOWN);
})

let playing = true;
let fps_last_interval = TARGET_FPS;
let interval = 500;
const loop = () => {
    
    let now = performance.now();
    
    document.getElementById("target-fps")!.innerHTML = TARGET_FPS.toString();
    document.getElementById("fps-counter")!.innerHTML = fps_last_interval.toString();
    document.getElementById("fps-counter")!.style.color = `hsl(${((fps_last_interval/TARGET_FPS)*120).toString(10)},100%,50%)`;
    document.getElementById("interval-frames")!.innerHTML = frames_this_interval.toString();
    
    document.getElementById("game-area")!.innerHTML = canvas.bake();
    
    if(!playing) return;
    frames_this_interval++;
    
    if(now - last_interval > interval){
        fps_last_interval = Math.floor(1000*frames_this_interval/interval);
        last_interval = now;
        frames_this_interval = 0;
    }

    setTimeout(loop, 1000/TARGET_FPS - (performance.now() - now));

}

loop();