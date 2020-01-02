import { style } from './zooduck-terminal.style';

const tagName = 'zooduck-terminal';

type LineMode = 'single'|'multi';
type ScreenType = 'retro'|'modern';

class HTMLZooduckTerminal extends HTMLElement {
    private _content: HTMLElement;
    private _cursorBlinkSpeed: string;
    private _delay: string;
    private _domParser: DOMParser;
    private _fullStopInterval: string;
    private _hasLoaded: boolean;
    private _message: string;
    private _lineMode: LineMode;
    private _onLoadEvent: CustomEvent;
    private _screen: ScreenType;
    private _styleEl: HTMLStyleElement;
    private _typingSpeed: string;
    private _wordBreakInterval: string;

    constructor() {
        super();

        this._cursorBlinkSpeed = '1000';
        this._delay = '2000';
        this._domParser = new DOMParser();
        this._fullStopInterval = '1000';
        this._lineMode = 'multi';
        this._screen = 'modern';
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
            'linemode',
            'message',
            'screen',
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

    public set linemode(val: LineMode) {
        this._lineMode = val;
        this._syncAttr('linemode', val);
        this._update();
    }

    public get linemode(): LineMode {
        return this._lineMode;
    }

    public set message(val: string) {
        this._message = val;
        this._syncAttr('message', val);
        this._update();
    }

    public get message(): string {
        return this._message;
    }

    public set screen(val: ScreenType) {
        this._screen = val;
        this._syncAttr('screen', val);
        this._update();
    }

    public get screen(): ScreenType {
        return this._screen;
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

    private _getLines(words: string[]) {
        const lines = [];
        let lineIndex = 0;

        if (this._lineMode === 'multi') {
            return [words];
        }

        words.forEach((word) => {
            if (!lines[lineIndex]) {
                lines.push([]);
            }
            lines[lineIndex].push(word);

            if (this._wordEndsInFullStop(word)) {
                lineIndex += 1;
            }
        });

        return lines;
    }

    private _buildLine(words: HTMLElement[]): HTMLElement {
        const line = this._domParser.parseFromString(`
            <section class="line"></section>
        `, 'text/html').body.firstChild as HTMLElement;

        words.forEach((word) => {
            line.appendChild(word);
        });

        return line;
    }

    private _buildLines(): HTMLElement[] {
        let totalDelayInMillis = this._parseMillis(this._delay);
        const wordBreakIntervalInMillis = this._parseMillis(this._wordBreakInterval);
        const fullStopIntervalInMillis = this._parseMillis(this._fullStopInterval);
        const words = this._message.split(' ');
        const lineDelays = [];
        const lines = this._getLines(words);
        const lineEls = lines.map((line: string[], linesArrIndex: number, linesArr: string[]): HTMLElement => {
            const words = line.map((word: string, wordsArrIndex: number, wordsArr: string[]) => {
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

                const isLastWord = wordsArrIndex === (wordsArr.length - 1);

                if (!isLastWord) {
                    const animationDelayInMillis = this._parseMillis(this._typingSpeed) + wordBreakIntervalInMillis + totalDelayInMillis;
                    const spaceChar = this._buildCharacter('&nbsp;', animationDelayInMillis);

                    totalDelayInMillis = animationDelayInMillis;

                    characterEls.push(spaceChar);
                }

                return this._buildWord(characterEls);
            });

            const isLastLine = linesArrIndex === (linesArr.length - 1);

            words.push(this._buildCursor());

            const section = this._buildLine(words);

            if (this._lineMode === 'single') {
                const animateDelayModifier = isLastLine
                    ? '--animate-delay-visible-last-line'
                    :  '--animate-delay-visible-line';
                section.classList.add(animateDelayModifier);
            }

            lineDelays.push(totalDelayInMillis);

            return section;
        });

        lineDelays.forEach((lineDelay: number, i: number, lineDelays: number[]) => {
            const currentLinesDelay = lineDelay;
            const previousLinesDelay = lineDelays[i - 1];
            const isFirstLine = (i === 0);

            if (isFirstLine) {
                const animationDuration = lineDelays[i];
                lineEls[i].style.animationDuration = `${animationDuration}ms`;

                return;
            }

            const animationDelay = previousLinesDelay;
            const animationDuration = currentLinesDelay - animationDelay;
            lineEls[i].style.animationDelay =  `${animationDelay}ms`;
            lineEls[i].style.animationDuration = `${animationDuration}ms`;
        });

        return lineEls;
    }

    private _parseMillis(stringNumber: string): number {
        return parseInt(stringNumber, 10) || 0;
    }

    private _render() {
        this._updateStyle();

        const lines = this._buildLines();

        const linesEl = this._domParser.parseFromString(`
            <div class="lines"></div>
        `, 'text/html').body.firstChild as HTMLElement;

        if (this._lineMode === 'single') {
            const linePlaceholder = this._domParser.parseFromString(`
                <div class="line-placeholder">X</div>
            `, 'text/html').body.firstChild;
            linesEl.appendChild(linePlaceholder);
        }

        lines.forEach((line) => {
            linesEl.appendChild(line);
        });

        if (!this._hasLoaded) {
            this.shadowRoot.appendChild(linesEl);
        } else {
            this.shadowRoot.replaceChild(linesEl, this._content);
        }

        this._content = linesEl;
    }

    private _syncAttr(name: string, val: any) {
        this.setAttribute(name, val);
    }

    private _updateStyle() {
        this._styleEl.innerHTML = style({
            blinkDuration: this._parseMillis(this._cursorBlinkSpeed),
            screenType: this._screen,
        });
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
        if (newVal === null || this[name] === newVal) {
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

customElements.define(tagName, HTMLZooduckTerminal);
