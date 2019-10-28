# zooduck-web-components

## Usage
Include the following `<script>` tag in the `<head>` of your page:

```html
<script src="https://cdn.jsdelivr.net/gh/zooduck/zooduck-web-components/dist/zooduck-web-components.min.js"></script>
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
| label | string | any | label | Animated placeholder. If both `label` and `placeholder` are set, `placeholder` is ignored.

## Special types:

| Name | Description |
| ---- | ----------- |
| filter | If the type is set to filter, whenever the input's value changes all parent nodes in the DOM are checked for a `zooduck-input-tags` attribute, and a `--zooduck-input-filter-hidden` modifier class is applied to all elements without matching tags. This class has a default style of `display: none`, which can be easily overridden to suit any design choice.|

For example, given the following:

```html
<zooduck-input type="filter" value"frog"></zooduck-input>
<section zooduck-input-tags="blue monster muppet cookie henson disney">cookie monster</section>
<section zooduck-input-tags="frog amphibian muppet henson disney">kermit</section>
```

The result would be:

```html
<zooduck-input type="filter" value"frog"></zooduck-input>
<!-- this section gets the modifier class applied since it does not have any tags that match "frog" -->
<section class="--zooduck-input-filter-hidden" zooduck-input-tags="blue monster muppet cookie henson disney">cookie monster</section>
<section zooduck-input-tags="frog amphibian muppet henson disney">kermit</section>
```
