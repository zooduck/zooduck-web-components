const getAttribute = async (page, node, attr) => {
    const _attr = await page.evaluate((node, attr) => {
        return node.getAttribute(attr);
    }, node, attr);

    return _attr;
};

describe('<zooduck-carousel>', () => {
    beforeAll(async () => {
        await page.goto(PATH);
    });

    it('should have a shadowRoot', async () => {
        await page.setContent(`
            <zooduck-carousel>
                <div slot="slides">
                    <div>SLIDE ONE</div>
                    <div>SLIDE TWO</div>
                </div>
            </zooduck-carousel>
        `);

        const el = await page.$('zooduck-carousel');

        const shadowRoot = await page.evaluate((el) => {
            return el.shadowRoot;
        }, el);

        expect(shadowRoot).not.toBeNull()
    });

    it('should sync properties to attributes', async () => {
        await page.setContent(`
            <zooduck-carousel>
                <div slot="slides">
                    <div>SLIDE ONE</div>
                    <div>SLIDE TWO</div>
                </div>
            </zooduck-carousel>
        `);

        const el = await page.$('zooduck-carousel');

        let currentSlideAttr = await getAttribute(page, el, 'currentslide');
        let loadingAttr = await getAttribute(page, el, 'loading');

        expect(currentSlideAttr).toBeNull();
        expect(loadingAttr).toBeNull();

        await page.evaluateHandle((el) => {
            el.currentslide = 2;
            el.loading = 'eager';
        }, el);

        currentSlideAttr = await getAttribute(page, el, 'currentslide');
        loadingAttr = await getAttribute(page, el, 'loading');

        expect(currentSlideAttr).toEqual('2');
        expect(loadingAttr).toEqual('eager');
    });

    it('should sync attributes to properties', async () => {
        await page.setContent(`
            <zooduck-carousel>
                <div slot="slides">
                    <div>SLIDE ONE</div>
                    <div>SLIDE TWO</div>
                </div>
            </zooduck-carousel>
        `);

        const el = await page.$('zooduck-carousel');

        let currentSlideAttr = await getAttribute(page, el, 'currentslide');
        let loadingAttr = await getAttribute(page, el, 'loading');

        expect(currentSlideAttr).toBeNull();
        expect(loadingAttr).toBeNull();

        await page.evaluateHandle((el) => {
            el.setAttribute('currentslide', '5');
            el.setAttribute('loading', 'eager');
        }, el);

        const propertyValues = await page.evaluate((el) => {
            return [
                el.currentslide,
                el.loading,
            ];
        }, el);

        const expectedPropertyValues = [
            '5',
            'eager',
        ];

        expect(propertyValues).toEqual(expectedPropertyValues);
    });

    it('should lazyload images by default', async () => {
        await page.setContent(`
            <zooduck-carousel>
                <div slot="slides">
                    <div>
                        <img src="https://picsum.photos/20/20" width="20" height="20" />
                    </div>
                    <div>
                        <img src="https://picsum.photos/40/40" width="40" height="40" />
                    </div>
                </div>
            </zooduck-carousel>
        `);

        const el = await page.$('zooduck-carousel');

        await page.waitFor(1000);

        const slideOneImageSrc = await page.evaluate((el) => {
            return el.querySelectorAll('img')[0].getAttribute('src');
        }, el);

        const slideOneImageDataSrc = await page.evaluate((el) => {
            return el.querySelectorAll('img')[0].getAttribute('data-src');
        }, el);

        expect(slideOneImageSrc).toEqual('https://picsum.photos/20/20');
        expect(slideOneImageDataSrc).toEqual('https://picsum.photos/20/20');

        let slideTwoImageSrc = await page.evaluate((el) => {
            return el.querySelectorAll('img')[1].getAttribute('src');
        }, el);

        let slideTwoImageDataSrc = await page.evaluate((el) => {
            return el.querySelectorAll('img')[1].getAttribute('data-src');
        }, el);

        const brokenImagePlaceholder = 'data:image/png;base64,';

        expect(slideTwoImageSrc).toContain(brokenImagePlaceholder);
        expect(slideTwoImageDataSrc).toEqual('https://picsum.photos/40/40');

        await page.evaluate((el) => {
            const offscreenImage = el.querySelectorAll('img')[1];
            offscreenImage.scrollIntoView();
        }, el);

        await page.waitFor(1000);

        slideTwoImageSrc = await page.evaluate((el) => {
            return el.querySelectorAll('img')[1].getAttribute('src');
        }, el);

        slideTwoImageDataSrc = await page.evaluate((el) => {
            return el.querySelectorAll('img')[1].getAttribute('data-src');
        }, el);

        expect(slideTwoImageSrc).toEqual('https://picsum.photos/40/40');
        expect(slideTwoImageDataSrc).toEqual('https://picsum.photos/40/40');
    });

    it('should not lazyload images if its `loading` attribute is set to eager', async () => {
        await page.setContent(`
            <zooduck-carousel loading="eager">
                <div slot="slides">
                    <div>
                        <img src="https://picsum.photos/20/20" width="20" height="20" />
                    </div>
                    <div>
                        <img src="https://picsum.photos/40/40" width="40" height="40" />
                    </div>
                </div>
            </zooduck-carousel>
        `);

        const el = await page.$('zooduck-carousel');

        await page.waitFor(1000);

        const slideTwoImageSrc = await page.evaluate((el) => {
            return el.querySelectorAll('img')[1].getAttribute('src');
        }, el);

        const slideTwoImageDataSrc = await page.evaluate((el) => {
            return el.querySelectorAll('img')[1].getAttribute('data-src');
        }, el);

        expect(slideTwoImageSrc).toEqual('https://picsum.photos/40/40');
        expect(slideTwoImageDataSrc).toBeNull();
    });

    it('should return a value for its `currentslide` property / attribute when it has not been set', async () => {
        await page.setContent(`
            <zooduck-carousel>
                <div slot="slides">
                    <div>SLIDE ONE</div>
                    <div>SLIDE TWO</div>
                </div>
            </zooduck-carousel>
        `);

        const el = await page.$('zooduck-carousel');

        const currentslide = await page.evaluate((el) => {
            return el.currentslide;
        }, el);

        expect(currentslide).toBeDefined();
        expect(currentslide).toEqual('1');
    });

    it('should set an `--active` modifier class on the slide selector relative to the currently selected slide', async () => {
        await page.setContent(`
            <zooduck-carousel>
                <div slot="slide-selectors">
                    <div>SLIDE SELECTOR ONE</div>
                    <div>SLIDE SELECTOR TWO</div>
                </div>
                <div slot="slides">
                    <div>SLIDE ONE</div>
                    <div>SLIDE TWO</div>
                </div>
            </zooduck-carousel>
        `);

        const el = await page.$('zooduck-carousel');

        let firstSlideSelectorClassList = await page.evaluate((el) => {
            return Array.from(el.querySelector('[slot=slide-selectors]').firstElementChild.classList);
        }, el);

        let secondSlideSelectorClassList = await page.evaluate((el) => {
            return Array.from(el.querySelector('[slot=slide-selectors]').children[1].classList);
        }, el);

        expect(firstSlideSelectorClassList).toEqual(['--active']);
        expect(secondSlideSelectorClassList).toEqual([]);

        await page.evaluate((el) => {
           el.currentslide = 2;
        }, el);

        firstSlideSelectorClassList = await page.evaluate((el) => {
            return Array.from(el.querySelector('[slot=slide-selectors]').firstElementChild.classList);
        }, el);

        secondSlideSelectorClassList = await page.evaluate((el) => {
            return Array.from(el.querySelector('[slot=slide-selectors]').children[1].classList);
        }, el);

        expect(firstSlideSelectorClassList).toEqual([]);
        expect(secondSlideSelectorClassList).toEqual(['--active']);
    });
});
