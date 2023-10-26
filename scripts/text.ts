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
        return (this.size.y - 1 - position.y)*this.size.x + position.x;
    }

    /**
     * Converts an index for accessing the buffer into a Vector
     * @param {number} index 
     * @returns {*}  {Vector}
     * @memberof TextArea
     */
    asVector(index: number): Vector {
        return new Vector(index%this.size.x, this.size.y - 1 - Math.floor(index/this.size.x));
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
        this.buffer = this.buffer.substring(0, this.asIndex(position)) + char + this.buffer.substring(this.asIndex(position)+1);
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

enum SpriteConfig {
    TransparentWhitespace = 0,
    TransparentStyling = 1
}
/**
 * A RichTextArea with a center point and configuration flags for rendering on a Canvas
 * @class Sprite
 * @extends {RichTextArea}
 */
class Sprite extends RichTextArea {

    center: Vector;
    config: boolean[];

    /**
     * Creates an instance of Sprite.
     * @param {Vector} size
     * @param {string} [buffer=" ".repeat(size.x*size.y)]
     * @param {Vector} [center=Vector.ZERO]
     * @param {boolean[]} [config=[true, false]]
     * @memberof Sprite
     */
    constructor(
        size: Vector, 
        buffer: string = " ".repeat(size.x*size.y), 
        center: Vector = Vector.ZERO, 
        config: boolean[] = [true, false]
    ){
        super(size, buffer);
        this.center = center;
        this.config = config;
    }

}
function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object")
      return obj
    let props = Object.getOwnPropertyDescriptors(obj)
    for (let prop in props) {
      props[prop].value = deepClone(props[prop].value)
    }
    return Object.create(
      Object.getPrototypeOf(obj), 
      props
    )
  }
/**
 * A RichTextArea with a list of Sprites
 * @class Canvas
 */
class Canvas {

    sprites: {graphic: Sprite, pos: Vector}[];
    text_area: RichTextArea;
    /**
     * Creates an instance of Canvas.
     * @param {Vector} size
     * @param {RichTextArea} [buffer=new RichTextArea(size)]
     * @param {{graphic: Sprite, pos: Vector}[]} [sprites=[]]
     * @memberof Canvas
     */
    constructor(text_area: RichTextArea, sprites: {graphic: Sprite, pos: Vector}[] = []) {
        this.text_area = text_area;
        this.sprites = sprites;
    }
    
    static sized(size: Vector){
        return new Canvas(new RichTextArea(size));
    }
    /**
     * Puts a sprite at (pos.x, pos.y) on the Canvas
     * @param {Sprite} sprite
     * @param {Vector} pos
     * @memberof Canvas
     */
    put(sprite: Sprite, pos: Vector): number {
        this.sprites.push({graphic: sprite, pos: pos});
        return this.sprites.length - 1;
    }
    /**
     * Bakes the styling and sprites and returns the baked buffer
     * @return {*}  {string}
     * @memberof Canvas
     */
    bake(): string {
        
        let baked_text_area = deepClone(this.text_area);    
        
        for(let sprite of Object.values(this.sprites)){
            // transform sprite with sprice center
            let pos = sprite.pos.sub(sprite.graphic.center)

            // iterate over sprite rows and place them individually on the canvas
            for(let i = 0; i < sprite.graphic.size.y; i++){
                baked_text_area.place(
                    pos.add(new Vector(0, i)), 
                    sprite.graphic.buffer.substring(sprite.graphic.size.x*i, sprite.graphic.size.x*(i+1)), 
                    sprite.graphic.config[SpriteConfig.TransparentWhitespace]
                );
            }
            // add sprite styling to canvas styling ready for baking 
            for(const index of Object.keys(sprite.graphic.spans) as unknown as number[]){
                if(sprite.graphic.buffer[index] === " " && sprite.graphic.config[SpriteConfig.TransparentWhitespace])
                    continue;
                let span_pos = this.text_area.asIndex(pos.add(sprite.graphic.asVector(index)))
                if(!sprite.graphic.config[SpriteConfig.TransparentStyling]){
                    baked_text_area.spans[span_pos] = sprite.graphic.spans[index];
                    continue;
                }
                if(baked_text_area.spans[span_pos] === undefined)
                    baked_text_area.spans[span_pos] = [];
                // avoid duplicate classnames
                baked_text_area.spans[span_pos] = Array.from(new Set(baked_text_area.spans[span_pos].concat(sprite.graphic.spans[index])));
            }
            
        }


        // check if two string arrays are equal
        const areEqual = (a: string[], b: string[]) => b !== undefined && a !== undefined && a.length == b.length && a.every((element, index) => element === b[index]);
        const insertString = (a: string, b: string, i: number) => a.substring(0, i) + b + a.substring(i);

        // sort the baked_spans in reverse so we avoid interferring with the already baked section of the dictionary 
        for(const index of (Object.keys(baked_text_area.spans) as unknown as number[]).sort((a, b) => b - a)){
            // checks to allow us to coagulate runs of the same class-list together to form long spans rather than the span text per character
            if(!areEqual(baked_text_area.spans[Number(index)+1], baked_text_area.spans[index]))
                baked_text_area.buffer = insertString(baked_text_area.buffer, "</span>", Number(index)+1);
            if(!areEqual(baked_text_area.spans[index-1], baked_text_area.spans[index]))
                baked_text_area.buffer = insertString(baked_text_area.buffer, `<span class="${baked_text_area.spans[index].join(" ")}">`, index);
        }
        return baked_text_area.buffer;
    }

}