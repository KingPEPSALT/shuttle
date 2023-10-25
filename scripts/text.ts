/**
 * A TextArea for containing and editting a grid of characters
 * @class TextArea
 */
class TextArea {

    size: Vector;
    buffer: string;

    /**
     * Creates an instance of TextArea.
     * @param {Vector} size
     * @param {string} [buffer=" ".repeat(size.x*size.y)]
     * @memberof TextArea
     */
    constructor(size: Vector, buffer: string = " ".repeat(size.x*size.y)){
        this.size = size;
        this.buffer = buffer || " ".repeat(size.x*size.y);
    }

    /**
     * Converts a Vector to an index to access the buffer
     * @param {Vector} position
     * @return {*}  {number}
     * @memberof TextArea
     */
    asIndex(position: Vector): number {
        return position.y*this.size.x + position.x;
    }

    /**
     * Converts an index for accessing the buffer into a Vector
     * @param {number} index 
     * @returns {*}  {Vector}
     * @memberof TextArea
     */
    asVector(index: number): Vector {
        return new Vector(index%this.size.x ,Math.floor(index/this.size.x));
    }

    /**
     * Gets a character from a position
     * @param {Vector} position 
     * @returns {*}  {string}
     * @memberof TextArea
     */
    get(position: Vector): string {
        if(!position.within(Vector.ZERO, this.size.sub(Vector.ONE)))
            return "";
        return this.buffer[this.asIndex(position)];
    }

    /**
     * Sets a character at a position
     * @param {Vector} position
     * @param {string} char
     * @return {*}  {string}
     * @memberof TextArea
     */
    set(position: Vector, char: string): string {
        if(!position.within(Vector.ZERO, this.size.sub(Vector.ONE)))
            return "";
        if(char.length === 0)
            return "";
        let out = this.get(position);
        this.buffer = this.buffer.substring(0, this.asIndex(position)) + char + this.buffer.substring(this.asIndex(position) + 1);
        return out;
    }

    /**
     * Places a string on the canvas over what was behind
     * @param {Vector} position
     * @param {string} str
     * @param {boolean} [transparent_whitespace=false] characters on the buffer behind the string's whitespace will remain if true
     * @param {boolean} [wrap=false] the string will wrap to the next line if true
     * @return {*}  {string}
     * @memberof TextArea
     */
    place(position: Vector, str: string, transparent_whitespace: boolean = false, wrap: boolean = false): string {
        if(str.length <= 1)
            return this.set(position, str);
        if(str.trim().length === 0)
            return "";
        if(!position.within(Vector.ZERO.sub(new Vector(str.length-1, 0)), this.size.sub(Vector.ONE)))
            return "";
        let index = this.asIndex(position);
        let out = this.buffer.substring(index, index + str.length);
        if(transparent_whitespace){
            let transparent_string = "";
            for(let i = 0; i < str.length; i++)
                transparent_string += str.charAt(i) === " " ?
                    this.buffer[index+i] : str.charAt(i);
            str = transparent_string;
        }
        if(position.x + str.length > this.size.x - 1 && !wrap)
            str = str.substring(0, this.size.x - position.x);
        if(position.x < 0)
            return this.place(new Vector(0, position.y), str.substring(-position.x));
        this.buffer = this.buffer.substring(0, index) + str + this.buffer.substring(index + str.length);
        return out;
    }

}

/**
 * A TextArea that can style individual characters
 * @class RichTextArea
 * @extends {TextArea}
 */
class RichTextArea extends TextArea {

    spans: Record<number, string[]>;

    /**
     * Creates an instance of RichTextArea.
     * @param {Vector} size
     * @param {string} [buffer=" ".repeat(size.x*size.y)]
     * @memberof RichTextArea
     */
    constructor(size: Vector, buffer: string = " ".repeat(size.x*size.y)){
        super(size, buffer);
        this.spans = {};
    }

    /**
     * Styles every position with classes
     * @param {string[]} classnames
     * @return {*}  {boolean}
     * @memberof RichTextArea
     */
    fill(classnames: string[]): boolean {
        for(let y = 0; y < this.size.y; y++)
            for(let x = 0; x < this.size.x; x++)
                if(!this.style(new Vector(x, y), classnames))
                    return false;
        return true;
    }

