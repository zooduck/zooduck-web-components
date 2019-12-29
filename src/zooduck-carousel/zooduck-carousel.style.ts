interface Options {
    transitionSpeed: number;
}

export const style = (options: Options): string => {
    const { transitionSpeed: transitionSpeedInMillis } = options;
    return `
        :host {
            display: block;
            min-height: 100vh;
            overflow: hidden;
            touch-action: pan-y;
            cursor: pointer;
        }
        ::slotted([slot=slides]) {
            display: flex;
        }
        ::slotted([slot=slides]) {
            transition: all ${transitionSpeedInMillis}ms;
        }
        :host(.--touch-active) ::slotted([slot=slides]) {
            transition: none;
        }
        :host(.--no-animate) ::slotted([slot=slides]) {
            transition: none;
        }
    `;
};
