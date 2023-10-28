type ControlScheme = Record<string, ((event: KeyboardEvent) => void) | (() => void)>;

/**
 * Handles different control schemes
 * @class Controller
 */
class Controller {

    schemes: ControlScheme[];

    constructor(schemes: ControlScheme[] | ControlScheme = []){
        if(Array.isArray(schemes)){
            this.schemes = schemes;
            return;
        }
        this.schemes = [schemes];
    }
    
    /**
     *
     * Registers a control scheme to the control scheme array
     * @param {ControlScheme} scheme
     * @param {number} [index=-1]
     * @return {*}  {void}
     * @memberof Controller
     */
    registerControlScheme(scheme: ControlScheme, index: number = -1): void{
        if(index === -1){
            this.schemes.push(scheme);
            return;
        }
        for(const [key, value] of Object.entries(scheme)){
            if(this.schemes[index][key] === undefined){
                this.schemes[index][key] = value;
                continue;
            }
            this.schemes[index][key] = (event: KeyboardEvent) => {this.schemes[index][key](event); value(event)};
        } 
    }
    
    /**
     * Sets the keydown listener event to the selected control scheme
     * @param {number} [index=0]
     * @memberof Controller
     */
    registerControlEvents(index: number = 0): void {
        window.onkeydown = (event: KeyboardEvent) => {
            this.schemes[index]["always"](event);
            if(this.schemes[index][event.key] === undefined)
                return;
            this.schemes[index][event.key](event);
        };
    }
    
}

