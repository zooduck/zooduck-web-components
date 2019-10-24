import * as utils from './zoo-input-utils';
import { style } from './zoo-input.style';

export class HTMLZooInputElement extends HTMLElement {
    _autocomplete: string;
    _autofocus: boolean;
    _booleanAttrs = [
        'autofocus',
        'disabled',
        'noicons',
        'readonly',
        'required',
    ];
    _disabled: boolean;
    _label: string;
    _name: string;
    _noIcons: boolean;
    _placeholder: string;
    _readOnly: boolean;
    _required: boolean;
    _sharedAttrs = [
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
    _type: string;
    _value: string;
    camelCaseProps = {
        noicons: 'noIcons',
        readonly: 'readOnly',
    };
    clearInputIconSlot: HTMLElement;
    hidePasswordIconSlot: HTMLElement;
    input: HTMLInputElement;
    inputLabelContainer: HTMLElement;
    labelEl: HTMLElement;
    leftIconSlot: HTMLElement;
    showPassword = false;
    showPasswordIconSlot: HTMLElement;

    public static get observedAttributes(): string[] {
        return [
            'autocomplete',
            'autofocus',
            'disabled',
            'label',
            'name',
            'noicons',
            'placeholder',
            'readonly',
            'required',
            'type',
            'value',
        ];
    }

    private _addEvents(): void {
        this.addEventListener('click', () => {
            this.input.focus();
        });

        this.input.addEventListener('focus', () => {
            this.classList.add('--active');
        });

        this.input.addEventListener('blur', () => {
            this.classList.remove('--active');
        });

        this.input.addEventListener('input', () => {
            this.value = this.input.value;
            this._updateValue();
        });

        this.leftIconSlot.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
        });

        [
            this.clearInputIconSlot,
            this.showPasswordIconSlot,
            this.hidePasswordIconSlot
        ].forEach((slot) => {
            slot.addEventListener('mousedown', (e: MouseEvent) => e.preventDefault());
        });

        this.clearInputIconSlot.addEventListener('click', () => {
            this.value = '';
            this.input.focus();
        });

        this.showPasswordIconSlot.addEventListener('click', () => {
            this.input.type = 'text';
            this.input.focus();
            this.classList.add('--show-password');
        });

