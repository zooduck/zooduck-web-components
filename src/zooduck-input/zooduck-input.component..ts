import * as utils from './zooduck-input-utils';
import { style } from './zooduck-input.style';
import { globalStyle } from './zooduck-input.global-style';
import { PointerEventDetails } from '../utils/index';

class HTMLZooduckInputElement extends HTMLElement {
    private _autocomplete: string;
    private _autofocus: boolean;
    private _booleanAttrs = [
        'autofocus',
        'disabled',
        'noicons',
        'readonly',
        'required',
    ];
    private _camelCaseProps = {
        noicons: 'noIcons',
        readonly: 'readOnly',
        signatureinkcolor: 'signatureInkColor',
    };
    private _canvas: HTMLCanvasElement;
    private _canvasEvents: utils.CanvasEvents;
    private _canvasHeight = 90;
    private _clearInputIconSlot: HTMLElement;
    private _disabled: boolean;
    private _filter: string;
    private _filterEventName = 'filter';
    private _filterHiddenClass = '--zooduck-input-filter-hidden';
    private _filterMinChars = 2;
    private _filterTagsName = 'zooduck-input-tags';
    private _hidePasswordIconSlot: HTMLElement;
    private _input: HTMLInputElement;
    private _inputLabelContainer: HTMLElement;
    private _keyupEnterEventName = 'keyup:enter';
    private _label: string;
    private _labelEl: HTMLElement;
    private _leftIconSlot: HTMLSlotElement;
    private _loadEventName = 'load';
    private _name: string;
    private _noIcons: boolean;
    private _placeholder: string;
    private _pointerEventDetails: PointerEventDetails;
    private _readOnly: boolean;
    private _required: boolean;
    private _sharedAttrs = [
        'autocomplete',
        'autofocus',
        'disabled',
        'name',
        'placeholder',
        'readonly',
        'required',
        'type',
        'value',
    ];
    private _showPasswordIconSlot: HTMLElement;
    private _signatureInkColor = '#222';
    private _supportedTypes = [
        'email',
        'password',
        'tel',
        'text',
        'url'
    ];
    private _customTypes = [
        'filter',
        'signature',
    ];
    private _type: string;
    private _value: string;

    constructor() {
        super();

        this._value = '';
        this._label = '';
        this._placeholder = '';

        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        shadow.appendChild(style);

        this._inputLabelContainer = utils.buildInputLabelContainer();
        this._input = utils.buildInput();
        this._canvas = utils.buildCanvas(this._canvasHeight);
        this._canvasEvents = new utils.CanvasEvents(this._canvas);
        this._labelEl = utils.buildLabel();
        this._leftIconSlot = document.createElement('slot');
        this._leftIconSlot.setAttribute('name', 'left-icon');
        this._clearInputIconSlot = utils.buildIconSlot('right-icon-clear-input', 'fa-times');
        this._showPasswordIconSlot = utils.buildIconSlot('right-icon-show-password', 'fa-eye');
        this._hidePasswordIconSlot = utils.buildIconSlot('right-icon-hide-password', 'fa-eye-slash');

        this._pointerEventDetails = new PointerEventDetails();
    }

    protected static get observedAttributes(): string[] {
        return [
            'autocomplete',
            'autofocus',
            'disabled',
            'filter',
            'label',
            'name',
            'noicons',
            'placeholder',
            'readonly',
            'required',
            'signatureinkcolor',
            'type',
            'value',
        ];
    }

    private _addCanvasEvents() {
        if ('PointerEvent' in window) {
            this._canvas.addEventListener('pointerdown', (e: PointerEvent) => {
                const eventDetails = this._pointerEventDetails.fromPointer(e);
                this._canvasEvents.onTouchStart(eventDetails);
            });
            this._canvas.addEventListener('pointermove', (e: PointerEvent) => {
                const eventDetails = this._pointerEventDetails.fromPointer(e);
                this._canvasEvents.onTouchMove(eventDetails);
            });
            this._canvas.addEventListener('pointerup', this._canvasOnTouchEnd.bind(this));
            this._canvas.addEventListener('pointerleave', this._canvasOnTouchEnd.bind(this));
        } else if ('TouchEvent' in window) {
            this._canvas.addEventListener('touchstart', (e: TouchEvent) => {
                const eventDetails = this._pointerEventDetails.fromTouch(e);
                this._canvasEvents.onTouchStart(eventDetails);
            });
            this._canvas.addEventListener('touchmove', (e: TouchEvent) => {
                const eventDetails = this._pointerEventDetails.fromTouch(e);
                this._canvasEvents.onTouchMove(eventDetails);
            });
            this._canvas.addEventListener('touchcancel', this._canvasOnTouchEnd.bind(this));
            this._canvas.addEventListener('touchend', this._canvasOnTouchEnd.bind(this));
        } else {
            this._canvas.addEventListener('mousedown', (e: MouseEvent) => {
                const eventDetails = this._pointerEventDetails.fromMouse(e);
                this._canvasEvents.onTouchStart(eventDetails);
            });
            this._canvas.addEventListener('mousemove', (e: MouseEvent) => {
                const eventDetails = this._pointerEventDetails.fromMouse(e);
                this._canvasEvents.onTouchMove(eventDetails);
            });
            this._canvas.addEventListener('mouseup', this._canvasOnTouchEnd.bind(this));
            this._canvas.addEventListener('mouseleave', this._canvasOnTouchEnd.bind(this));
        }
    }

