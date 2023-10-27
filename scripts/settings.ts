interface SettingsValues {
    crt_opacity: number;
    debug_mode: boolean;
}

const EMPTY_VALUES: SettingsValues = {
    crt_opacity: 0,
    debug_mode: false
};
class Settings {

    values: SettingsValues;

    constructor(){
        this.values = EMPTY_VALUES;
        this.updateCRTSetting();
    }
    
    registerEvents() {
        document.getElementById("debug-toggle-readout")!.onclick = this.updateDebugModeSetting.bind(this);
        document.getElementById("crt-range")!.oninput = this.updateCRTSetting.bind(this);
    }

    updateDebugModeSetting() {
        this.values.debug_mode = document.getElementById("debug-toggle-readout")!.innerHTML !== "ON";
        document.getElementById("debug-toggle-readout")!.innerHTML = this.values.debug_mode ? "ON" : "OFF";
        document.getElementById("debug-toggle-readout")!.style.color = this.values.debug_mode ? "green" : "red";
    }
    updateCRTSetting() {
        this.values.crt_opacity = Number((document.getElementById("crt-range")! as HTMLInputElement).value);
        document.getElementById("crt-readout")!.innerHTML = this.values.crt_opacity.toFixed(2);
        document.getElementById("crt-filter")!.style.opacity = this.values.crt_opacity.toString();
    }
    
}