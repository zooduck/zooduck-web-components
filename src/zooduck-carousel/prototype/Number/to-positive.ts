declare interface Number {
    toPositive: CallableFunction;
}

Number.prototype.toPositive = function (): number {
    return this < 0 ? (this * -1) : this;
};