        this.hidePasswordIconSlot.addEventListener('click', () => {
            this.input.type = 'password';
            this.input.focus();
            this.classList.remove('--show-password');
        });
    }

    private _addFonts() {
        const style = document.createElement('style');
        style.innerText = '@import url("https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i&display=swap")';
        this.appendChild(style);
    }

    private _addInputLabelContainer = (): void => {
        this.inputLabelContainer.appendChild(this.input);
        this.inputLabelContainer.appendChild(this.labelEl);
        this.root.appendChild(this.inputLabelContainer);
    }

    private _addSlots = (): void => {
        this.root.insertBefore(this.leftIconSlot, this.inputLabelContainer);
        this.root.appendChild(this.clearInputIconSlot);
        this.root.appendChild(this.showPasswordIconSlot);
        this.root.appendChild(this.hidePasswordIconSlot);
    }

    private _isBooleanAttr(attr: string): boolean {
        return this._booleanAttrs.includes(attr);
    }

    private _setup() {
        this._addInputLabelContainer();
        this._addSlots();
        this._addEvents();
        this._addFonts();
        this._updateStyle();
    }

    private _syncBooleanAttribute(attr: string, val: boolean): void {
        if (val && !this.hasAttribute(attr)) {
            this.setAttribute(attr, '');
        } else if (!val && this.hasAttribute(attr)) {
            this.removeAttribute(attr);
        }

        if (val) {
            this._sharedAttrs.includes(attr) && this.input.setAttribute(attr, '');
        } else {
            this._sharedAttrs.includes(attr) && this.input.removeAttribute(attr);
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
            this._sharedAttrs.includes(attr) && this.input.removeAttribute(attr);

            return;
        }

        if (typeof val !== 'string') {
            val = JSON.stringify(val);
        }

        if (!this.hasAttribute(attr) || (this.getAttribute(attr) !== val)) {
            this.setAttribute(attr, val);
        }

        this._sharedAttrs.includes(attr) && this.input.setAttribute(attr, val);
    }

    private _updateHasValidLabelClass(): void {
        if (this.label && !this.placeholder) {
            this.classList.add('--has-valid-label');
        } else {
            this.classList.remove('--has-valid-label');
        }
    }

    private _updateIconSlots(options: any): void {
        [
            this.leftIconSlot,
            this.clearInputIconSlot,
            this.showPasswordIconSlot,
            this.hidePasswordIconSlot
        ].forEach((slot) => {
            slot.hidden = !options.showSlots;
        });
    }

    private _updateLabel(): void {
        this._syncStringAttribute('label', this.label);

        if (typeof this.label === 'string') {
            this.labelEl.innerHTML = this.label;
        }

        this._updateHasValidLabelClass();
    }

    private _updateNoIcons(): void {
        this._syncBooleanAttribute('noicons', this.noIcons);

        if (this.noIcons) {
            this._updateIconSlots({ showSlots: false });
        } else {
            this._updateIconSlots({ showSlots: true });
        }
    }

    private _updatePlaceholder(): void {
        this._syncStringAttribute('placeholder', this.placeholder);
        this._updateHasValidLabelClass();
    }

    private _updateStyle(): void {
        const styleEl = this.shadowRoot.querySelector('style');
        styleEl.textContent = style;
    }

    private _updateType(): void {
        this._syncStringAttribute('type', this.type);

        this.showPassword = false;
        this.classList.remove('--show-password');
    }

    private _updateValue(): void {
        this._syncStringAttribute('value', this.value);

        if (this.value) {
            this.classList.add('--has-content');
        } else {
            this.classList.remove('--has-content');
        }
    }

    constructor() {
        super();

        this._value = '';
        this._label = '';
        this._placeholder = '';

        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        shadow.appendChild(style);

        this.inputLabelContainer = utils.buildInputLabelContainer();
        this.input = utils.buildInput();
        this.labelEl = utils.buildLabel();
        this.leftIconSlot = document.createElement('slot');
        this.leftIconSlot.setAttribute('name', 'left-icon');
        this.clearInputIconSlot = utils.buildIconSlot('right-icon-clear-input', 'fa-times');
        this.showPasswordIconSlot = utils.buildIconSlot('right-icon-show-password', 'fa-eye');
        this.hidePasswordIconSlot = utils.buildIconSlot('right-icon-hide-password', 'fa-eye-slash');
    }

    get autocomplete(): string {
        return this._autocomplete;
    }

    set autocomplete(val: string) {
        this._autocomplete = val;
        this._syncStringAttribute('autocomplete', this.autocomplete);
    }

    get autofocus(): boolean {
        return this._autofocus;
    }

    set autofocus(val: boolean) {
        this._autofocus = val;
        this._syncBooleanAttribute('autofocus', this.autofocus);
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(val: boolean) {
        this._disabled = val;
        this._syncBooleanAttribute('disabled', this.disabled);
    }

    get label(): string {
        return this._label;
    }

    set label(val: string | null) {
        this._label = val;
        this._updateLabel();
    }

    get name(): string {
        return this._name;
    }

    set name(val: string) {
        this._name = val;
        this._syncStringAttribute('name', this.name);
    }

    get noIcons(): boolean {
        return this._noIcons;
    }

    set noIcons(val: boolean) {
        this._noIcons = val;
        this._updateNoIcons();
    }

    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(val: string | null) {
        this._placeholder = val;
        this._updatePlaceholder();
    }

    get required(): boolean {
        return this._required;
    }

    set required(val: boolean) {
        this._required = val;
        this._syncBooleanAttribute('required', this.required);
    }

    get readOnly() {
        return this._readOnly;
    }

    set readOnly(val: boolean) {
        this._readOnly = val;
        this._syncBooleanAttribute('readonly', val);
    }

    get root(): ShadowRoot | HTMLZooInputElement {
        return this.shadowRoot || this;
    }

    get type(): string {
        return this._type;
    }

    set type(val: string) {
        this._type = val;
        this._updateType();
    }

    get value(): string {
        return this._value;
    }

    set value(val: string | null) {
        this._value = val;
        this.input.value = val;
        this._updateValue();
    }

    protected async connectedCallback() {
        if (!this.isConnected) {
            return;
        }

        this._setup();
    }

    protected attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
        const prop = this.camelCaseProps[name] || name;

        if (this._isBooleanAttr(name)) {
            this[prop] = this.hasAttribute(name);
        } else {
            this[prop] = newVal;
        }
    }
}