    /**
     * Styles a position with classes
     * @param {Vector} position
     * @param {string[]} classnames
     * @return {*}  {boolean}
     * @memberof RichTextArea
     */
    style(position: Vector, classnames: string[]): boolean {
        let index = this.asIndex(position);
        if(0 > index || index > this.size.x*this.size.y-1)
            return false; 
        if(this.spans[index] === undefined){
            this.spans[index] = classnames;
            return true;
        }
        this.spans[index] = [...new Set(this.spans[index].concat(classnames))];
        return true;        
    }


}

/**
 * A RichTextArea with a center point and configuration flags for rendering on a Canvas
 * @class Sprite
 * @extends {RichTextArea}
 */
class Sprite extends RichTextArea {

    center: Vector;
    transparent_whitespace: boolean;

    /**
     * Creates an instance of Sprite.
     * @param {Vector} size
     * @param {string} [buffer=" ".repeat(size.x*size.y)]
     * @param {Vector} [center=Vector.ZERO]
     * @param {boolean} [transparent_whitespace=true]
     * @memberof Sprite
     */
    constructor(size: Vector, buffer: string = " ".repeat(size.x*size.y), center: Vector = Vector.ZERO, transparent_whitespace = true){
        super(size, buffer);
        this.center = center;
        this.transparent_whitespace = transparent_whitespace;
    }

}

/**
 * A RichTextArea with a list of Sprites
 * @class Canvas
 * @extends {RichTextArea}
 */
class Canvas extends RichTextArea {

    sprites: {graphic: Sprite, pos: Vector}[];
    
    /**
     * Creates an instance of Canvas.
     * @param {Vector} size
     * @param {string} [buffer=" ".repeat(size.x*size.y)]
     * @param {{graphic: Sprite, pos: Vector}[]} [sprites=[]]
     * @memberof Canvas
     */
    constructor(size: Vector, buffer: string = " ".repeat(size.x*size.y), sprites: {graphic: Sprite, pos: Vector}[] = []) {
        super(size, buffer);
        this.sprites = sprites;
    }
    
    /**
     * Bakes the styling and sprites and returns the baked buffer
     * @return {*}  {string}
     * @memberof Canvas
     */
    bake(): string {
        
        let baked_spans = this.spans;
        
        for(let sprite of this.sprites){
            // transform sprite with sprice center
            let pos = sprite.pos.sub(sprite.graphic.center)

            // iterate over sprite rows and place them individually on the canvas
            for(let i = 0; i < sprite.graphic.size.y; i++){
                this.place(
                    pos.add(new Vector(0, i)), 
                    sprite.graphic.buffer.substring(sprite.graphic.size.x*i, sprite.graphic.size.x*(i+1)), 
                    sprite.graphic.transparent_whitespace
                    );
                }
                // add sprite styling to canvas styling ready for baking 
                for(const index of Object.keys(sprite.graphic.spans) as unknown as number[]){
                    let span_pos = this.asIndex(pos.add(sprite.graphic.asVector(index)))                    
                    if(baked_spans[span_pos] === undefined)
                    baked_spans[span_pos] = [];
                // avoid duplicates
                baked_spans[span_pos] = Array.from(new Set(baked_spans[span_pos].concat(sprite.graphic.spans[index])));
            }
            
        }

        let baked_buffer = this.buffer;

        // check if two string arrays are equal
        const areEqual = (a: string[], b: string[]) => b !== undefined && a !== undefined && a.length == b.length && a.every((element, index) => element === b[index]);
        
        // sort the baked_spans in reverse so we avoid interferring with the already baked section of the dictionary 
        for(const index of (Object.keys(baked_spans) as unknown as number[]).sort((a, b) => b - a)){
            // checks to allow us to coagulate runs of the same class-list together to form long spans rather than the span text per character
            if(!areEqual(baked_spans[Number(index)+1], baked_spans[index]))
                baked_buffer = baked_buffer.substring(0, Number(index)+1) + "</span>" + baked_buffer.substring(Number(index)+1);
            if(!areEqual(baked_spans[index-1], baked_spans[index]))
                baked_buffer = baked_buffer.substring(0, index) + `<span class="${baked_spans[index].join(" ")}">` + baked_buffer.substring(index);
        }

        return baked_buffer;
    }

}