import { isTap } from './is-tap';

describe('isTap', () => {
    let lastPointerdownEvent;
    let pointerupEvent;

    it('should return true', () => {
        lastPointerdownEvent = {
            clientX: 0,
            timeStamp: 0,
        };
        pointerupEvent = {
            clientX: 9,
            timeStamp: 249,
        }

        expect(isTap(lastPointerdownEvent, pointerupEvent)).toBeTruthy();

        lastPointerdownEvent = {
            clientX: 9,
            timeStamp: 0,
        };
        pointerupEvent = {
            clientX: 0,
            timeStamp: 249,
        }

        expect(isTap(lastPointerdownEvent, pointerupEvent)).toBeTruthy();
    });

    it('should return false', () => {
        lastPointerdownEvent = {
            clientX: 0,
            timeStamp: 0,
        };
        pointerupEvent = {
            clientX: 9,
            timeStamp: 250,
        }

        expect(isTap(lastPointerdownEvent, pointerupEvent)).toBeFalsy();

        lastPointerdownEvent = {
            clientX: 0,
            timeStamp: 0,
        };
        pointerupEvent = {
            clientX: 11,
            timeStamp: 249,
        }

        expect(isTap(lastPointerdownEvent, pointerupEvent)).toBeFalsy();
    });
});
