import { fontAwesomeIcons } from './icons/index';
// eslint-disable-next-line no-unused-vars
import { EventDetails } from '../utils/index';

export const buildCanvas = (height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.height = height;

    return canvas;
};

export const buildIconSlot = (slot: string, icon: string): HTMLSlotElement => {
    const iconSlotEl = document.createElement('slot');
    iconSlotEl.name = slot;
    const svgIconTemplateString = fontAwesomeIcons[icon];
    const svgIcon = document.createRange().createContextualFragment(svgIconTemplateString);
    iconSlotEl.appendChild(svgIcon);

    return iconSlotEl;
};

export const buildInput = (): HTMLInputElement => {
    const input = document.createElement('input');
    input.type = 'text';

    return input;
};

export const buildInputLabelContainer = (): HTMLElement => {
    const containerEl = document.createElement('div');
    containerEl.classList.add('input-label-container');

    return containerEl;
};

export const buildLabel = (): HTMLElement => {
    const labelEl = document.createElement('div');
    labelEl.classList.add('label');

    return labelEl;
};

interface EventCoords {
    x: number;
    y: number;
}

export class CanvasEvents {
    private _canDraw = false;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _domRect: DOMRect;
    private _imageData: string;
    private _lineWidth = 3;
    private _signatureInkColor: string;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._signatureInkColor = '#222';
    }

    private _getEventCoords(eventDetails: EventDetails): any {
        const x = eventDetails.clientX - this._domRect.x;
        const y = eventDetails.clientY - this._domRect.y;

        return {
            x,
            y
        };
    }

    private _isTouchInCanvas(eventCoords: EventCoords): boolean {
        if (eventCoords.x < 0
            || eventCoords.y < 0
            || eventCoords.x > this._domRect.width
            || eventCoords.y > this._domRect.height) {
            return false;
        }

        return true;
    }

    public onTouchStart(eventDetails: EventDetails) {
        const { event: e } = eventDetails;

        e.preventDefault();

        this._canDraw = true;
        this._domRect = this._canvas.getBoundingClientRect() as DOMRect;

        const eventCoords = this._getEventCoords(eventDetails);

        this._context = this._canvas.getContext('2d');
        this._context.lineWidth = this._lineWidth;
        this._context.lineCap = 'round';

        this._context.strokeStyle = this._signatureInkColor;

        this._context.beginPath();
        this._context.moveTo(eventCoords.x, eventCoords.y);
        this._context.lineTo(eventCoords.x, eventCoords.y);
        this._context.stroke();
    }

    public onTouchMove(eventDetails: EventDetails) {
        if (this._canDraw) {
            const eventCoords = this._getEventCoords(eventDetails);

            if (!this._isTouchInCanvas(eventCoords)) {
                this._canDraw = false;

                return;
            }

            this._context.lineTo(eventCoords.x, eventCoords.y);
            this._context.stroke();
            this._context.beginPath();
            this._context.moveTo(eventCoords.x, eventCoords.y);
        }
    }

    public onTouchEnd() {
        if (!this._canDraw) {
            return;
        }

        this._canDraw = false;
        this._imageData = this._canvas.toDataURL();
    }

    public get imageData() {
        return this._imageData;
    }

    public clearImageData() {
        this._imageData = '';
    }

    public set signatureInkColor(color: string) {
        this._signatureInkColor = color;
    }
}
