function toggleSettingsDropdown(){
    let settings = document.getElementById("settings-dropdown")!;
    settings.style.visibility = settings.style.visibility === "visible" ? "hidden" : "visible";
}

const WINDOW_SIZE = new Vector(50, 11);
let canvas = Canvas.sized(WINDOW_SIZE);
let game = new Game(canvas);

let shuttle_sprite = new Sprite(
    Vector.ONE, 
    ">",
    Vector.ZERO,
    ["blue-glow"]
);


const asteroid_sprites = [
    new Sprite(Vector.ONE, "@", Vector.ZERO, ["red-glow"]),
    new Sprite(Vector.ONE.scale(3), "\\@/@@@/@\\", Vector.ONE, ["red-glow"])
];




canvas.put(asteroid_sprites[1], new Vector(10, 3));
canvas.put(asteroid_sprites[0], new Vector(25, 6));

game.launch();