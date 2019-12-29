import { wait } from './wait';

jest.useFakeTimers();

describe('wait', () => {
    it('should return a Promise', () => {
        const promise = wait();
        expect(promise).toBeInstanceOf(Promise);
    });

    it('should call setTimeout with a delay equal to its optional delay arg, or `0` if no delay arg is passed', () => {
        const delay = 5000;

        wait(delay);
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), delay);

        wait();
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
    });
});
