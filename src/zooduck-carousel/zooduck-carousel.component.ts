import { style } from './zooduck-carousel.style';
import  './prototype/Number/to-positive';
import { wait, isTap, PointerEventDetails, EventDetails } from '../utils/index'; // eslint-disable-line no-unused-vars

interface Slide {
    id: number;
    index: number;
    el: HTMLElement;
}

interface TouchStartData {
    timeStamp: number;
    clientX: number;
    clientY: number;
}

interface TouchMoveData {
    initialDirection: 'vertical'|'horizontal';
    distanceX: number;
    distanceY: number;
}

interface PointerEvents {
    pointerdown: EventDetails[];
}

type Loading = 'eager'|'lazy';

const tagName = 'zooduck-carousel';
const requiredSlotMissingError = (slotName: string) => {
    return `
${tagName} failed to render. No slotted content for "${slotName}" was found.
-----------------------------------
Slotted content can be added like:
-----------------------------------
<${tagName}>
    <div slot="slides">
        <div>SLIDE_ONE_CONTENT</div>
        <div>SLIDE_TWO_CONTENT</div>
        ...
    </div>
<\\${tagName}>
-----------------------------------
    `.trim();
};

export class HTMLZooduckCarouselElement extends HTMLElement {
    private _container: HTMLElement;
    private _currentOffsetX: number;
    private _currentslide: string;
    private _currentSlide: Slide;
    private _imagesToLoad: HTMLImageElement[];
    private _imageIntersectionObserver: IntersectionObserver;
    private _loading: Loading;
    private _maxOffsetX: number;
    private _minPixelsMovementRequiredToRegisterMove: number;
    private _pointerEventDetails: PointerEventDetails;
    private _pointerEvents: PointerEvents;
    private _slides: Slide[];
    private _slideSelectors: HTMLElement;
    private _touchActive: boolean;
    private _touchMoveData: TouchMoveData;
    private _touchMoveInProgress: boolean;
    private _touchStartData: TouchStartData;
    private _transitionSpeedInMillis: number;

    constructor() {
        super();

        this._currentOffsetX = 0;
        this._minPixelsMovementRequiredToRegisterMove = 10;
        this._imageIntersectionObserver = new IntersectionObserver(this._imageIntersectionObserverCallback, {
            root: null,
            threshold: [.1],
        });
        this._imagesToLoad = [];
        this._loading = 'lazy';
        this._maxOffsetX = 0;
        this._pointerEventDetails = new PointerEventDetails();
        this._pointerEvents = {
            pointerdown: [],
        };
        this._slides = [];
        this._touchMoveInProgress = false;
        this._touchMoveData = {
            initialDirection: null,
            distanceX: 0,
            distanceY: 0,
        };
        this._touchStartData = {
            timeStamp: 0,
            clientX: 0,
            clientY: 0,
        };
        this._transitionSpeedInMillis = 250;

        this.attachShadow({ mode: 'open' });

        const styleEl = document.createElement('style');
        styleEl.textContent = style({
            transitionSpeed: this._transitionSpeedInMillis,
        });

        const slideSelectorsSlot = document.createElement('slot');
        slideSelectorsSlot.name = 'slide-selectors';

        const slidesSlot = document.createElement('slot');
        slidesSlot.name = 'slides';

        this.shadowRoot.appendChild(styleEl);
        this.shadowRoot.appendChild(slideSelectorsSlot);
        this.shadowRoot.appendChild(slidesSlot);

        this._registerEvents();
    }

    static get observedAttributes(): string[] {
        return [
            'currentslide',
            'loading',
        ];
    }

    public set currentslide(slideNumber: any) {
        this._currentslide = slideNumber;
        this._syncAttr('currentslide', slideNumber);

        const slideIndex = parseInt(slideNumber, 10) - 1;
        const requestedSlide = this._slides[slideIndex];

        if (!requestedSlide) {
            return;
        }

        this._setCurrentSlide(requestedSlide.index);
        this._slideIntoView(requestedSlide, false);
    }

