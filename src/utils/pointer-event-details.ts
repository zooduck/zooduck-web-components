export interface EventDetails {
    event: PointerEvent|MouseEvent|TouchEvent,
    clientX: number;
    clientY: number;
    timeStamp: number;
}

export class PointerEventDetails {
    public fromMouse(e: MouseEvent): EventDetails {
        const { clientX, clientY, timeStamp } = e;
        const pointerEventDetails = {
            event: e,
            clientX,
            clientY,
            timeStamp,
        };

        return pointerEventDetails;
    }

    public fromPointer(e: PointerEvent): EventDetails  {
        const { clientX, clientY, timeStamp } = e;
        const pointerEventDetails = {
            event: e,
            clientX,
            clientY,
            timeStamp,
        };

        return pointerEventDetails;
    }

    public fromTouch(e: TouchEvent): EventDetails {
        const { clientX, clientY } = e.changedTouches[0];
        const { timeStamp } = e;
        const pointerEventDetails = {
            event: e,
            clientX,
            clientY,
            timeStamp,
        };

        return pointerEventDetails;
    }
}