    private _addEvents(): void {
        window.addEventListener('resize', () => {
            this._updateCanvasWidth();
        });

        this._addCanvasEvents();

        this.addEventListener('click', () => {
            this._input.focus();
        });

        this._input.addEventListener('focus', () => {
            this.classList.add('--active');

            if (this._placeholder) {
                this._input.setAttribute('placeholder', this._placeholder);
            }
        });

        this._input.addEventListener('blur', () => {
            this.classList.remove('--active');

            if (this._placeholder && this._label) {
                this._input.removeAttribute('placeholder');
            }
        });

        this._input.addEventListener('input', () => {
            this.value = this._input.value;
            this._updateValue();
        });

        this._input.addEventListener('keyup', (e: KeyboardEvent) => {
            const isEnterKey = (e.code === 'Enter' || e.key === 'Enter' || e.keyCode === 13 || e.which === 13);
            if (isEnterKey) {
                this.dispatchEvent(new CustomEvent(this._keyupEnterEventName, {
                    detail: {
                        value: this._input.value,
                    }
                }));

                this._input.blur(); // Instruct mobile browsers to remove keyboard interface
            }
        });

        [
            this._leftIconSlot,
            this._clearInputIconSlot,
            this._showPasswordIconSlot,
            this._hidePasswordIconSlot
        ].forEach((slot) => {
            if ('PointerEvent' in window) {
                slot.addEventListener('pointerdown', (e: PointerEvent) => e.preventDefault());
            } else if ('TouchEvent' in window) {
                slot.addEventListener('touchstart', (e: TouchEvent) => e.preventDefault());
            } else {
                slot.addEventListener('mousedown', (e: MouseEvent) => e.preventDefault());
            }
        });

        this._clearInputIconSlot.addEventListener('click', () => {
            this.value = '';

            if (this.type === 'signature') {
                this._clearCanvas();
            } else {
                this._input.focus();
            }
        });

        this._showPasswordIconSlot.addEventListener('click', () => {
            this._input.type = 'text';
            this._input.focus();
            this.classList.add('--show-password');
        });

        this._hidePasswordIconSlot.addEventListener('click', () => {
            this._input.type = 'password';
            this._input.focus();
            this.classList.remove('--show-password');
        });
    }

    private _addFonts() {
        const style = document.createElement('style');
        style.innerText = '@import url("https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i&display=swap")';
        this.appendChild(style);
    }

    private _addInputLabelContainer = (): void => {
        this._inputLabelContainer.appendChild(this._input);
        this._inputLabelContainer.appendChild(this._canvas);
        this._inputLabelContainer.appendChild(this._labelEl);
        this.root.appendChild(this._inputLabelContainer);
    }

    private _addSlots = (): void => {
        this.root.insertBefore(this._leftIconSlot, this._inputLabelContainer);
        this.root.appendChild(this._clearInputIconSlot);
        this.root.appendChild(this._showPasswordIconSlot);
        this.root.appendChild(this._hidePasswordIconSlot);

        this._setHasLeftIconSlotModifierClass();
    }

    private _applyFilter = () => {
        if (this._type !== 'filter') {
            return;
        }

        const sections: HTMLElement[] = Array.from(document.querySelectorAll(`[${this._filterTagsName}]`));
        const allTags: string[] = this._getAllFilterTags(sections);
        const matchingTags: string[] = this._getMatchingTags(allTags);
        const matchingSections: Element[] = this._getMatchingSections(sections, matchingTags);

        sections.forEach((section: HTMLElement) => {
            if (!matchingSections.includes(section)) {
                section.classList.add(this._filterHiddenClass);
            } else {
                section.classList.remove(this._filterHiddenClass);
            }
        });

        const filterValid = matchingTags.length != allTags.length;

        if (filterValid) {
            this.dispatchEvent(new CustomEvent(this._filterEventName, {
                detail: {
                    tags: allTags,
                    matchingTags,
                    matchingElements: matchingSections
                }
            }));

            window.scrollTo(0, 0);
        }
    }

