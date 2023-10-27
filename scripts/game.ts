class Game {

    canvas: Canvas;
    playing: boolean;
    settings: Settings;

    FIRE_DELAY = 400; //ms
    last_fire = 0;
    bullet_sprite = new Sprite(Vector.ONE, "-", Vector.ZERO, ["blue-glow"]);
    shuttle_sprite = new Sprite(
        Vector.ONE, 
        ">",
        Vector.ZERO,
        ["blue-glow"]
    );
    
    shuttle = canvas.put(this.shuttle_sprite, new Vector(0, Math.floor((WINDOW_SIZE.y-1)/2)));
    bullet_indices: number[] = [];
    /**
     * Creates an instance of Game.
     * @param {Canvas} canvas
     * @memberof Game
     */
    constructor(canvas: Canvas, settings: Settings = new Settings()) {
        this.canvas = canvas;
        this.playing = false;
        this.settings = settings;
    }
    debug_info = {
        frametime: {
            interval: 500, 
            fps_last_interval: 0, 
            frames_this_interval: 0,
            last_interval: 0
        },
        elapsed_time: 0,
        last_press: ""
    };

    launch() {
        this.registerEvents();
        this.playing = true;
        this.loop();
    }

    registerEvents() {

        this.settings.registerEvents();

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if(this.settings.values.debug_mode)
                this.debug_info.last_press = event.key;
            if(event.key.toLowerCase() === "w" || event.key === "ArrowUp")
                this.canvas.sprites[this.shuttle].pos = this.canvas.sprites[this.shuttle].pos.add(Vector.UP);
            if(event.key.toLowerCase() === "s" || event.key === "ArrowDown")
                this.canvas.sprites[this.shuttle].pos = this.canvas.sprites[this.shuttle].pos.add(Vector.DOWN);
            if(event.key.toLowerCase() === "d")
                this.settings.updateDebugModeSetting();
            if(event.key.toLowerCase() == " "){
                let now = performance.now();
                if(now - this.last_fire < this.FIRE_DELAY)  
                    return;
                let pos = new Vector(1, this.canvas.sprites[this.shuttle].pos.y);
                this.bullet_indices.push(this.canvas.put(this.bullet_sprite, pos));
                this.last_fire = now;
            }
        });
    }


    loop() {
            
        let now = performance.now();
        
        this.debug_info.elapsed_time = performance.now();
        document.getElementById("debug-info")!.style.visibility = this.settings.values.debug_mode ? "visible" : "hidden"; 
        
        let frametime_info = this.debug_info.frametime;
        if(this.settings.values.debug_mode){
            document.getElementById("fps-counter")!.innerHTML = frametime_info.fps_last_interval.toString();
            document.getElementById("fps-counter")!.style.color = `hsl(${((frametime_info.fps_last_interval/90)*120).toString(10)},100%,50%)`;
            document.getElementById("frame-counter")!.innerHTML = frametime_info.frames_this_interval.toString();
            document.getElementById("key-press")!.innerHTML = `'${this.debug_info.last_press}'${this.debug_info.last_press === " " ? "[Space]" : ""}`;
            document.getElementById("elapsed-time")!.innerHTML = `${(this.debug_info.elapsed_time/1000).toFixed(3)} seconds`;
        }
        
        document.getElementById("game-area")!.innerHTML = canvas.bake();
        
        if(!this.playing) return;
        this.debug_info.frametime.frames_this_interval++;
        
        if(now - frametime_info.last_interval > frametime_info.interval){
            frametime_info.fps_last_interval = Math.floor(1000*frametime_info.frames_this_interval/frametime_info.interval);
            frametime_info.last_interval = now;
            frametime_info.frames_this_interval = 0;
        }

        this.debug_info.frametime = frametime_info;

        for(let i = this.bullet_indices.length - 1; i >= 0; i--){
            let index = this.bullet_indices[i];
            this.canvas.sprites[index].pos = this.canvas.sprites[index].pos.add(Vector.RIGHT.scale(0.1));
            if(this.canvas.sprites[index].pos.x > WINDOW_SIZE.x-1){
                this.canvas.sprites.splice(index, 1);
                this.bullet_indices.splice(i, 1);
                for(let j = 0; j <= this.bullet_indices.length - 1; j++){
                    if(this.bullet_indices[j] < index) continue;
                    this.bullet_indices[j] = this.bullet_indices[j] - 1;
                }
            }
        }
        window.requestAnimationFrame(this.loop.bind(this));
    }
}