export const style = `
/**
 * @var --zoo-input-font-family: The \`font-family\` style of the element. Defaults to \`inherit\`.
 * @var --zoo-input-font-size: The \`font-size\` style of the element. Defaults to \`19px\`.
 * @var --zoo-input-font-weight: The \`font-weight\` style of the element. Defaults to \`inherit\`.
 * @var --zoo-input-font-style: The \`font-style\` style of the element. Defaults to \`inherit\`.
 * @var --zoo-input-width: The \`width\` style of the element. Defaults to \`auto\`.
 * @var --zoo-input-display: The \`display\` style of the element. Defaults to \`flex\`.
 * @var --zoo-input-border: The \`border\` style of the element. Defaults to \`solid var(--gray)\`.
 * @var --zoo-input-border-width: The \`border-width\` style of the element. Defaults to \`1px\`.
 * @var --zoo-input-background-color: The \`background-color\` style of the element. Defaults to \`#fff\`.
 * @var --zoo-input-color: The \`color\` style of the element's input. Defaults to \`var(--black)\`.
 * @var --zoo-input-label-color: The \`color\` style of the element's label. Defaults to \`var(--gray)\`.
 * @var --zoo-input-icon-color: The \`color\` style of the icon slots. Defaults to \`var(--zoo-input-label-color, var(--gray))\`.
 * @var --zoo-input-icon-padding: The \`padding\` style of icon slots. Defaults to \`0 20px\`.
 */
:host {
    --gray: #bbb;
    --black: #222;

    position: relative;
    display: var(--zoo-input-display, flex);
    width: var(--zoo-input-width, auto);
    border: var(--zoo-input-border, solid var(--gray));
    border-width: var(--zoo-input-border-width, 1px);
    background-color: var(--zoo-input-background-color, #fff);
}
:host([type=hidden]) {
    display: none;
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
    position: absolute;
    pointer-events: none;
    color: var(--zoo-input-label-color, var(--gray));
    font-family: var(--zoo-input-font-family, 'Roboto', sans-serif);
    font-size: var(--zoo-input-font-size, 19px);
    font-weight: var(--zoo-input-font-weight, inherit);
    font-style: var(--zoo-input-font-style, inherit);
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
:host(.--active) .label,
:host(.--has-content) .label {
    top: 5px;
    transform: translateY(0) scale(.8);
}
input {
    border: none;
    outline: none;
    flex-grow: 1;
    padding: 10px;
    font-family: var(--zoo-input-font-family, inherit);
    font-size: var(--zoo-input-font-size, 19px);
    font-weight: var(--zoo-input-font-weight, inherit);
    font-style: var(--zoo-input-font-style, inherit);
    background-color: var(--zoo-input-background-color, #fff);
    color: var(--zoo-input-color, var(--black));
}
:host(.--has-valid-label) input {
    padding-top: calc(var(--zoo-input-font-size, 19px) + 5px);
}
::slotted(*),
slot > * {
    padding: var(--zoo-input-icon-padding, 0 20px);
}
slot[hidden] {
    display: none !important;
}
slot[name*=icon] {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--zoo-input-font-size, 19px);
    color: var(--zoo-input-label-color, var(--gray));
}
slot[name*=icon] svg {
    height: var(--zoo-input-font-size, 19px);
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
`;
