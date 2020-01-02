const getAttribute = async (page, node, attr) => {
    const _attr = await page.evaluate((node, attr) => {
        return node.getAttribute(attr);
    }, node, attr);

    return _attr;
};
const getElementFromShadow = async (page, el, selector) => await page.evaluateHandle(shadowSelector, el, selector);
const shadowSelector = (el, selector) => el.shadowRoot.querySelector(selector);

describe('<zooduck-terminal>', () => {
    beforeAll(async () => {
        await page.goto(PATH);
    });

    it('should have a shadowRoot', async () => {
        await page.setContent('<zooduck-terminal></zooduck-terminal>');

        const el = await page.$('zooduck-terminal');

        const shadowRoot = await page.evaluate((el) => {
            return el.shadowRoot;
        }, el);

        expect(shadowRoot).not.toBeNull();
    });

    it('should sync properties to attributes', async () => {
        await page.setContent('<zooduck-terminal></zooduck-terminal>');

        const el = await page.$('zooduck-terminal');

        let cursorblinkspeedAttr = await getAttribute(page, el, 'cursorblinkspeed');
        let delayAttr = await getAttribute(page, el, 'delay');
        let fullstopintervalAttr = await getAttribute(page, el, 'fullstopinterval');
        let linemodeAttr = await getAttribute(page, el, 'linemode');
        let messageAttr = await getAttribute(page, el, 'message');
        let screenAttr = await getAttribute(page, el, 'screen');
        let typingspeedAttr = await getAttribute(page, el, 'typingspeed');
        let wordbreakintervalAttr = await getAttribute(page, el, 'wordbreakinterval');

        expect(cursorblinkspeedAttr).toBeNull();
        expect(delayAttr).toBeNull();
        expect(fullstopintervalAttr).toBeNull();
        expect(linemodeAttr).toBeNull();
        expect(messageAttr).toBeNull();
        expect(screenAttr).toBeNull();
        expect(typingspeedAttr).toBeNull();
        expect(wordbreakintervalAttr).toBeNull();

        await page.evaluateHandle((el) => {
            el.cursorblinkspeed = 100;
            el.delay = 200;
            el.fullstopinterval = 300;
            el.linemode = 'single';
            el.message = 'domper pomper dompety do';
            el.screen = 'retro';
            el.typingspeed = 400;
            el.wordbreakinterval = 500;
        }, el);

        cursorblinkspeedAttr = await getAttribute(page, el, 'cursorblinkspeed');
        delayAttr = await getAttribute(page, el, 'delay');
        fullstopintervalAttr = await getAttribute(page, el, 'fullstopinterval');
        linemodeAttr = await getAttribute(page, el, 'linemode');
        messageAttr = await getAttribute(page, el, 'message');
        screenAttr = await getAttribute(page, el, 'screen');
        typingspeedAttr = await getAttribute(page, el, 'typingspeed');
        wordbreakintervalAttr = await getAttribute(page, el, 'wordbreakinterval');

        expect(cursorblinkspeedAttr).toEqual('100');
        expect(delayAttr).toEqual('200');
        expect(fullstopintervalAttr).toEqual('300');
        expect(linemodeAttr).toEqual('single');
        expect(messageAttr).toEqual('domper pomper dompety do');
        expect(screenAttr).toEqual('retro');
        expect(typingspeedAttr).toEqual('400');
        expect(wordbreakintervalAttr).toEqual('500');
    });

    it('should sync attributes to properties', async () => {
        await page.setContent('<zooduck-terminal></zooduck-terminal>');

        const el = await page.$('zooduck-terminal');

        let cursorblinkspeedAttr = await getAttribute(page, el, 'cursorblinkspeed');
        let delayAttr = await getAttribute(page, el, 'delay');
        let fullstopintervalAttr = await getAttribute(page, el, 'fullstopinterval');
        let linemodeAttr = await getAttribute(page, el, 'linemode');
        let messageAttr = await getAttribute(page, el, 'message');
        let screenAttr = await getAttribute(page, el, 'screen');
        let typingspeedAttr = await getAttribute(page, el, 'typingspeed');
        let wordbreakintervalAttr = await getAttribute(page, el, 'wordbreakinterval');

        expect(cursorblinkspeedAttr).toBeNull();
        expect(delayAttr).toBeNull();
        expect(fullstopintervalAttr).toBeNull();
        expect(linemodeAttr).toBeNull();
        expect(messageAttr).toBeNull();
        expect(screenAttr).toBeNull();
        expect(typingspeedAttr).toBeNull();
        expect(wordbreakintervalAttr).toBeNull();


        await page.evaluateHandle((el) => {
            el.setAttribute('cursorblinkspeed', '100');
            el.setAttribute('delay', '200');
            el.setAttribute('fullstopinterval', '300');
            el.setAttribute('linemode', 'single');
            el.setAttribute('message', 'ik heb geen pistol');
            el.setAttribute('screen', 'retro');
            el.setAttribute('typingspeed', '400');
            el.setAttribute('wordbreakinterval', '500');
        }, el);

        const propertyValues = await page.evaluate((el) => {
            return [
                el.cursorblinkspeed,
                el.delay,
                el.fullstopinterval,
                el.linemode,
                el.message,
                el.screen,
                el.typingspeed,
                el.wordbreakinterval,
            ];
        }, el);

        const expectedPropertyValues = [
            '100',
            '200',
            '300',
            'single',
            'ik heb geen pistol',
            'retro',
            '400',
            '500',
        ];

        expect(propertyValues).toEqual(expectedPropertyValues);
    });

    it('should contain the correct number of word elements based on its `message` attribute / property', async () => {
        let message = 'dat was een super prima pomper domper';
        let wordCount = message.split(' ').length;

        await page.setContent(`
            <zooduck-terminal message="${message}"></zooduck-terminal>
        `);

        const el = await page.$('zooduck-terminal');

        let numberOfWordElements = await page.evaluate((el) => {
            return el.shadowRoot.querySelectorAll('.word').length;
        }, el);

        expect(numberOfWordElements).toEqual(wordCount);

        message =  'ik heb geen pistol';
        wordCount = message.split(' ').length;

        await page.evaluateHandle((el, message) => {
            el.message = message;
        }, el, message);

        numberOfWordElements = await page.evaluate((el) => {
            return el.shadowRoot.querySelectorAll('.word').length;
        }, el);

        expect(numberOfWordElements).toEqual(wordCount);
    });
});
