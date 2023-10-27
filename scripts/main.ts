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
    static RIGHT = new Vector(1, 0);

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
let frames_this_interval = 0;
let last_interval = 0;

let canvas = Canvas.sized(WINDOW_SIZE);
let shuttle_sprite = new Sprite(
    Vector.ONE, 
    ">",
    Vector.ZERO,
    ["blue-glow"]
);

let shuttle = canvas.put(shuttle_sprite, new Vector(0, Math.floor((WINDOW_SIZE.y-1)/2)));

const asteroid_sprites = [
    new Sprite(Vector.ONE, "@", Vector.ZERO, ["red-glow"]),
    new Sprite(Vector.ONE.scale(3), "\\@/@@@/@\\", Vector.ONE, ["red-glow"])
];

const FIRE_DELAY = 400; //ms
let last_fire = 0;
let bullet_sprite = new Sprite(Vector.ONE, "-", Vector.ZERO, ["blue-glow"]);

let bullet_indices: number[] = [];


canvas.put(asteroid_sprites[1], new Vector(10, 3));

canvas.put(asteroid_sprites[0], new Vector(25, 6));
let debug = true;
let last_press = "";
document.addEventListener('keydown', (event: KeyboardEvent) => {

    if(debug)
        last_press = event.key;
    if(event.key.toLowerCase() === "w" || event.key === "ArrowUp")
        canvas.sprites[shuttle].pos = canvas.sprites[shuttle].pos.add(Vector.UP);
    if(event.key.toLowerCase() === "s" || event.key === "ArrowDown")
        canvas.sprites[shuttle].pos = canvas.sprites[shuttle].pos.add(Vector.DOWN);
    if(event.key.toLowerCase() === "d")
        debug = !debug;
    if(event.key.toLowerCase() == " "){
        let now = performance.now();
        if(now - last_fire < FIRE_DELAY)
            return;
        let pos = new Vector(1, canvas.sprites[shuttle].pos.y);
        bullet_indices.push(canvas.put(bullet_sprite, pos));
        last_fire = now;
    }
})

let playing = true;
let fps_last_interval = 0;
let interval = 1000;
const loop = () => {
    
    let now = performance.now();
    
    document.getElementById("debug-info")!.style.visibility = debug ? "visible" : "hidden"; 
    if(debug){
        document.getElementById("fps-counter")!.innerHTML = fps_last_interval.toString();
        document.getElementById("fps-counter")!.style.color = `hsl(${((fps_last_interval/90)*120).toString(10)},100%,50%)`;
        document.getElementById("frame-counter")!.innerHTML = frames_this_interval.toString();
        document.getElementById("key-press")!.innerHTML = `'${last_press}'${last_press === " " ? "[Space]" : ""}`;
    }
    
    
    document.getElementById("game-area")!.innerHTML = canvas.bake();
    
    if(!playing) return;
    frames_this_interval++;
    
    if(now - last_interval > interval){
        fps_last_interval = Math.floor(1000*frames_this_interval/interval);
        last_interval = now;
        frames_this_interval = 0;
    }

    for(let i = bullet_indices.length - 1; i >= 0; i--){
        let index = bullet_indices[i];
        canvas.sprites[index].pos = canvas.sprites[index].pos.add(Vector.RIGHT.scale(0.1));
        if(canvas.sprites[index].pos.x > WINDOW_SIZE.x-1){
            canvas.sprites.splice(index, 1);
            bullet_indices.splice(i, 1);
            for(let j = 0; j <= bullet_indices.length - 1; j++){
                if(bullet_indices[j] < index) continue;
                bullet_indices[j] = bullet_indices[j] - 1;
            }
        }
    }
    window.requestAnimationFrame(loop);

}

loop();