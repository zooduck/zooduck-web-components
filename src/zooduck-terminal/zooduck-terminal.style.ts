interface Options {
    blinkDuration: number;
}

export const style = (options: Options) => {
    const { blinkDuration } = options;

    return `
        @keyframes blink {
            0% {
                visibility: hidden;
            }
            49% {
                visibility: hidden;
            }
            50% {
                visibility: visible;
            }
            100% {
                visibility: visible;
            }

        }
        .--animate-blink {
            animation: blink ${blinkDuration}ms linear infinite;
        }
        @keyframes delayVisible {
            0% {
                width: 0;
            }
            100% {
                width: auto;
            }
        }
        .--animate-delay-visible {
            animation: delayVisible .25ms linear both;
        }
        .line {
            display: flex;
            flex-wrap: wrap;
            font-family: var(--font-family, 'Calibri', sans-serif);
            font-size: var(--font-size, 28px);
            font-weight: var(--font-weight, normal);
            letter-spacing: var(--letter-spacing, normal);
            color: var(--color, #fff);
            background-color: var(--background-color, #222);
            padding: var(--padding, 5px);
        }
        .word {
            display: flex;
        }
        .char {
            overflow: hidden;
        }
        .cursor:before {
            content: 'X';
            background-color: #fff;
            color: #fff;
        }
        slot,
        ::slotted(*) {
            display: none;
        }
    `;
};
