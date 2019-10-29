import 'regenerator-runtime/runtime'; // required for async/await to work with babel7+
import { HTMLZooduckInputElement } from './zooduck-input/zooduck-input';

customElements.define('zooduck-input', HTMLZooduckInputElement);
