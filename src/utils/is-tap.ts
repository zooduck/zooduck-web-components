interface EventDetail {
    event: PointerEvent|MouseEvent|TouchEvent,
    clientX: number;
    clientY: number;
    timeStamp: number;
}

export const isTap = (lastPointerdownEvent: EventDetail, pointerupEvent: EventDetail): boolean => {
    const maxInterval = 250;
    const maxDistance = 10;
    const distance = (lastPointerdownEvent.clientX - pointerupEvent.clientX);
    const positiveDistance = distance < 0 ? (distance * -1) : distance;

    if (positiveDistance > maxDistance) {
        return false;
    }

    return (pointerupEvent.timeStamp - lastPointerdownEvent.timeStamp) < maxInterval;
};
