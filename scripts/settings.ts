interface SettingsValues {
    crt_opacity: number;
    debug_mode: boolean;
    control_scheme: number;
}

const EMPTY_VALUES: SettingsValues = {
    crt_opacity: 0.5,
    debug_mode: true,
    control_scheme: 0
};
class Settings {

    values: SettingsValues;
    controller: Controller;

    constructor(){
        this.values = EMPTY_VALUES;
        this.controller = new Controller();
        this.updateSettings();
    }
    
    /**
     * Registers events around settings and updating settings
     * @memberof Settings
     */
    registerEvents() {
        document.getElementById("debug-toggle-readout")!.onclick = this.updateDebugModeSetting.bind(this);
        document.getElementById("crt-range")!.oninput = this.updateCRTSetting.bind(this);
        document.getElementById("control-scheme-select")!.oninput = this.updateControlSchemeSetting.bind(this);
    }

    /**
     * Updates all of the settings
     * @memberof Settings
     */
    updateSettings(){
        this.updateCRTSetting();
        this.updateDebugModeSetting();
        this.updateControlSchemeSetting();
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

    updateControlSchemeSetting() {
        this.values.control_scheme = Number((document.querySelector('input[name="controls"]:checked') as HTMLInputElement)!.value);
        this.controller.registerControlEvents(this.values.control_scheme);
    }

}