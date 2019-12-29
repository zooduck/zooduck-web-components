import { style } from './zooduck-terminal.style';

const tagName = 'zooduck-terminal';

class HTMLZooduckTerminalMessageEmulator extends HTMLElement {
    private _content: HTMLElement;
    private _cursorBlinkSpeed: string;
    private _delay: string;
    private _domParser: DOMParser;
    private _fullStopInterval: string;
    private _hasLoaded: boolean;
    private _message: string;
    private _onLoadEvent: CustomEvent;
    private _styleEl: HTMLStyleElement;
    private _typingSpeed: string;
    private _wordBreakInterval: string;

    constructor() {
        super();

        this._cursorBlinkSpeed = '1000';
        this._delay = '2500';
        this._domParser = new DOMParser();
        this._fullStopInterval = '1000';
        this._typingSpeed = '50';
        this._wordBreakInterval = '0';

        this.attachShadow({ mode: 'open' });

        this._styleEl = document.createElement('style');
        this.shadowRoot.appendChild(this._styleEl);

        this._message = `
            Building software for Internet Explorer is like building a jet engine for a pram.
            It's entirely possible, but completely ridiculous.
        `.trim().replace(/\s\s/g, '');

        this._onLoadEvent = new CustomEvent('load');
    }

    protected static get observedAttributes() {
        return [
            'cursorblinkspeed',
            'delay',
            'fullstopinterval',
            'message',
            'typingspeed',
            'wordbreakinterval',
        ];
    }

    public set cursorblinkspeed(val: string) {
        this._cursorBlinkSpeed = val;
        this._syncAttr('cursorblinkspeed', val);
        this._update();
    }

    public get cursorblinkspeed(): string {
        return this._cursorBlinkSpeed;
    }

    public set delay(val: string) {
        this._delay = val;
        this._syncAttr('delay', val);
        this._update();
    }

    public get delay(): string {
        return this._delay;
    }

    public set fullstopinterval(val: string) {
        this._fullStopInterval = val;
        this._syncAttr('fullstopinterval', val);
        this._update();
    }

    public get fullstopinterval(): string {
        return this._fullStopInterval;
    }

    public set message(val: string) {
        this._message = val;
        this._syncAttr('message', val);
        this._update();
    }

    public get message(): string {
        return this._message;
    }

    public set typingspeed(val: string) {
        this._typingSpeed = val;
        this._syncAttr('typingspeed', val);
        this._update();
    }

    public get typingspeed(): string {
        return this._typingSpeed;
    }

    public set wordbreakinterval(val: string) {
        this._wordBreakInterval = val;
        this._syncAttr('wordbreakinterval', val);
        this._update();
    }

    public get wordbreakinterval(): string {
        return this._wordBreakInterval;
    }

    private _buildCharacter(char: string, animationDelayInMillis = 0) {
        const style = `animation-delay: ${animationDelayInMillis}ms`;
        const className = 'char --animate-delay-visible';

        const el = this._domParser.parseFromString(`
            <div
                class="${className}"
                style="${style}">
                <span>${char}</span>
            </div>
        `, 'text/html').body.firstChild as HTMLElement;

        return el;
    }

    private _buildCursor() {
        return this._domParser.parseFromString(`
            <div class="cursor --animate-blink"></div>
        `, 'text/html').body.firstChild as HTMLElement;
    }

    private _buildWord(charEls: HTMLElement[]): HTMLElement {
        const wordEl = this._domParser.parseFromString(`
            <div class="word"></div>
        `, 'text/html').body.firstChild as HTMLElement;

        charEls.forEach((el) => {
            wordEl.appendChild(el);
        });

        return wordEl;
    }

    private _buildWords(): HTMLElement[] {
        let totalDelayInMillis = this._parseMillis(this._delay);
        const wordBreakIntervalInMillis = this._parseMillis(this._wordBreakInterval);
        const fullStopIntervalInMillis = this._parseMillis(this._fullStopInterval);
        const words = this._message.split(' ').map((word: string, wordsArrIndex: number, wordsArr: string[]) => {
            const characterEls = word.split('').map((character: string) => {
                const char = character;
                const animationDelayInMillis = this._parseMillis(this._typingSpeed) + totalDelayInMillis;

                totalDelayInMillis = animationDelayInMillis;

                return this._buildCharacter(char, animationDelayInMillis);
            });

            const currentWord = wordsArr[wordsArrIndex];

            if (this._wordEndsInFullStop(currentWord)) {
                totalDelayInMillis += fullStopIntervalInMillis;
            }

            const animationDelayInMillis = totalDelayInMillis + wordBreakIntervalInMillis;
            const spaceChar = this._buildCharacter('&nbsp;', animationDelayInMillis);

            totalDelayInMillis = animationDelayInMillis;

            characterEls.push(spaceChar);

            return this._buildWord(characterEls);
        });

        words.push(this._buildCursor());

        return words;
    }

    private _parseMillis(stringNumber: string): number {
        return parseInt(stringNumber, 10) || 0;
    }

    private _render() {
        this._updateStyle();

        const lineEl = this._domParser.parseFromString(`
            <section class="line">${this._buildWords().map((el: HTMLElement) => {
            return el.outerHTML;
        }).join('')}</section>
        `, 'text/html').body.firstChild as HTMLElement;

        if (!this._hasLoaded) {
            this.shadowRoot.appendChild(lineEl);
        } else {
            this.shadowRoot.replaceChild(lineEl, this._content);
        }

        this._content = lineEl;
    }

    private _syncAttr(name: string, val: string) {
        this.setAttribute(name, val);
    }

    private _updateStyle() {
        this._styleEl.innerText = style({ blinkDuration: this._parseMillis(this._cursorBlinkSpeed) });
    }

    private _update() {
        if (!this._hasLoaded) {
            return;
        }

        this._render();
    }

    private _wordEndsInFullStop(word: string) {
        return /.+[!?.]/.test(word);
    }

    protected attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
        if (this[name] === newVal) {
            return;
        }

        this[name] = newVal;
    }

    protected connectedCallback() {
        if (!this.isConnected) {
            return;
        }

        this._render();

        this.dispatchEvent(this._onLoadEvent);

        this._hasLoaded = true;
    }
}

customElements.define(tagName, HTMLZooduckTerminalMessageEmulator);
