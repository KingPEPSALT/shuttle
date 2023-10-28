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
    asteroid_atlas: Sprite[] = [
        new Sprite(Vector.ONE, "@", Vector.ZERO, ["red-glow"]),
        new Sprite(Vector.ONE.scale(3), "\\@/@@@/@\\", Vector.ONE, ["red-glow"])
    ];
    asteroids: Asteroid[] = [];
    next_asteroid_spawn: number = 0;
    score: number = 0;

    debug_info = {
        frametime: {
            interval: 500, 
            fps_last_interval: 60, 
            frames_this_interval: 0,
            last_interval: 0,
            elapsed: 0,
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
                if(!this.shuttle.position.add(vector).within(Vector.ZERO, this.canvas.text_area.size.sub(Vector.ONE )))
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

        const setLastPress = (event: KeyboardEvent) => {
            this.debug_info.last_press = event.key;
        } 
        this.settings.controller.registerControlScheme({
            "always": setLastPress,
            "w" : move_shuttle_func(Vector.UP),
            "s" : move_shuttle_func(Vector.DOWN),
            "d" : this.settings.updateDebugModeSetting.bind(this.settings),
            " " : fire
        });
        this.settings.controller.registerControlScheme({
            "always": setLastPress,
            "ArrowUp": move_shuttle_func(Vector.UP),
            "ArrowDown": move_shuttle_func(Vector.DOWN),
            "d" : this.settings.updateDebugModeSetting.bind(this.settings),
            " " : fire
        });
        this.settings.controller.registerControlScheme({
            "always": setLastPress,
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

    spawnAsteroid() {
        
        let asteroid_type = Math.random() > 0.7 ? 1 : 0;
        let asteroid = new Asteroid(this.asteroid_atlas[asteroid_type], 
            new Vector(this.canvas.text_area.size.x-1, Math.round(Math.random()*this.canvas.text_area.size.y-1)),
            asteroid_type*2+1,
            Number(!asteroid_type)*5+3
        );
        this.asteroids.push(asteroid);
        this.canvas.put(asteroid);
    }
    /**
     * Main game loop
     * @return {*} 
     * @memberof Game
     */
    loop() {
        if(!this.playing) return;
        if(performance.now() > this.next_asteroid_spawn){
            this.spawnAsteroid();
            this.next_asteroid_spawn = performance.now() + 1000*(Math.random() + 0.5);
        }
        for(let i = this.bullets.length - 1; i >= 0; i--){
            let bullet = this.bullets[i];
            bullet.position = bullet.position.add(Vector.RIGHT.scale(40/this.debug_info.frametime.fps_last_interval));
            for(let asteroid of this.asteroids)
                if(bullet.isCollidingWith(asteroid)){
                    asteroid.hit_points--;
                    this.canvas.entities.splice(this.canvas.entities.indexOf(bullet), 1);
                    this.bullets.splice(i, 1);
                    continue;
                }
            if(bullet.position.x > WINDOW_SIZE.x-1){
                this.canvas.entities.splice(this.canvas.entities.indexOf(bullet), 1);
                this.bullets.splice(i, 1);  
            }
        }
        for(let i = this.asteroids.length - 1; i >= 0; i--){
            let asteroid = this.asteroids[i];
            asteroid.position = asteroid.position.add(Vector.LEFT.scale(asteroid.velocity/this.debug_info.frametime.fps_last_interval));
            if(asteroid.position.x < 0 || asteroid.hit_points <= 0){
                this.canvas.entities.splice(this.canvas.entities.indexOf(asteroid), 1);
                this.asteroids.splice(i, 1);
                if(asteroid.hit_points <= 0)
                    this.score += asteroid.sprite.size.y;
            }
            if(asteroid.isCollidingWith(this.shuttle))
                this.gameOver();
            
        }

        document.getElementById("score")!.innerHTML = this.score.toString();
        document.getElementById("main-canvas")!.innerHTML = canvas.bake();
        
        this.updateFrametimeInfo();
        this.renderDebugInfo()
        window.requestAnimationFrame(this.loop.bind(this));
    }

    gameOver() {
        this.playing = false;
        this.canvas.clear();
        this.canvas.putSprite(
            new Sprite(new Vector(9, 1), "Game Over", new Vector(4, 0), ["red-glow"]), 
            this.canvas.text_area.size.sub(Vector.ONE).scale(0.5).add(Vector.UP)
        );
        this.canvas.putSprite(
            new Sprite(new Vector(this.score.toString().length+7, 1), `Score: ${this.score}`, new Vector((this.score.toString().length+6)/2, 0), ["blue-glow"]),
            this.canvas.text_area.size.sub(Vector.ONE).scale(0.5).add(Vector.DOWN)
        );
        document.getElementById("score-readout")!.style.visibility = "hidden";  
    }
}