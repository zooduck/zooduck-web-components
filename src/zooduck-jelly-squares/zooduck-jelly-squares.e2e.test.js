const getAttribute = async (page, node, attr) => {
    const _attr = await page.evaluate((node, attr) => {
        return node.getAttribute(attr);
    }, node, attr);

    return _attr;
};
const getElementFromShadow = async (page, el, selector) => await page.evaluateHandle(shadowSelector, el, selector);
const shadowSelector = (el, selector) => el.shadowRoot.querySelector(selector);

describe('<zooduck-jelly-squares>', () => {
    beforeAll(async () => {
        await page.goto(PATH);

    });

    beforeEach(async () => {
        await page.setContent('<zooduck-jelly-squares></zooduck-jelly-squares>');
    });

    it('should have a shadowRoot', async () => {
        const el = await page.$('zooduck-jelly-squares');

        const shadowRoot = await page.evaluate((el) => {
            return el.shadowRoot;
        }, el);

        expect(shadowRoot).not.toBeNull();
    });

    it('should sync properties to attributes', async () => {
        const el = await page.$('zooduck-jelly-squares');

        let colorAttr = await getAttribute(page, el, 'color');
        let densityAttr = await getAttribute(page, el, 'density');
        let widthAttr = await getAttribute(page, el, 'width');
        let heightAttr = await getAttribute(page, el, 'height');

        expect(colorAttr).toBeNull();
        expect(densityAttr).toBeNull();
        expect(widthAttr).toBeNull();
        expect(heightAttr).toBeNull();

        await page.evaluateHandle((el) => {
            el.color = 'banana';
            el.density = 16;
            el.height = '100px';
            el.width = '200px';
        }, el);

        colorAttr = await getAttribute(page, el, 'color');
        densityAttr = await getAttribute(page, el, 'density');
        heightAttr = await getAttribute(page, el, 'height');
        widthAttr = await getAttribute(page, el, 'width');

        expect(colorAttr).toEqual('banana');
        expect(densityAttr).toEqual('16');
        expect(heightAttr).toEqual('100px');
        expect(widthAttr).toEqual('200px');
    });

    it('should sync attributes to properties', async () => {
        const el = await page.$('zooduck-jelly-squares');

        let colorAttr = await getAttribute(page, el, 'color');
        let densityAttr = await getAttribute(page, el, 'density');
        let widthAttr = await getAttribute(page, el, 'width');
        let heightAttr = await getAttribute(page, el, 'height');

        expect(colorAttr).toBeNull();
        expect(densityAttr).toBeNull();
        expect(widthAttr).toBeNull();
        expect(heightAttr).toBeNull();

        await page.evaluateHandle((el) => {
            el.setAttribute('color', 'banana');
            el.setAttribute('density', '16');
            el.setAttribute('height', '100px');
            el.setAttribute('width', '200px');
        }, el);

        const propertyValues = await page.evaluate((el) => {
            return [
                el.color,
                el.density,
                el.height,
                el.width,
            ];
        }, el);

        const expectedPropertyValues = [
            'banana',
            16,
            '100px',
            '200px',
        ];

        expect(propertyValues).toEqual(expectedPropertyValues);
    });
});
