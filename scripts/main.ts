/**
 * 2-dimensional Vector
 * @class Vector
 */
class Vector {
    
    static ZERO = new Vector(0, 0);
    static ONE = new Vector(1, 1);

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

let main = new Canvas(WINDOW_SIZE);
let sprite = new Sprite(
    Vector.ONE.scale(3), 
    " | "+
    "-+-"+
    " | ",
    Vector.ONE    
);
sprite.fill(["red-glow"]);
main.sprites = main.sprites.concat([{graphic: sprite, pos: Vector.ONE}]);


main.style(Vector.ZERO, ["red-glow"]); 
main.place(Vector.ZERO.sub(new Vector(1, 0)), "-1");
main.place(new Vector(WINDOW_SIZE.x-1, 0), "2-");
main.place(new Vector(-1, WINDOW_SIZE.y-1), "-3");
main.place(WINDOW_SIZE.sub(Vector.ONE), "4");

document.getElementById("game-area")!.innerHTML = main.bake();