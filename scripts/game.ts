class Game {

    canvas: Canvas;
    playing: boolean;
    settings: Settings;

    shuttle = new Shuttle(
        new Sprite(
            Vector.ONE, 
            ">",
            Vector.ZERO,
            ["blue-glow"]
        ), 
        new Vector(0, Math.floor((WINDOW_SIZE.y-1)/2))
    );

    bullets: Entity[] = [];
    
    debug_info = {
        frametime: {
            interval: 500, 
            fps_last_interval: 0, 
            frames_this_interval: 0,
            last_interval: 0,
            elapsed: 0
        },
        last_press: ""
    };

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


    launch() {
        this.registerEvents();
        this.canvas.put(this.shuttle);
        this.playing = true;
        this.loop();
    }

    registerEvents() {
        this.settings.registerEvents();

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if(this.settings.values.debug_mode)
                this.debug_info.last_press = event.key;
            if(event.key.toLowerCase() === "w" || event.key === "ArrowUp")
            this.shuttle.position = this.shuttle.position.add(Vector.UP);
            if(event.key.toLowerCase() === "s" || event.key === "ArrowDown")
                this.shuttle.position = this.shuttle.position.add(Vector.DOWN);
            if(event.key.toLowerCase() === "d")
                this.settings.updateDebugModeSetting();
            if(event.key.toLowerCase() == " "){
                let bullet = this.shuttle.fire();
                if(!bullet) return;
                this.bullets.push(bullet);
                this.canvas.put(bullet);
            }
        });
    }

    updateFrametimeInfo(){
        let frametime = this.debug_info.frametime;
        frametime.frames_this_interval++;
        
        if(frametime.elapsed - frametime.last_interval > frametime.interval){
            frametime.fps_last_interval = Math.floor(1000*frametime.frames_this_interval/frametime.interval);
            frametime.last_interval = frametime.elapsed;
            frametime.frames_this_interval = 0;
        }
        this.debug_info.frametime = frametime;
    }

    updateDebugInfo() {
        this.debug_info.frametime.elapsed = performance.now();
        document.getElementById("debug-info")!.style.visibility = this.settings.values.debug_mode ? "visible" : "hidden"; 
        
        if(this.settings.values.debug_mode){
            let frametime_info = this.debug_info.frametime;
            document.getElementById("fps-counter")!.innerHTML = 
                frametime_info.fps_last_interval.toString();
            document.getElementById("fps-counter")!.style.color = 
                `hsl(${((frametime_info.fps_last_interval/90)*120).toString(10)},100%,50%)`;
            document.getElementById("frame-counter")!.innerHTML = 
                frametime_info.frames_this_interval.toString();
            document.getElementById("key-press")!.innerHTML = 
                `'${this.debug_info.last_press}'${this.debug_info.last_press === " " ? "[Space]" : ""}`;
            document.getElementById("elapsed-time")!.innerHTML = 
                `${(this.debug_info.frametime.elapsed/1000).toFixed(3)} seconds`;
        }
    }

    loop() {
        if(!this.playing) return;
            
        this.updateDebugInfo()
        
        for(let i = this.bullets.length - 1; i >= 0; i--){
            let bullet = this.bullets[i];
            bullet.position = bullet.position.add(Vector.RIGHT.scale(0.1));
            if(bullet.position.x > WINDOW_SIZE.x-1){
                this.canvas.entities.splice(this.canvas.entities.indexOf(bullet), 1);
                this.bullets.splice(i, 1);
            }
        }

        document.getElementById("game-area")!.innerHTML = canvas.bake();
        
        this.updateFrametimeInfo();
        window.requestAnimationFrame(this.loop.bind(this));
    }

}