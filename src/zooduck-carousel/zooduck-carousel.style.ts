interface Options {
    transitionSpeed: number;
}

export const style = (options: Options): string => {
    const { transitionSpeed: transitionSpeedInMillis } = options;
    return `
        :host {
            position: relative;
            display: block;
            visibility: hidden;
            overflow: hidden;
            touch-action: pan-y;
            cursor: pointer;
            user-select: none;
            transition: height ${transitionSpeedInMillis}ms;
        }
        :host(.--ready) {
            visibility: visible;
        }
        ::slotted([slot=slides]) {
            display: flex;
            align-items: flex-start;
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
