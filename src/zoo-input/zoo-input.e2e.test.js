const shadowSelector = (el, selector) => el.shadowRoot.querySelector(selector);
const getElementFromShadow = async (page, el, selector) => await page.evaluateHandle(shadowSelector, el, selector);
const getProperty = async (node, prop) => {
    const _prop = await node.getProperty(prop);

    return await _prop.jsonValue();
};
const getAttribute = async (page, node, attr) => {
    const _attr = await page.evaluate((node, attr) => {
        return node.getAttribute(attr);
    }, node, attr);

    return _attr;
};
const getClassList = async (el) =>  await page.evaluate((el) => Array.from(el.classList), el);
const getComputedStyleProperty = async (page, el, prop) => {
    const element = (el.constructor.name === 'Array') ? el[0] : el;
    const pseudoEl = (el.constructor.name === 'Array' && el[1]) ? el[1] : undefined;
    return await page.evaluate((el, pseudoEl, prop) => {
        if (pseudoEl) {
            return getComputedStyle(el, pseudoEl).getPropertyValue(prop);
        } else {
            return getComputedStyle(el).getPropertyValue(prop);
        }
    }, element, pseudoEl, prop);
};

describe('<zoo-input>', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:4444');
    });

    it('should render with elements in its shadow DOM', async () => {
        await page.setContent('<zoo-input></zoo-input>');

        const el = await page.$('zoo-input');

        const style = await getElementFromShadow(page, el, 'style');
        expect(await style.evaluate(node => node)).toBeTruthy();

        const input = await getElementFromShadow(page, el, 'input');
        expect(await input.evaluate(node => node)).toBeTruthy();

        const label = await getElementFromShadow(page, el, '.label');
        expect(await label.evaluate(node => node)).toBeTruthy();

        const slotA = await getElementFromShadow(page, el, 'slot[name=left-icon]');
        expect(await slotA.evaluate(node => node)).toBeTruthy();

        const slotB = await getElementFromShadow(page, el, 'slot[name=right-icon-clear-input]');
        expect(await slotB.evaluate(node => node)).toBeTruthy();

        const slotC = await getElementFromShadow(page, el, 'slot[name=right-icon-show-password]');
        expect(await slotC.evaluate(node => node)).toBeTruthy();

        const slotD = await getElementFromShadow(page, el, 'slot[name=right-icon-hide-password]');
        expect(await slotD.evaluate(node => node)).toBeTruthy();
    });

    describe('attributes', () => {
        describe('value', () => {
            it('should set the `value` of its input to the value of its `value` attribute', async () => {
                await page.setContent('<zoo-input value="TEST_VAL"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'value')).toEqual('TEST_VAL');
            });

            it('should set the `value` of its input to the value of its `value` property', async () => {
                await page.setContent('<zoo-input value="TEST_VAL_FROM_ATTR"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'value')).toEqual('TEST_VAL_FROM_ATTR');

                await page.evaluate(() => {
                    document.querySelector('zoo-input').value = 'TEST_VAL_FROM_PROP';
                });

                expect(await getProperty(input, 'value')).toEqual('TEST_VAL_FROM_PROP');
            });

            it('should update its `value` attribute when its input is updated', async () => {
                await page.setContent('<zoo-input></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');

                await input.type('TEST_USER_TYPED_VALUE');

                const attr = await page.evaluate((el) => {
                    return el.getAttribute('value');
                }, el);

                expect(attr).toEqual('TEST_USER_TYPED_VALUE');
            });

            it('should toggle its `--has-content` class based on the value of its input', async () => {
                await page.setContent('<zoo-input></zoo-input>');
                const el = await page.$('zoo-input');
                const inputValueToType = 'TEST_VALUE';

                let zooInputClassList = await getClassList(el);

                expect(zooInputClassList.includes('--has-content')).toBeFalsy();

                const input = await getElementFromShadow(page, el, 'input');

                await input.type(inputValueToType);

                zooInputClassList = await getClassList(el);

                expect(zooInputClassList.includes('--has-content')).toBeTruthy();

                await input.focus();

                for (let i = 0; i < inputValueToType.length; i++) {
                    await page.keyboard.press('Backspace');
                }

                zooInputClassList = await getClassList(el);

                expect(zooInputClassList.includes('--has-content')).toBeFalsy();
            });
        });

        describe('name', () => {
            it('should set the `name` of its input to the value of its `name` attribute', async () => {
                await page.setContent('<zoo-input name="TEST_NAME"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'name')).toEqual('TEST_NAME');
            });

            it('should set the `name` of its input to the value of its `name` property', async () => {
                await page.setContent('<zoo-input name="TEST_NAME_FROM_ATTR"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'name')).toEqual('TEST_NAME_FROM_ATTR');

                await page.evaluate((el) => {
                    el.name = 'TEST_NAME_FROM_PROP';
                }, el);

                expect(await getProperty(input, 'name')).toEqual('TEST_NAME_FROM_PROP');
            });
        });

        describe('readonly', () => {
            it('should set the `readonly` attribute of its input if its `readonly` attribute is set', async () => {
                await page.setContent('<zoo-input readonly></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'readOnly')).toEqual(true);
            });

            it('should set the `readOnly` property of its input if its `readOnly` property is set', async () => {
                await page.setContent('<zoo-input></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'readOnly')).toEqual(false);

                await page.evaluate((el) => {
                    el.readOnly = true;
                }, el);

                expect(await getProperty(input, 'readOnly')).toEqual(true);
            });
        });

        describe('disabled', () => {
            it('should set the `disabled` attribute of its input if its `disabled` attribute is set', async () => {
                await page.setContent('<zoo-input disabled></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'disabled')).toEqual(true);
            });

            it('should set the `disabled` property of its input if its `disabled` property is set', async () => {
                await page.setContent('<zoo-input></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'disabled')).toEqual(false);

                await page.evaluate((el) => {
                    el.disabled = true;
                }, el);

                expect(await getProperty(input, 'disabled')).toEqual(true);
            });
        });

        describe('required', () => {
            it('should set the `required` attribute of its input if its `required` attribute is set', async () => {
                await page.setContent('<zoo-input required></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');

                expect(await getProperty(input, 'required')).toEqual(true);
            });

            it('should set the `required` property of its input if its `required` property is set', async () => {
                await page.setContent('<zoo-input></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'required')).toEqual(false);

                await page.evaluate((el) => {
                    el.required = true;
                }, el);

                expect(await getProperty(input, 'required')).toEqual(true);
            });

            it('should add an asterisk to its label if its `required` attribute is set', async () => {
                await page.setContent('<zoo-input required></zoo-input>');

                const el = await page.$('zoo-input');

                const labelEl = await getElementFromShadow(page, el, '.label');
                const afterStyle = await getComputedStyleProperty(page, [labelEl, ':after'], 'content');

                expect(afterStyle).toBeDefined();
                expect(afterStyle).toMatch(/\*/);
            });
        });

        describe('autofocus', () => {
            it('should set the `autofocus` attribute of its input if its `autofocus` attribute is set', async () => {
                await page.setContent('<zoo-input autofocus></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'autofocus')).toEqual(true);
            });

            it('should set the `autofocus` property of its input if its `autofocus` property is set', async () => {
                await page.setContent('<zoo-input></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'autofocus')).toEqual(false);

                await page.evaluate(() => {
                    document.querySelector('zoo-input').autofocus = true;
                });

                expect(await getProperty(input, 'autofocus')).toEqual(true);
            });
        });

        describe('placeholder', () => {
            it('should set the `placeholder` of its input to the value of its `placeholder` attribute', async () => {
                await page.setContent('<zoo-input value="TEST_VAL"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'value')).toEqual('TEST_VAL');
            });

            it('should set the `placeholder` of its input to the value of its `placeholder` property', async () => {
                await page.setContent('<zoo-input placeholder="TEST_VAL_FROM_ATTR"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');
                expect(await getProperty(input, 'placeholder')).toEqual('TEST_VAL_FROM_ATTR');

                await page.evaluate((el) => {
                    el.placeholder = 'TEST_VAL_FROM_PROP';
                }, el);

                expect(await getProperty(input, 'placeholder')).toEqual('TEST_VAL_FROM_PROP');
            });
        });

        describe('type', () => {
            it('should set the `type` of its input to the value of its `type` attribute', async () => {
                await page.setContent('<zoo-input type="email"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');

                expect(await getProperty(input, 'type')).toEqual('email');
                expect(await getAttribute(page, input, 'type')).toEqual('email');
            });

            it('should remove the `type` attribute of its input if its `type` attribute is removed', async () => {
                await page.setContent('<zoo-input type="email"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');

                expect(await getAttribute(page, input, 'type')).toBeDefined();

                await page.evaluate(el => {
                    el.removeAttribute('type');
                }, el);

                expect(await getAttribute(page, input, 'type')).toBeNull();
            });

            describe('[type=hidden]', () => {
                it('should hide the element if its `type` attribute is set to `hidden`', async () => {
                    await page.setContent('<zoo-input type="hidden"></zoo-input>');

                    const el = await page.$('zoo-input');

                    const displayStyle = await getComputedStyleProperty(page, el, 'display');

                    expect(displayStyle).toEqual('none');
                });

                it('should hide the element if its `type` property is set to `hidden`', async () => {
                    await page.setContent('<zoo-input></zoo-input>');

                    const el = await page.$('zoo-input');

                    let displayStyle;
                    displayStyle = await getComputedStyleProperty(page, el, 'display');

                    expect(displayStyle).toEqual('flex');

                    await page.evaluate((el)  => {
                        el.type = 'hidden';
                    }, el);

                    displayStyle = await getComputedStyleProperty(page, el, 'display');

                    expect(displayStyle).toEqual('none');
                });
            });

            describe('[type=text] (default)', () => {
                it('should clear the input if the right icon is clicked', async () => {
                    await page.setContent('<zoo-input></zoo-input>');

                    const el = await page.$('zoo-input');
                    const input = await getElementFromShadow(page, el, 'input');

                    await input.type('TEST_VALUE');

                    let inputValue = await getProperty(input, 'value');

                    expect(inputValue).toEqual('TEST_VALUE');

                    const clearInputIcon = await getElementFromShadow(page, el, 'slot[name=right-icon-clear-input]');

                    await clearInputIcon.click();

                    inputValue = await getProperty(input, 'value');

                    expect(inputValue).toEqual('');
                });
            });

            describe('[type=password]', () => {
                it('should not display the `clear-input-icon` if its `type` is set to `password`', async () => {
                    await page.setContent('<zoo-input type="password"></zoo-input>');

                    const el = await page.$('zoo-input');

                    const clearInputIcon = await getElementFromShadow(page, el, 'slot[name=right-icon-clear-input]');

                    const clearInputIconDisplay = await page.evaluate((clearInputIcon) => {
                        return getComputedStyle(clearInputIcon).getPropertyValue('display');

                    }, clearInputIcon);

                    expect(clearInputIconDisplay).toEqual('none');
                });

                it('should toggle the display of its right icon password slots when its right icon slot is clicked', async () => {
                    await page.setContent('<zoo-input type="password"></zoo-input>');

                    const el = await page.$('zoo-input');

                    let showPasswordIconDisplay;
                    let hidePasswordIconDisplay;

                    const showPasswordIcon = await getElementFromShadow(page, el, 'slot[name=right-icon-show-password]');
                    const hidePasswordIcon = await getElementFromShadow(page, el, 'slot[name=right-icon-hide-password]');

                    showPasswordIconDisplay = await getComputedStyleProperty(page, showPasswordIcon, 'display');
                    hidePasswordIconDisplay = await getComputedStyleProperty(page, hidePasswordIcon, 'display');

                    expect(showPasswordIconDisplay).toEqual('flex');
                    expect(hidePasswordIconDisplay).toEqual('none');

                    await showPasswordIcon.click();

                    showPasswordIconDisplay = await getComputedStyleProperty(page, showPasswordIcon, 'display');
                    hidePasswordIconDisplay = await getComputedStyleProperty(page, hidePasswordIcon, 'display');

                    expect(showPasswordIconDisplay).toEqual('none');
                    expect(hidePasswordIconDisplay).toEqual('flex');
                });

                it('should toggle its input\'s type between `password` and `text` when its right icon is clicked', async () => {
                    await page.setContent('<zoo-input type="password"></zoo-input>');

                    const el = await page.$('zoo-input');

                    const input = await getElementFromShadow(page, el, 'input');

                    expect(await getProperty(input, 'type')).toEqual('password');
                    expect(await getAttribute(page, input, 'type')).toEqual('password');

                    const showPasswordIcon = await getElementFromShadow(page, el, 'slot[name=right-icon-show-password]');
                    const hidePasswordIcon = await getElementFromShadow(page, el, 'slot[name=right-icon-hide-password]');

                    await showPasswordIcon.click();

                    expect(await getProperty(input, 'type')).toEqual('text');
                    expect(await getAttribute(page, input, 'type')).toEqual('text');

                    await hidePasswordIcon.click();

                    expect(await getProperty(input, 'type')).toEqual('password');
                    expect(await getAttribute(page, input, 'type')).toEqual('password');

                    await showPasswordIcon.click();

                    expect(await getProperty(input, 'type')).toEqual('text');
                    expect(await getAttribute(page, input, 'type')).toEqual('text');
                });
            });
        });

        describe('autocomplete', () => {
            it('should set the `autocomplete` attribute of its input if its `autocomplete` attribute is set', async () => {
                await page.setContent('<zoo-input autocomplete="on"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');

                expect(await getAttribute(page, input, 'autocomplete')).toEqual('on');
            });

            it('should set the `autocomplete` attribute of its input if its `autocomplete` property is set', async () => {
                await page.setContent('<zoo-input></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');

                expect(await getAttribute(page, input, 'autocomplete')).toBeNull();

                await page.evaluate(el => {
                    el.autocomplete = 'off';
                }, el);

                expect(await getAttribute(page, input, 'autocomplete')).toBeDefined();
                expect(await getAttribute(page, input, 'autocomplete')).toEqual('off');
            });

            it('should remove the `autocomplete` attribute of its input if its `autocomplete` attribute is removed', async () => {
                await page.setContent('<zoo-input autocomplete></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');

                expect(await getAttribute(page, input, 'autocomplete')).toBeDefined();

                await page.evaluate(el => {
                    el.removeAttribute('autocomplete');
                }, el);

                expect(await getAttribute(page, input, 'autocomplete')).toBeNull();
            });
        });

        describe('label', () => {
            it('should set the innerHTML of its label to the value of its `label` attribute', async () => {
                await page.setContent('<zoo-input label="TEST_VAL"></zoo-input>');

                const el = await page.$('zoo-input');

                const label = await getElementFromShadow(page, el, '.label');
                expect(await getProperty(label, 'innerHTML')).toEqual('TEST_VAL');
            });

            it('should set the innerHTML of its label to the value of its `label` property', async () => {
                await page.setContent('<zoo-input label="TEST_VAL_FROM_ATTR"></zoo-input>');

                const el = await page.$('zoo-input');

                const label = await getElementFromShadow(page, el, '.label');
                expect(await getProperty(label, 'innerHTML')).toEqual('TEST_VAL_FROM_ATTR');

                await page.evaluate((el) => {
                    el.label = 'TEST_VAL_FROM_PROP';
                }, el);

                expect(await getProperty(label, 'innerHTML')).toEqual('TEST_VAL_FROM_PROP');
            });

            it('should not display a label if its placeholder is set', async () => {
                let labelElement;
                let labelElementDisplay;
                let el;

                await page.setContent('<zoo-input label="TEST_LABEL" placeholder="TEST_PLACEHOLDER"></zoo-input>');

                el = await page.$('zoo-input');

                labelElement = await getElementFromShadow(page, el, '.label');
                labelElementDisplay = await getComputedStyleProperty(page, labelElement, 'display');

                expect(labelElementDisplay).toEqual('none');

                await page.setContent('<zoo-input label="TEST_LABEL"></zoo-input>');

                el = await page.$('zoo-input');

                labelElement = await getElementFromShadow(page, el, '.label');
                labelElementDisplay = await getComputedStyleProperty(page, labelElement, 'display');

                expect(labelElementDisplay).toEqual('block');

                await page.evaluate((el) => {
                    el.placeholder = 'TEST_PLACEHOLDER';
                }, el);

                labelElementDisplay = await getComputedStyleProperty(page, labelElement, 'display');

                expect(labelElementDisplay).toEqual('none');
            });

            it('should not display a label if its `label` attribute does not have a value', async () => {
                await page.setContent('<zoo-input label=""></zoo-label>');
                const el = await page.$('zoo-input');
                const labelDisplay = await page.evaluate((el) => {
                    return getComputedStyle(el.shadowRoot.querySelector('.label')).getPropertyValue('display');
                }, el);

                expect(labelDisplay).toEqual('none');
            });

            it('should set its `--has-valid-label` class if its `label` attribute has a value its `placholder` attribute is not set', async () => {
                await page.setContent('<zoo-input label="TEST_VALUE"></zoo-label>');
                const el = await page.$('zoo-input');

                const zooInputClassList = await getClassList(el);
                expect(zooInputClassList.includes('--has-valid-label')).toBeTruthy();
            });

            it('should not set its `--has-valid-label` class if its `label` attribute has a value its `placholder` attribute is set', async () => {
                await page.setContent('<zoo-input label="TEST_LABEL" placeholder="TEST_PLACEHOLDER"></zoo-label>');
                const el = await page.$('zoo-input');

                const zooInputClassList = await getClassList(el);
                expect(zooInputClassList.includes('--has-valid-label')).toBeFalsy();
            });

            it('should not set its `--has-valid-label` class if its `label` attribute does not have a value', async () => {
                await page.setContent('<zoo-input label=""></zoo-label>');
                const el = await page.$('zoo-input');

                const zooInputClassList = await getClassList(el);
                expect(zooInputClassList.includes('--has-valid-label')).toBeFalsy();
            });

            it('should not set its `--has-valid-label` class if its `label` attribute is not set', async () => {
                await page.setContent('<zoo-input></zoo-label>');
                const el = await page.$('zoo-input');

                const zooInputClassList = await getClassList(el);
                expect(zooInputClassList.includes('--has-valid-label')).toBeFalsy();
            });

            it('should not set a `label` attribute on its input if its `label` attribute is set', async () => {
                await page.setContent('<zoo-input label="TEST_LABEL"></zoo-input>');

                const el = await page.$('zoo-input');

                const input = await getElementFromShadow(page, el, 'input');

                expect(await getAttribute(page, input, 'label')).toBeNull();
            });

            it('should not set a `label` attribute on its input if its `label` property is set', async () => {
                await page.setContent('<zoo-input></zoo-input>');

                const el = await page.$('zoo-input');

                await page.evaluate((el) => {
                    el.label = 'TEST_LABEL';
                }, el);

                const input = await getElementFromShadow(page, el, 'input');

                expect(await getAttribute(page, input, 'label')).toBeNull();
            });
        });
    });

    describe('focus', () => {
        it('should focus its input when it is clicked anywhere', async () => {
            await page.setContent(`
                <zoo-input>
                    <i slot="left-icon">LEFT_ICON</i>
                </zoo-input>`
            );

            const el = await page.$('zoo-input');

            await page.mouse.click(20, 20); // This click will happen on the left-icon

            await page.keyboard.type('THIS TEXT WILL BE ADDED TO THE INPUT IF IT GOT FOCUS FROM THE MOUSE CLICK');

            const input = await getElementFromShadow(page, el, 'input');

            expect(await getProperty(input, 'value')).toEqual('THIS TEXT WILL BE ADDED TO THE INPUT IF IT GOT FOCUS FROM THE MOUSE CLICK');
        });

        it('should toggle its `--active` class based on its input\'s focus state', async () => {
            await page.setContent(`
                <zoo-input></zoo-input>
                <span>CLICK_TO_LOSE_FOCUS</span>
            `);
            const el = await page.$('zoo-input');
            const span = await page.$('span');
            const input = await getElementFromShadow(page, el, 'input');

            let zooInputClassList = await page.evaluate((el) => Array.from(el.classList), el);

            expect(zooInputClassList.includes('--active')).toBeFalsy();

            await input.focus();

            zooInputClassList = await page.evaluate((el) => Array.from(el.classList), el);

            expect(zooInputClassList.includes('--active')).toBeTruthy();

            await span.click();

            zooInputClassList = await page.evaluate((el) => Array.from(el.classList), el);

            expect(zooInputClassList.includes('--active')).toBeFalsy();
        });
    });

    describe('icons', () => {
        it('should display icons', async () => {
            await page.setContent('<zoo-input></zoo-input>');
            const el = await page.$('zoo-input');

            const iconDisplays = await page.evaluate((el) => {
                const iconSlots = el.shadowRoot.querySelectorAll('slot[name*=icon]');
                const iconDisplayStyles = Array.from(iconSlots).map((slot) => {
                    return getComputedStyle(slot).getPropertyValue('display');
                });

                return iconDisplayStyles;
            }, el);

            expect(iconDisplays).toEqual(['flex', 'flex', 'none', 'none']);
        });

        it('should not display icons if its `noicons` attribute is set', async () => {
            await page.setContent('<zoo-input noicons></zoo-input>');
            const el = await page.$('zoo-input');

            const iconDisplays = await page.evaluate((el) => {
                const iconSlots = el.shadowRoot.querySelectorAll('slot[name*=icon]');
                const iconDisplayStyles = Array.from(iconSlots).map((slot) => {
                    return getComputedStyle(slot).getPropertyValue('display');
                });

                return iconDisplayStyles;
            }, el);

            expect(iconDisplays).toEqual(['none', 'none', 'none', 'none']);
        });

        it('should not display icons if its `noicons` property is set to `true`', async () => {
            await page.setContent('<zoo-input></zoo-input>');
            const el = await page.$('zoo-input');

            await page.evaluate((el) => el.noIcons = true, el);

            const iconDisplays = await page.evaluate((el) => {
                const iconSlots = el.shadowRoot.querySelectorAll('slot[name*=icon]');
                const iconDisplayStyles = Array.from(iconSlots).map((slot) => {
                    return getComputedStyle(slot).getPropertyValue('display');
                });

                return iconDisplayStyles;
            }, el);

            expect(iconDisplays).toEqual(['none', 'none', 'none', 'none']);
        });

        it('should let you replace default icons with slotted content', async () => {
            await page.setContent(`
                <zoo-input>
                    <span slot="left-icon">TEST</span>
                </zoo-input>`);
            const el = await page.$('zoo-input');
            const slottedContent = await page.evaluate((el) => {
                return el.shadowRoot.querySelector('slot[name=left-icon]').assignedNodes()[0].outerHTML;
            }, el);

            expect(slottedContent).toEqual('<span slot="left-icon">TEST</span>');
        });

        it('should not set a `noicons` attribute on its input if its `noicons` attribute is set', async () => {
            await page.setContent('<zoo-input noicons></zoo-input>');

            const el = await page.$('zoo-input');

            const input = await getElementFromShadow(page, el, 'input');

            expect(await getAttribute(page, input, 'noicons')).toBeNull();
        });

        it('should not set a `noicons` attribute on its input if its `noicons` property is set', async () => {
            await page.setContent('<zoo-input></zoo-input>');

            const el = await page.$('zoo-input');

            await page.evaluate((el) => {
                el.noicons = true;
            }, el);

            const input = await getElementFromShadow(page, el, 'input');

            expect(await getAttribute(page, input, 'noicons')).toBeNull();
        });
    });
});
