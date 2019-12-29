const getAttribute = async (page, node, attr) => {
    const _attr = await page.evaluate((node, attr) => {
        return node.getAttribute(attr);
    }, node, attr);

    return _attr;
};

describe('<zooduck-radio>', () => {
    beforeAll(async () => {
        await page.goto(PATH);
    });

    it('should sync properties to attributes', async () => {
        await page.setContent('<zooduck-radio></zooduck-radio>');

        const el = await page.$('zooduck-radio');

        let checkedAttr = await getAttribute(page, el, 'checked');
        let nameAttr = await getAttribute(page, el, 'name');
        let sizeAttr = await getAttribute(page, el, 'size');
        let valueAttr = await getAttribute(page, el, 'value');

        expect(checkedAttr).toBeNull();
        expect(nameAttr).toBeNull();
        expect(sizeAttr).toBeNull();
        expect(valueAttr).toBeNull();

        await page.evaluateHandle((el) => {
            el.checked = true;
            el.name = 'name';
            el.size = 50;
            el.value = 'value';
        }, el);

        checkedAttr = await getAttribute(page, el, 'checked');
        nameAttr = await getAttribute(page, el, 'name');
        sizeAttr = await getAttribute(page, el, 'size');
        valueAttr = await getAttribute(page, el, 'value');

        expect(checkedAttr).toEqual('');
        expect(nameAttr).toEqual('name');
        expect(sizeAttr).toEqual('50');
        expect(valueAttr).toEqual('value');
    });

    it('should sync attributes to properties', async () => {
        await page.setContent('<zooduck-radio></zooduck-radio>');

        const el = await page.$('zooduck-radio');

        let checkedAttr = await getAttribute(page, el, 'checked');
        let nameAttr = await getAttribute(page, el, 'name');
        let sizeAttr = await getAttribute(page, el, 'size');
        let valueAttr = await getAttribute(page, el, 'value');

        expect(checkedAttr).toBeNull();
        expect(nameAttr).toBeNull();
        expect(sizeAttr).toBeNull();
        expect(valueAttr).toBeNull();

        await page.evaluateHandle((el) => {
            el.setAttribute('checked', '');
            el.setAttribute('name', 'name');
            el.setAttribute('size', '50');
            el.setAttribute('value', 'value');
        }, el);

        const propertyValues = await page.evaluate((el) => {
            return [
                el.checked,
                el.name,
                el.size,
                el.value
            ];
        }, el);

        const expectedPropertyValues = [
            '',
            'name',
            '50',
            'value',
        ];

        expect(propertyValues).toEqual(expectedPropertyValues);
    });
});