    public get currentslide(): any {
        return this._currentslide;
    }

    public set loading(val: Loading) {
        this._loading = val;
        this._syncAttr('loading', val);
    }

    public get loading(): Loading {
        return this._loading;
    }

    private _getMaxNegativeOffsetX(): number {
        const slides = this._slides.slice(0, -1);

        let maxNegativeOffsetX = 0;
        slides.forEach(slide => maxNegativeOffsetX -= slide.el.offsetWidth);

        return maxNegativeOffsetX;
    }

    private _getPlaceholder() {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const placeholder = canvas.toDataURL('image/png');

        return placeholder;
    }

    private _getPrecedingSlideWidths(nextSlide: Slide) {
        const precedingSlides = this._slides.filter((slide: Slide) => {
            return slide.index < nextSlide.index;
        });

        if (!precedingSlides.length) {
            return 0;
        }

        const precedingSlideWidths = precedingSlides.map((slide: Slide) => {
            return slide.el.offsetWidth;
        }).reduce((total: number, offsetWidth: number) => {
            return total + offsetWidth;
        });

        return precedingSlideWidths;
    }

    private _getRandomRGBA(): string {
        const r = Math.round(Math.random() * 255);
        const g = Math.round(Math.random() * 255);
        const b = Math.round(Math.random() * 255);
        const a = .62;

        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    private _getSlideSelectorsHeight(): number {
        const slideSelectorsHeight = this._slideSelectors
            ? this._slideSelectors.offsetHeight
            : 0;

        return slideSelectorsHeight;
    }

    private _imageIntersectionObserverCallback: IntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
            if (entry.isIntersecting) {
                const imageToLoad = this._imagesToLoad.find((img) => {
                    return entry.target == img;
                });

                if (!imageToLoad) {
                    return;
                }

                const imageLoader = new Image();

                imageLoader.onload = () => {
                    imageToLoad.src = imageToLoad.dataset.src;
                    const imagesToLoadIndex = this._imagesToLoad.findIndex((img: HTMLImageElement) => {
                        return imageToLoad === img;
                    });
                    this._imagesToLoad.splice(imagesToLoadIndex, 1);
                };

                imageLoader.src = imageToLoad.dataset.src;
            }
        });
    }

    private _isDoubleTap(lastTwoPointerdownTimeStamps: number[]): boolean {
        if (lastTwoPointerdownTimeStamps.length < 2) {
            return false;
        }

        const secondToLastPointerdownTime = lastTwoPointerdownTimeStamps[0];
        const lastPointerdownTime = lastTwoPointerdownTimeStamps[1];
        const maxTimeBetweenPointerDown = 250;

        return (lastPointerdownTime - secondToLastPointerdownTime) < maxTimeBetweenPointerDown;
    }

    private _isSwipeValid(distanceX: number) {
        const minTravel = 50;
        const isSwipeValid = distanceX.toPositive() > minTravel;

        return isSwipeValid;
    }

    private _isTouchMoveRecognised() {
        const totalPixelsTravelled = this._touchMoveData.distanceX.toPositive() + this._touchMoveData.distanceY.toPositive();

        return totalPixelsTravelled > this._minPixelsMovementRequiredToRegisterMove;
    }

    private _lazyLoad(img: HTMLImageElement) {
        img.dataset.src = img.src;
        // If we set the src to '' the browser will display a broken image icon
        img.src = this._getPlaceholder();

        this._imagesToLoad.push(img);

        // IntersectionObserver needs something to observe
        // (1px should be good enough - using 10px to be safe)
        img.style.minWidth = '10px';
        img.style.minHeight = '10px';

        this._imageIntersectionObserver.observe(img);
    }

    private _onCurrentSlideChange(): void {
        this.dispatchEvent(new CustomEvent('slidechange', {
            detail: {
                currentSlide: this._currentSlide,
            },
        }));
    }

    private _onResize() {
        this._setContainerStyle();
        this._slideIntoView(this._currentSlide);
    }

    private _onSwipeLeft() {
        const nextSlide = this._slides[this._currentSlide.index + 1];

        if (!nextSlide) {
            return;
        }

        this._setCurrentSlide(nextSlide.index);
        this._slideIntoView(nextSlide);
    }

    private _onSwipeRight() {
        const nextSlide = this._slides[this._currentSlide.index - 1];

        if (!nextSlide) {
            return;
        }

        this._setCurrentSlide(nextSlide.index);
        this._slideIntoView(nextSlide);
    }

    private _onTouchStart(eventDetails: EventDetails) {
        const { clientX, clientY } = eventDetails;

        if ('PointerEvent' in window) {
            this.addEventListener('pointermove', (e: PointerEvent) => {
                const eventDetails = this._pointerEventDetails.fromPointer(e);
                this._onTouchMove(eventDetails);
            });
        } else if ('TouchEvent' in window) {
            this.addEventListener('touchmove', (e: TouchEvent) => {
                const eventDetails = this._pointerEventDetails.fromTouch(e);
                this._onTouchMove(eventDetails);
            });
        } else {
            this.addEventListener('mousemove', (e: MouseEvent) => {
                const eventDetails = this._pointerEventDetails.fromMouse(e);
                this._onTouchMove(eventDetails);
            });
        }

        this._pointerEvents.pointerdown.push(eventDetails);

        this._touchStartData = {
            timeStamp: new Date().getTime(),
            clientX,
            clientY,
        };

        this._touchMoveData.initialDirection = null;
        this._touchMoveData.distanceX = 0;
        this._touchMoveData.distanceY = 0;

        this._touchActive = true;
    }

    private _onTouchMove(eventDetails: EventDetails|any) {
        const { event: e, clientX, clientY } = eventDetails;

        e.preventDefault();

        if (!this._touchActive) {
            return;
        }

        const { initialDirection } = this._touchMoveData;
        this._touchMoveData.distanceX = (this._touchStartData.clientX - clientX);
        this._touchMoveData.distanceY = (this._touchStartData.clientY - clientY);

        if (!this._isTouchMoveRecognised() && !initialDirection) {
            return;
        }

        if (!initialDirection) {
            this._setInitialTouchMoveDirection();
        }

        if (this._touchMoveData.initialDirection === 'vertical') {
            this._setTouchActive(false);
            this._slideIntoView(this._currentSlide);

            return;
        }

        this._touchMoveInProgress = true;

        this._setTouchActive(true);

        const swipeDistance = clientX - this._touchStartData.clientX;
        const currentX = parseInt((swipeDistance + this._currentOffsetX).toString(), 10);

        this._slideTo(currentX);
    }

    private _onTouchCancel(eventDetails: EventDetails) {
        const { event: e } = eventDetails;

        e.preventDefault();

        this.removeEventListener('pointermove', this._onTouchMove);
        this.removeEventListener('touchmove', this._onTouchMove);
        this.removeEventListener('mousemove', this._onTouchMove);

        if (this._touchMoveInProgress) {
            this._setTouchActive(false);
            this._slideIntoView(this._currentSlide);
        }
    }

    private async _onTouchEnd(eventDetails: EventDetails) {
        const { event: e } = eventDetails;

        e.preventDefault();

        this._setTouchActive(false);

        this.removeEventListener('pointermove', this._onTouchMove);
        this.removeEventListener('touchmove', this._onTouchMove);
        this.removeEventListener('mousemove', this._onTouchMove);

        const lastTwoPointerdownTimeStamps = this._pointerEvents.pointerdown.slice(-2).map((eventDetails: EventDetails) => {
            const { timeStamp } = eventDetails;

            return timeStamp;
        });

        if (this._isDoubleTap(lastTwoPointerdownTimeStamps) && this.offsetHeight >= window.innerHeight) {
            this.scrollIntoView({ behavior: 'smooth' });
        }

        const { distanceX } = this._touchMoveData;

        if (!this._isSwipeValid(distanceX)) {
            this._slideIntoView(this._currentSlide);

            return;
        }

        const direction = distanceX < 0 ? 'right' : 'left';

        if (direction === 'left') {
            this._onSwipeLeft();
        }

        if (direction === 'right') {
            this._onSwipeRight();
        }

        this._setCarouselHeightToSlideHeight();
    }

    private _registerEvents() {
        window.addEventListener('resize', this._onResize.bind(this));

        if ('PointerEvent' in window) {
            this._registerPointerEvents();
        } else if ('TouchEvent' in window) {
            this._registerTouchEvents();
        } else {
            this._registerMouseEvents();
        }
    }

    private _registerMouseEvents() {
        this.addEventListener('mousedown', (e: MouseEvent) => {
            const eventDetails = this._pointerEventDetails.fromMouse(e);
            this._onTouchStart(eventDetails);
        });
        this.addEventListener('mouseup', (e: MouseEvent) => {
            const eventDetails = this._pointerEventDetails.fromMouse(e);
            this._onTouchEnd(eventDetails);
        });
        this.addEventListener('mouseleave', (e: MouseEvent) => {
            const eventDetails = this._pointerEventDetails.fromMouse(e);
            this._onTouchCancel(eventDetails);
        });
    }

    private _registerPointerEvents() {
        this.addEventListener('pointerdown', (e: PointerEvent) => {
            const eventDetails = this._pointerEventDetails.fromPointer(e);
            this._onTouchStart(eventDetails);
        });
        this.addEventListener('pointerup', (e: PointerEvent) => {
            const eventDetails = this._pointerEventDetails.fromPointer(e);
            this._onTouchEnd(eventDetails);
        });
        this.addEventListener('pointercancel', (e: PointerEvent) => {
            const eventDetails = this._pointerEventDetails.fromPointer(e);
            this._onTouchCancel(eventDetails);
        });
    }

    private _registerTouchEvents() {
        this.addEventListener('touchstart', (e: TouchEvent) => {
            const eventDetails = this._pointerEventDetails.fromTouch(e);
            this._onTouchStart(eventDetails);
        });
        this.addEventListener('touchend', (e: TouchEvent) => {
            const eventDetails = this._pointerEventDetails.fromTouch(e);
            this._onTouchEnd(eventDetails);
        });
        this.addEventListener('touchcancel', (e: TouchEvent) => {
            const eventDetails = this._pointerEventDetails.fromTouch(e);
            this._onTouchCancel(eventDetails);
        });
    }

    private _setCarouselHeightToSlideHeight() {
        this.style.height = `${this._currentSlide.el.offsetHeight + this._getSlideSelectorsHeight()}px`;

        // If the carousel is 100% width and the current slide exceeds the window.innerHeight
        // then the slide widths will each be reduced by a factor of the browser's scrollbar width
        this._slideIntoView(this._currentSlide);
    }

    private _setContainerStyle(): Promise<any> {
        Array.from(this._container.children).forEach((slide: HTMLElement) => {
            this._setSlideStyle(slide);
        });

        this._setCarouselHeightToSlideHeight();

        return Promise.resolve();
    }

    private _setCurrentSlide(slideIndex: number) {
        const requestedSlide = this._slides[slideIndex];

        if (!requestedSlide || requestedSlide === this._currentSlide) {
            return;
        }

        this._currentSlide = this._slides[slideIndex];

        this._onCurrentSlideChange();
    }

    private _setInitialTouchMoveDirection() {
        const { distanceX, distanceY } = this._touchMoveData;
        this._touchMoveData.initialDirection = distanceX.toPositive() < distanceY.toPositive()
            ? 'vertical'
            : 'horizontal';
    }

    private _setSlideStyle(slide: HTMLElement) {
        const slideStyles = {
            'box-sizing': 'border-box',
            width: '100%',
            overflow: 'hidden',
            'flex-shrink': '0',
        };
        Object.keys(slideStyles).forEach((prop: string) => {
            slide.style[prop] = slideStyles[prop];
        });
    }

    private _setTouchActive(bool: boolean) {
        this._touchActive = bool;

        switch (bool) {
        case true:
            this.classList.add('--touch-active');
            break;
        case false:
            this._touchMoveInProgress = false;
            this.classList.remove('--touch-active');
            break;
        default: // do nothing
        }
    }

    private _slideIntoView(slide: Slide, animate = true) {
        const offsetX = this._getPrecedingSlideWidths(slide) * -1;

        if (!animate) {
            this.classList.add('--no-animate');
        }

        this._slideTo(offsetX);
        this._currentOffsetX = offsetX;
    }

    private async _slideTo(offsetX: number) {
        const maxNegativeOffsetX = this._getMaxNegativeOffsetX();
        const translateX = offsetX > this._maxOffsetX
            ? 0
            : offsetX < maxNegativeOffsetX
                ? maxNegativeOffsetX
                : offsetX;

        this._container.style.transform = `translateX(${translateX}px)`;

        if (!this._touchActive) {
            await wait(this._transitionSpeedInMillis);

            this.classList.remove('--no-animate');
        }

    }

    private _syncAttr(name: string, val: string) {
        this.setAttribute(name, val);
    }

    public updateCarouselHeight() {
        this._setCarouselHeightToSlideHeight();
    }

    protected async connectedCallback() {
        // Required "slides" slot
        await wait(0); // without this timeout, puppeteer tests will fail (with requiredSlotMissingError)
        const requiredSlottedContent = this.querySelector('[slot=slides]');
        if (!requiredSlottedContent || !requiredSlottedContent.children.length) {
            throw Error(requiredSlotMissingError('slides'));
        }

        this._slides = Array.from(requiredSlottedContent.children)
            .map((slide: HTMLElement, i: number): Slide => {
                return {
                    id: i + 1,
                    index: i,
                    el: slide,
                };
            });

        // Optional "slide-selectors" slot
        const slideSelectorsSlot = this.querySelector('[slot=slide-selectors]');
        if (slideSelectorsSlot) {
            Array.from(this.querySelector('[slot=slide-selectors]').children)
                .map((item: HTMLElement, i: number) => {
                    item.addEventListener('pointerup', (e: PointerEvent) => {
                        e.preventDefault();

                        if (this._touchMoveInProgress) {
                            return;
                        }

                        this._setCurrentSlide(i);
                        this._setTouchActive(false);
                        this._setCarouselHeightToSlideHeight();
                        this._slideIntoView(this._currentSlide, false);
                    });
                });

            this._slideSelectors = slideSelectorsSlot as HTMLElement;
        }

        this._container = requiredSlottedContent as HTMLElement;

        const currentslideAttrAsIndex = parseInt(this._currentslide, 10) - 1;
        this._setCurrentSlide(currentslideAttrAsIndex || 0);

        setTimeout(() => {
            // Timeout neccessary or this._setContainerStyle() will be called
            // before the element has loaded.
            // ---------------------------------------------------------------------------------
            // According to MDN: The connectedCallback lifecycle callback is invoked each time
            // the custom element is appended into a document-connected element. This will
            // happen each time the node is moved, and may happen before the element's contents
            // have been fully parsed.
            // ----------------------------------------------------------------------------------
            this._setContainerStyle();

            this._slideIntoView(this._currentSlide, false);

            const images = Array.from(this._container.querySelectorAll('img'));

            images.forEach((img: HTMLImageElement) => {
                img.style.backgroundColor = this._getRandomRGBA();

                if (this._loading === 'eager') {
                    return;
                }

                this._lazyLoad(img);
            });

            this.dispatchEvent(new CustomEvent('load'));
        });
    }

    protected attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
        if (this[name] === newVal) {
            return;
        }

        this[name] = newVal;
    }
}

customElements.define(tagName, HTMLZooduckCarouselElement);