    private _canvasOnTouchEnd() {
        this._canvasEvents.onTouchEnd();
        this.value = this._canvasEvents.imageData;
    }

    private _clearCanvas() {
        const context = this._canvas.getContext('2d');
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._canvasEvents.clearImageData();
    }

    private _getAllFilterTags(sections: Element[]): string[] {
        let allTags = [];

        sections.forEach((section: Element) => {
            const tags = section.getAttribute(this._filterTagsName).split(' ')
                .filter((tag: string) => !allTags.includes(tag));
            allTags = allTags.concat(tags);
        });

        return allTags;
    }

    private _getMatchingSections(sections: Element[], matchingTags: string[]): Element[] {
        const matchingSections = matchingTags.length ? sections.filter((section: HTMLElement) => {
            const tags = section.getAttribute(this._filterTagsName);
            const matchingTagsPattern = new RegExp(`(${matchingTags.join('|')})`);

            return tags.search(matchingTagsPattern) !== -1;
        }) : [];

        return matchingSections;
    }

    private _getMatchingTags(allTags: string[]): string[] {
        return allTags.filter((tag: string) => {
            const inputValuePattern = new RegExp(`(${this._input.value.split(' ').filter((val) => {
                return val.trim().length >= this._filterMinChars;
            }).join('|')})`);

            return inputValuePattern.test(tag) || new RegExp(tag).test(this._input.value);
        });
    }

    private _isBooleanAttr(attr: string): boolean {
        return this._booleanAttrs.includes(attr);
    }

    private _setHasLeftIconSlotModifierClass() {
        if (!this._leftIconSlot.assignedNodes) {
            return;
        }

        if (this._leftIconSlot.assignedNodes.length) {
            this.classList.add('--has-left-icon');
        }
    }

    private _setup() {
        this._addInputLabelContainer();
        this._addSlots();
        this._addEvents();
        this._addFonts();
        this._updateStyle();
        this._updateCanvasWidth();
    }

    private _syncBooleanAttribute(attr: string, val: boolean): void {
        if (val && !this.hasAttribute(attr)) {
            this.setAttribute(attr, '');
        } else if (!val && this.hasAttribute(attr)) {
            this.removeAttribute(attr);
        }

        if (val) {
            this._updateRawInput(attr, '');
        } else {
            this._sharedAttrs.includes(attr) && this._input.removeAttribute(attr);
        }
    }

    private _syncStringAttribute(attr: string, val: any): void {
        if (val === null || val === undefined) {
            /**
             * This is an **intentional deviation** from the default behaviour of attributes / properties.
             * It will **REMOVE** the attribute if you set the property for that attribute to **null**.
             * This is in parallel with the **attributeChangedCallback** lifecycle callback that returns
             * a value of **null** when an attribute is removed.
             *
             * See below for an example of the (ridiculous) default behaviour @17-10-2019.
             *
             * Example
             * ```
             * <input placeholder="placeholder" />
             * <script>
             * const input = document.querySelector('input');
             * input.placeholder = null;
             * </script>
             * ```
             *
             * Result
             * ```
             * <input placeholder="null" />
             * ```
             */
            this.removeAttribute(attr);
            this._sharedAttrs.includes(attr) && this._input.removeAttribute(attr);

            return;
        }

        if (typeof val !== 'string') {
            val = JSON.stringify(val);
        }

        if (!this.hasAttribute(attr) || (this.getAttribute(attr) !== val)) {
            this.setAttribute(attr, val);
        }

        this._updateRawInput(attr, val);
    }

    private _updateCanvasWidth() {
        this._canvas.width = 0;
        this._canvas.width = this._inputLabelContainer.offsetWidth;
    }

    private _updateHasValidLabelClass(): void {
        if (this._label) {
            this.classList.add('--has-valid-label');
        } else {
            this.classList.remove('--has-valid-label');
        }
    }

    private _updateIconSlotsDisplay(options: any): void {
        [
            this._leftIconSlot,
            this._clearInputIconSlot,
            this._showPasswordIconSlot,
            this._hidePasswordIconSlot
        ].forEach((slot) => {
            slot.hidden = !options.showSlots;
        });
    }

    private _updateLabel(): void {
        this._syncStringAttribute('label', this._label);

        if (typeof this._label === 'string') {
            this._labelEl.innerHTML = this._label;
        }

        if (!this._label && this._placeholder) {
            this._syncStringAttribute('placeholder', this._placeholder);
        }

        if (this._label && this._placeholder) {
            this._input.removeAttribute('placeholder');
        }

        this._updateHasValidLabelClass();
    }

