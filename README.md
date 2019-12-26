# zooduck-web-components
A library of native HTML Custom Elements ("Web Components") *without polyfills*. Can be used with any modern browser that supports "Autonomous custom elements" (i.e. Chrome, Firefox, Opera, Safari).

An up-to-date list of supported browsers can be found here: https://caniuse.com/#search=custom%20element

## Usage
Include the following `<script>` tag in the `<head>` of your page:

```html
<script src="https://cdn.jsdelivr.net/gh/zooduck/zooduck-web-components@master/dist/zooduck-web-components.min.js"></script>
```

Then, either:

```html
<zooduck-input type="text" name="example" label="example"></zooduck-input>
```

or:

```html
<zooduck-input></zooduck-input>

<script>
  const input = document.querySelector('zooduck-input');
  input.type = 'text';
  input.name = 'example';
  input.label = 'example';
</script>
```

# \<zooduck-input\>

## Supported attributes:

| Name | Type | Values | Property |
| ---- | ---- | ------ | -------- |
| autocomplete | string | on, off | autocomplete |
| autofocus | boolean | true, false | autofocus |
| disabled | boolean | true, false | disabled |
| name | string | any | name |
| noicons* | boolean | true, false | noIcons |
| placeholder | string | any | placeholder |
| type | string | email, password, tel, text, url | type |

*camelCase property

## Special attributes:

| Name | Type | Values | Property | Description |
| ---- | ---- | ------ | -------- | ----------- |
| label | string | any | label | Animated placeholder. If both `label` and `placeholder` are set, `placeholder` is ignored. |
| signatureinkcolor* | string | any | signatureInkColor | Sets the ink color for the `signature` type. |

*camelCase property

## Special types:

### `<zooduck-input type="filter"></zooduck-input>`

| Name | Description |
| ---- | ----------- |
| filter | If the type is set to filter, whenever the input's value changes all parent nodes in the DOM are checked for a `zooduck-input-tags` attribute, and a `--zooduck-input-filter-hidden` modifier class is applied to all elements without matching tags.<br><br>This class has a default style of `display: none`. |

For example, given the following:

```html
<zooduck-input type="filter" value"fro"></zooduck-input>
<section zooduck-input-tags="blue monster muppet cookie henson disney">cookie monster</section>
<section zooduck-input-tags="frog amphibian muppet henson disney">kermit</section>
<section>fraggle rock</section>
<section zooduck-input-tags="cold snow frost ice">winter weather</section>
```

The result would be:

```html
<zooduck-input type="filter" value"fro"></zooduck-input>
<!-- this section gets the modifier class applied since it does not have any tags that contain "fro" -->
<section class="--zooduck-input-filter-hidden" zooduck-input-tags="blue monster muppet cookie henson disney">cookie monster</section>
<!-- this section is ignored, since it has a tag of "frog" that contains "fro" -->
<section zooduck-input-tags="frog amphibian muppet henson disney">kermit</section>
<!-- this section is ignored, since it has no "zooduck-input-tags" attribute -->
<section>fraggle rock</section>
<!-- this section is ignored, since it has a tag of "frost" that contains "fro" -->
<section zooduck-input-tags="cold snow frost ice">winter weather</section>
```
### `<zooduck-input type="signature"></zooduck-input>`

| Name | Description |
| ---- | ----------- |
| signature | Adds a `<canvas>` element to the input, which can be drawn on using either mouse or touch.<br><br>The image (signature) is saved to the input's value as a `Data URL` string - which is convenient for storing in a database and reproducing later on with an `<img>` element. |

## Slots

| Name | Interactive | Description | Supported types | Default |
| ---- | ----------- | ----------- | --------------- | ------- |
| left-icon | No | Any | Non-interactive icon that appears on the left hand side of the input. | No icon |
| right-icon-clear-input | Yes | Any | Interactive icon that clears the input when clicked. | fas fa-times* |
| right-icon-hide-password | Yes | password | Interactive icon that hides the password when clicked. | fas fa-eye-slash* |
| right-icon-show-password | Yes | password | Intetractive icon that shows the password when clicked. | fas fa-eye* |

*icons provided by Font Awesome - https://fontawesome.com/license

For example, to set an icon for the left-icon (assuming you are using Font Awesome icons):

```html
<zooduck-input>
  <i class="fas fa-search" slot="left-icon"></i>
 </zooduck-input>
```

Note: The slots can accept any content, but are specifically designed to work with *icon fonts*, *svg icons* and *single characters*.

## CSS Variables
There are a number of CSS configuration options, in the form of CSS variables, that allow you to customize the look and feel of the input:

| Name | Description | Default |
| ---- | ----------- | ------- |
| --zooduck-input-font-family | The `font-family` style of the element | inherit |
| --zooduck-input-font-size | The `font-size` style of the element | 19px |
| --zooduck-input-font-weight | The `font-weight` style of the element | inherit |
| --zooduck-input-font-style | The `font-style` style of the element | inherit |
| --zooduck-input-width | The `width` style of the element | auto |
| --zooduck-input-border-style | The `border-style` style of the element | solid |
| --zooduck-input-border-color | The `border-color` style of the element | var(--gray) |
| --zooduck-input-border-width | The `border-width` style of the element | 1px |
| --zooduck-input-background-color | The `background-color` style of the element | #fff |
| --zooduck-input-disabled-background-color | The `background-color` style of the element when its `disabled` attribute is set | #eee |
| --zooduck-input-color | The `color` style of the element's input | var(--black) |
| --zooduck-input-label-color | The `color` style of the element's label | var(--gray) |
| --zooduck-input-icon-color | The `color` style of the icon slots | var(--zooduck-input-label-color, var(--gray)) |
| --zooduck-input-icon-padding | The `padding` style of icon slots | 0 20px |
| --zooduck-input-signature-border-color | The `border-color` style of the signature canvas | #eee |

## Custom Events
|Name|Description|Event.detail|
|----|-------|------|
|keyup:enter|Fired when a keyup event for the Enter key is detected|value|

## Examples
Default:

```html
<zooduck-input label="zooduck-input"></zooduck-input>
```

![alt text](https://github.com/zooduck/screenshots/blob/master/zooduck-web-components/zooduck-input/zooduck-input-default.png)

With CSS vars:
```html
<style>
  :root {
    --zooduck-input-label-color: tomato;
    --zooduck-input-border-color: tomato;
    --zooduck-input-border-width: 0 0 4px 0;
    --zooduck-input-font-size: 32px;
  }
</style>

<zooduck-input label="zooduck-input"></zooduck-input>
```
![alt text](https://github.com/zooduck/screenshots/blob/master/zooduck-web-components/zooduck-input/zooduck-input-css-vars-1.png)
