interface SettingsValues {
    crt_opacity: number;
    debug_mode: boolean;
}

const EMPTY_VALUES: SettingsValues = {
    crt_opacity: 0.5,
    debug_mode: true
};
class Settings {

    values: SettingsValues;

    constructor(){
        this.values = EMPTY_VALUES;
        this.updateSettings();
    }
    
    registerEvents() {
        document.getElementById("debug-toggle-readout")!.onclick = this.updateDebugModeSetting.bind(this);
        document.getElementById("crt-range")!.oninput = this.updateCRTSetting.bind(this);
    }

    updateSettings(){
        this.updateCRTSetting();
        this.updateDebugModeSetting();
    }

    updateCRTSetting() {
        this.values.crt_opacity = (document.getElementById("crt-range")! as HTMLInputElement).valueAsNumber;
        document.getElementById("crt-readout")!.innerHTML = this.values.crt_opacity.toFixed(2);
        document.getElementById("crt-filter")!.style.opacity = this.values.crt_opacity.toString();
    }

    updateDebugModeSetting() {
        this.values.debug_mode = !this.values.debug_mode;
        document.getElementById("debug-toggle-readout")!.innerHTML = this.values.debug_mode ? "ON" : "OFF";
        document.getElementById("debug-toggle-readout")!.style.color = this.values.debug_mode ? "green" : "red";
    }

}