    private _updateNoIcons(): void {
        this._syncBooleanAttribute('noicons', this._noIcons);

        if (this._noIcons) {
            this._updateIconSlotsDisplay({ showSlots: false });
        } else {
            this._updateIconSlotsDisplay({ showSlots: true });
        }
    }

    private _updatePlaceholder(): void {
        this._syncStringAttribute('placeholder', this._placeholder);
    }

    private _updateRawInput(attr: string, val: string) {
        if (attr === 'placeholder' && this._label) {
            return;
        }

        if (attr === 'type') {
            this._supportedTypes.includes(val)
                ? this._input.setAttribute(attr, val)
                : this._input.removeAttribute(attr);
        } else {
            this._sharedAttrs.includes(attr) && this._input.setAttribute(attr, val);
        }
    }

    private _updateStyle(): void {
        const styleEl = this.shadowRoot.querySelector('style');
        styleEl.textContent = style;

        const globalStyleEl = document.createElement('style');
        globalStyleEl.textContent = globalStyle;
        document.head.appendChild(globalStyleEl);
    }

    private _updateType(): void {
        this._syncStringAttribute('type', this._type);

        this._value = '';
        this._clearCanvas();

        this.classList.remove('--show-password');
    }

    private _updateValue(): void {
        this._syncStringAttribute('value', this._value);

        if (this._value) {
            this.classList.add('--has-content');
        } else {
            this.classList.remove('--has-content');
        }

        this._applyFilter();
    }

    public get autocomplete(): string {
        return this._autocomplete;
    }

    public set autocomplete(val: string) {
        this._autocomplete = val;
        this._syncStringAttribute('autocomplete', this.autocomplete);
    }

    public get autofocus(): boolean {
        return this._autofocus;
    }

    public set autofocus(val: boolean) {
        this._autofocus = val;
        this._syncBooleanAttribute('autofocus', this.autofocus);
    }

    public get disabled() {
        return this._disabled;
    }

    public set disabled(val: boolean) {
        this._disabled = val;
        this._syncBooleanAttribute('disabled', this.disabled);
    }

    public get filter() {
        return this._filter;
    }

    public set filter(val: string) {
        this._filter = val;
    }

    public get label(): string {
        return this._label;
    }

    public set label(val: string | null) {
        this._label = val;
        this._updateLabel();
    }

    public get name(): string {
        return this._name;
    }

    public set name(val: string) {
        this._name = val;
        this._syncStringAttribute('name', this.name);
    }

    public get noIcons(): boolean {
        return this._noIcons;
    }

    public set noIcons(val: boolean) {
        this._noIcons = val;
        this._updateNoIcons();
    }

    public get placeholder(): string {
        return this._placeholder;
    }

    public set placeholder(val: string | null) {
        this._placeholder = val;
        this._updatePlaceholder();
    }

    public get required(): boolean {
        return this._required;
    }

    public set required(val: boolean) {
        this._required = val;
        this._syncBooleanAttribute('required', this.required);
    }

    public get readOnly() {
        return this._readOnly;
    }

    public set readOnly(val: boolean) {
        this._readOnly = val;
        this._syncBooleanAttribute('readonly', val);
    }

    private get root(): ShadowRoot | HTMLZooduckInputElement {
        return this.shadowRoot || this;
    }

    public get signatureInkColor() {
        return this._signatureInkColor;
    }

    public set signatureInkColor(val: string) {
        this._signatureInkColor = val;
        this._canvasEvents.signatureInkColor = this.signatureInkColor;
    }

    public get type(): string {
        return this._type;
    }

    public set type(val: string) {
        let inferredVal = val;
        const allSupportedTypes = this._supportedTypes.concat(this._customTypes);
        if (!allSupportedTypes.includes(val) && val !== null) {
            inferredVal = 'text';
        }
        this._type = inferredVal;
        this._updateType();
    }

    public get value(): string {
        return this._value;
    }

    public set value(val: string | null) {
        this._value = val;
        this._input.value = val;
        this._updateValue();
    }

    protected async connectedCallback() {
        if (!this.isConnected) {
            return;
        }

        this._setup();

        this.dispatchEvent(new CustomEvent(this._loadEventName));
    }

    protected attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
        const prop = this._camelCaseProps[name] || name;

        if (this[prop] === newVal) {
            return;
        }

        if (this._isBooleanAttr(name)) {
            this[prop] = this.hasAttribute(name);
        } else {
            this[prop] = newVal;
        }
    }
}

customElements.define('zooduck-input', HTMLZooduckInputElement);
