const tagName = 'zooduck-jelly-squares';

export class ZooduckJellySquares extends HTMLElement {
    private _MIN_ANIMATION_DELAY_IN_SECONDS = 0;
    private _MAX_ANIMATION_DELAY_IN_SECONDS = 5;
    private _MIN_ANIMATION_DURATION_IN_SECONDS = .5;
    private _MAX_ANIMATION_DURATION_IN_SECONDS = 5;
    private _COLOR = 'limegreen';
    private _DENSITY = 8;
    private _WIDTH = '100%';
    private _HEIGHT = '200px';

    private _color: string;
    private _density: number;
    private _height: string;
    private _width: string;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        this.shadowRoot.appendChild(style);

        this._color = this._COLOR;
        this._density = this._DENSITY;
        this._height = this._HEIGHT;
        this._width = this._WIDTH;
    }

    static get observedAttributes(): string[] {
        return [
            'color',
            'density',
            'height',
            'width',
        ];
    }

    public set color(color: string) {
        this._color = color;
        this._syncAttr('color');
    }

    public get color(): string {
        return this._color;
    }

    public set density(density: number) {
        this._density = parseInt(density.toString(), 10);
        this._syncAttr('density');
    }

    public get density(): number {
        return this._density;
    }

    public set height(style: string) {
        this._height = style.toString();
        this._syncAttr('height');
    }

    public get height(): string {
        return this._height;
    }

    public set width(style: string) {
        this._width = style.toString();
        this._syncAttr('width');
    }

    public get width(): string {
        return this._width;
    }

    private _buildSquares(): void {
        const { width, height } = this.getBoundingClientRect();
        const SQUARE_SIZE = width / this._density;
        const ROWS = Math.ceil(height / SQUARE_SIZE);
        const TOTAL_SQUARES = ROWS * this._density;

        const squares = Array.from({ length: TOTAL_SQUARES }).map(() => {
            const square = document.createElement('div');

            square.className = 'zooduck-jelly-square --animation-square-push';
            square.style.animationDelay = `${this._getAnimationDelay()}s`;
            square.style.animationDuration = `${this._getAnimationDuration()}s`;

            return square;
        });

        if (!squares.length) {
            return;
        }

        this._clearContent();

        squares.forEach((square) => {
            this.shadowRoot.appendChild(square);
        });
    }

    private _clearContent(): void {
        Array.from(this.shadowRoot.childNodes).forEach((node) => {
            if (node.nodeName !== 'STYLE') {
                node.parentNode.removeChild(node);
            }
        });
    }

    private _getAnimationDelay() {
        return Math.round((Math.random() * this._MAX_ANIMATION_DELAY_IN_SECONDS) + this._MIN_ANIMATION_DELAY_IN_SECONDS);
    }

    private _getAnimationDuration() {
        return Math.round((Math.random() * this._MAX_ANIMATION_DURATION_IN_SECONDS) + this._MIN_ANIMATION_DURATION_IN_SECONDS);
    }

    private _registerEvents() {
        window.addEventListener('resize', this._render.bind(this));
    }

    private _render(): void {
        this._updateStyle();
        this._buildSquares();
        this._setSquareHeights();
    }

    private _setSquareHeights(): void {
        this.shadowRoot.querySelector('style').innerHTML += `
            .zooduck-jelly-square {
                height: calc(${this.getBoundingClientRect().width} / var(--cols));
            }
        `;
    }

    private _updateStyle(): void {
        const style = `
            :host {
                --cols: ${this._density};

                position: relative;
                display: grid;
                grid-template-columns: repeat(var(--cols), 1fr);
                width: ${this._width};
                height: ${this._height};
                overflow: hidden;
            }
            .zooduck-jelly-square {
                background: ${this._color};
                width: 100%;
                height: calc(${this._width} / var(--cols));
            }
            @keyframes squarePush {
                0% {
                transform: scale(1);
                }
                50% {
                transform: scale(.8);
                }
                100% {
                transform: scale(1);
                }
            }
            .--animation-square-push {
                animation: squarePush infinite both;
            }
        `;

        this.shadowRoot.querySelector('style').innerHTML = style;
    }

    private _syncAttr(prop: string) {
        const propVal = this[prop];
        const attrVal = this.getAttribute(prop);

        if (attrVal !== propVal) {
            this.setAttribute(prop, propVal);
        }

        this._render();
    }

    protected attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
        if (this[name] != newVal) { // Non-strict equals intentional
            this[name] = newVal;
        }
    }

    protected connectedCallback() {
        setTimeout(() => {
            this._render();
            this._registerEvents();
        });
    }

}

customElements.define(tagName, ZooduckJellySquares);
