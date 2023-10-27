class Game {

    canvas: Canvas;
    playing: boolean;
    settings: Settings;
    controller: Controller;

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
            elapsed: 0,
            dt: 0
        },
        last_press: ""
    };

    /**
     * Creates an instance of Game.
     * @param {Canvas} canvas
     * @memberof Game
     */
    constructor(canvas: Canvas, settings: Settings = new Settings(), controller: Controller = new Controller()) {
        this.canvas = canvas;
        this.playing = false;
        this.settings = settings;
        this.controller = controller;
    }

    /**
     * Initialises and starts the game
     * @memberof Game
     */
    launch() {
        this.initialiseController();
        this.registerEvents();
        this.canvas.put(this.shuttle);
        this.playing = true;
        this.loop();
    }

    /**
     * Initialises the controller with some hardcoded control schemes
     * @memberof Game
     */
    initialiseController() {
        const move_shuttle_func = (vector: Vector) => {
            return () => {
                if(!this.shuttle.position.add(vector).within(Vector.ZERO, this.canvas.text_area.size.sub(Vector.ONE)))
                    return;
                this.shuttle.translate(vector);
            }
        }
        const fire = () => {
            let bullet = this.shuttle.fire();
            if(!bullet) return;
            this.bullets.push(bullet);
            this.canvas.put(bullet);
        };
        this.settings.controller.registerControlScheme({
            "w" : move_shuttle_func(Vector.UP),
            "s" : move_shuttle_func(Vector.DOWN),
            "d" : this.settings.updateDebugModeSetting.bind(this.settings),
            " " : fire
        });
        this.settings.controller.registerControlScheme({
            "ArrowUp": move_shuttle_func(Vector.UP),
            "ArrowDown": move_shuttle_func(Vector.DOWN),
            "d" : this.settings.updateDebugModeSetting.bind(this.settings),
            " " : fire
        });
        this.settings.controller.registerControlScheme({
            "i": move_shuttle_func(Vector.UP),
            "k": move_shuttle_func(Vector.DOWN),
            "d" : this.settings.updateDebugModeSetting.bind(this.settings),
            " " : fire
        });
    }

    /**
     * Registers window and element events for the game
     * @memberof Game
     */
    registerEvents() {
        this.settings.registerEvents();
    }
    
    /**
     * Updates debug information pertaining to time and framerates
     * @memberof Game
     */
    updateFrametimeInfo(){

        let frametime = this.debug_info.frametime;
        frametime.elapsed = performance.now();
        frametime.frames_this_interval++;
        
        if(frametime.elapsed - frametime.last_interval > frametime.interval){
            frametime.fps_last_interval = Math.floor(1000*frametime.frames_this_interval/frametime.interval);
            frametime.last_interval = frametime.elapsed;
            frametime.frames_this_interval = 0;
        }
        this.debug_info.frametime = frametime;
    }

    /**
     * Renders debug information to elements
     * @memberof Game
     */
    renderDebugInfo() {
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

    /**
     * Main game loop
     * @return {*} 
     * @memberof Game
     */
    loop() {
        if(!this.playing) return;
        
        for(let i = this.bullets.length - 1; i >= 0; i--){
            let bullet = this.bullets[i];
            bullet.position = bullet.position.add(Vector.RIGHT.scale(5/this.debug_info.frametime.fps_last_interval));
            if(bullet.position.x > WINDOW_SIZE.x-1){
                this.canvas.entities.splice(this.canvas.entities.indexOf(bullet), 1);
                this.bullets.splice(i, 1);
            }
        }
        
        document.getElementById("game-area")!.innerHTML = canvas.bake();
        
        this.updateFrametimeInfo();
        this.renderDebugInfo()
        window.requestAnimationFrame(this.loop.bind(this));
    }

}