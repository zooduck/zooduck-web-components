# Zooduck Web Components
Zero dependency sample library of pure <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" target="_blank">HTML Web Components</a>. Can be used with any modern browser that supports <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements" target="_blank">Autonomous custom elements</a> (i.e. Chrome, Firefox, Opera, Safari).

An up-to-date list of supported browsers can be found here: https://caniuse.com/#search=custom%20element

![alt text](https://github.com/zooduck/screenshots/blob/master/zooduck-web-components/v0.7.0-alpha/zooduck-web-components-v0.7.0-alpha.png)

## Examples (with documentation)
https://zooduck.github.io/zooduck-web-components/dist/examples.html

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

## Docs
Refer to <a href="https://zooduck.github.io/zooduck-web-components/dist/examples.html" target="_blank">Examples</a>
