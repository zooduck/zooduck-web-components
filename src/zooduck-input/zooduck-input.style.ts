export const style = `
/* ============================================================================================= */
/* | CSS VARS                                                                                  | */
/* ============================================================================================= */
/* | Name                                      | Default                                       | */
/* | ----------------------------------------------------------------------------------------- | */
/* | --zooduck-input-font-family               | "Roboto", sans-serif                          | */
/* | --zooduck-input-font-size                 | 19px                                          | */
/* | --zooduck-input-font-weight               | inherit                                       | */
/* | --zooduck-input-font-style                | inherit                                       | */
/* | --zooduck-input-width                     | auto                                          | */
/* | --zooduck-input-border-style              | solid                                         | */
/* | --zooduck-input-border-color              | var(--gray)                                   | */
/* | --zooduck-input-border-width              | 1px                                           | */
/* | --zooduck-input-background-color          | var(--white)                                  | */
/* | --zooduck-input-disabled-background-color | var(--disabled)                               | */
/* | --zooduck-input-color                     | var(--black)                                  | */
/* | --zooduck-input-label-color               | var(--gray)                                   | */
/* | --zooduck-input-icon-color                | var(--zooduck-input-label-color, var(--gray)) | */
/* | --zooduck-input-icon-padding              | 0 20px                                        | */
/* | --zooduck-input-signature-border-color    | var(--palegray)                               | */
/* ============================================================================================= */

:host {
    --gray: #bbb;
    --palegray: #eee;
    --black: #222;
    --white: #fff;
    --disabled: #eee;

    position: relative;
    display: flex;
    touch-action: none;
    width: var(--zooduck-input-width, auto);
    border-style: var(--zooduck-input-border-style, solid);
    border-color: var(--zooduck-input-border-color, var(--gray));
    border-width: var(--zooduck-input-border-width, 1px);
    background-color: var(--zooduck-input-background-color, var(--white));
    font-family: var(--zooduck-input-font-family, 'Roboto', sans-serif);
    font-size: var(--zooduck-input-font-size, 19px);
    font-weight: var(--zooduck-input-font-weight, inherit);
    font-style: var(--zooduck-input-font-style, inherit);
}
:host([disabled]),
:host([disabled]) input {
    background-color: var(--zooduck-input-disabled-background-color, var(--disabled));
}
.input-label-container {
    display: flex;
    flex-grow: 1;
}
:host([type=signature]) .input-label-container {
    min-width: 200px;
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
:host(.--has-left-icon) .label {
    left: 0;
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
    background-color: var(--zooduck-input-background-color, var(--white));
    color: var(--zooduck-input-color, var(--black));
}
:host(.--has-left-icon) input {
    padding-left: 0;
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
    border-color: var(--zooduck-input-signature-border-color, var(--palegray));
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
