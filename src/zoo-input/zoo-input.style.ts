export const style = `
/**
 * @var --zooduck-input-font-family: The \`font-family\` style of the element. Defaults to \`inherit\`.
 * @var --zooduck-input-font-size: The \`font-size\` style of the element. Defaults to \`19px\`.
 * @var --zooduck-input-font-weight: The \`font-weight\` style of the element. Defaults to \`inherit\`.
 * @var --zooduck-input-font-style: The \`font-style\` style of the element. Defaults to \`inherit\`.
 * @var --zooduck-input-width: The \`width\` style of the element. Defaults to \`auto\`.
 * @var --zooduck-input-border-style: The \`border-style\` style of the element. Defaults to \`solid\`.
 * @var --zooduck-input-border-color: The \`border-color\` style of the element. Defaults to \`var(--gray)\`.
 * @var --zooduck-input-border-width: The \`border-width\` style of the element. Defaults to \`1px\`.
 * @var --zooduck-input-background-color: The \`background-color\` style of the element. Defaults to \`#fff\`.
 * @var --zooduck-input-disabled-background-color: The \`background-color\` style of the element when its \`disabled\` attribute is set. Defaults to \`#eee\`.
 * @var --zooduck-input-color: The \`color\` style of the element's input. Defaults to \`var(--black)\`.
 * @var --zooduck-input-label-color: The \`color\` style of the element's label. Defaults to \`var(--gray)\`.
 * @var --zooduck-input-icon-color: The \`color\` style of the icon slots. Defaults to \`var(--zooduck-input-label-color, var(--gray))\`.
 * @var --zooduck-input-icon-padding: The \`padding\` style of icon slots. Defaults to \`0 20px\`.
 * @var --zooduck-input-signature-border-color: The \`border-color\` style of the signature canvas. Defaults to \`#eee\`.
 */
:host {
    --gray: #bbb;
    --black: #222;
    --disabled: #eee;

    position: relative;
    display: flex;
    width: var(--zooduck-input-width, auto);
    border-style: var(--zooduck-input-border-style, solid);
    border-color: var(--zooduck-input-border-color, var(--gray));
    border-width: var(--zooduck-input-border-width, 1px);
    background-color: var(--zooduck-input-background-color, #fff);
}
:host([disabled]),
:host([disabled]) input {
    background-color: var(--zooduck-input-disabled-background-color, var(--disabled));
}
.input-label-container {
    position: relative;
    display: flex;
    flex-grow: 1;
}
.label {
    display: none;
}
:host(.--has-valid-label) .label {
    display: block;
    user-select: none;
    position: absolute;
    pointer-events: none;
    color: var(--zooduck-input-label-color, var(--gray));
    font-family: var(--zooduck-input-font-family, 'Roboto', sans-serif);
    font-size: var(--zooduck-input-font-size, 19px);
    font-weight: var(--zooduck-input-font-weight, inherit);
    font-style: var(--zooduck-input-font-style, inherit);
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 10px);
    overflow: hidden;
    left: 10px;
    top: 50%;
    transform-origin: left top;
    transform: translateY(-50%);
    transition: all .25s;
}
:host([required]) .label:after {
    content: "*";
}
:host(.--active) .label,
:host(.--has-content) .label,
:host([type=signature]) .label {
    top: 5px;
    transform: translateY(0) scale(.8);
}
input {
    width: 100%;
    border: none;
    outline: none;
    flex-grow: 1;
    padding: 10px;
    font-family: var(--zooduck-input-font-family, inherit);
    font-size: var(--zooduck-input-font-size, 19px);
    font-weight: var(--zooduck-input-font-weight, inherit);
    font-style: var(--zooduck-input-font-style, inherit);
    background-color: var(--zooduck-input-background-color, #fff);
    color: var(--zooduck-input-color, var(--black));
}
canvas {
   display: none;
}
:host([type=signature]) input {
    display: none;
}
:host([type=signature]) canvas {
    display: block;
    margin-top: calc(var(--zooduck-input-font-size, 19px) + 15px);
    border-style: dashed;
    border-color: var(--zooduck-input-signature-border-color, #eee);
    border-width: 6px 6px 0 0;
}
:host(.--has-valid-label) input {
    padding-top: calc(var(--zooduck-input-font-size, 19px) + 5px);
}
::slotted(*),
slot > * {
    padding: var(--zooduck-input-icon-padding, 0 20px);
}
slot[hidden] {
    display: none !important;
}
slot[name*=icon] {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--zooduck-input-font-size, 19px);
    color: var(--zooduck-input-icon-color, var(--zooduck-input-label-color, var(--gray)));
}
slot[name*=icon] svg {
    height: var(--zooduck-input-font-size, 19px);
}
slot[name^=right-icon] {
    cursor: pointer;
    display: none;
}
:host(:not([type=password])) slot[name=right-icon-clear-input] {
    display: flex;
}
:host([type=password]:not(.--show-password)) slot[name=right-icon-show-password] {
    display: flex;
}
:host([type=password].--show-password) slot[name=right-icon-hide-password] {
    display: flex;
}
.--zooduck-input-filter-hidden {
    display: none;
}
`;
