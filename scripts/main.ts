function toggleSettingsDropdown(){
    let settings = document.getElementById("settings-dropdown")!;
    settings.style.visibility = settings.style.visibility === "visible" ? "hidden" : "visible";
}

const WINDOW_SIZE = new Vector(50, 11);
let canvas = Canvas.sized(WINDOW_SIZE);
let game = new Game(canvas);

game.launch();