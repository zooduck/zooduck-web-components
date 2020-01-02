interface Options {
    blinkDuration: number;
    screenType: string;
}

export const style = (options: Options) => {
    const { blinkDuration, screenType } = options;
    let backgroundColorBase: string, colorBase: string, fontFamilyBase: string;

    switch (screenType) {
    case 'retro':
        backgroundColorBase = '#222';
        colorBase = 'mediumseagreen';
        fontFamilyBase = '"Courier New", "Courier", monospace';
        break;
    case 'modern':
        backgroundColorBase = '#222';
        colorBase = '#fff';
        fontFamilyBase = '"Courier New", "Courier", monospace';
        break;
    default:
        backgroundColorBase = '#222';
        colorBase = '#fff';
        fontFamilyBase = '"Courier New", "Courier", monospace';
    }

    return `
        @keyframes blink {
            0% {
                background-color: var(--background-color, ${backgroundColorBase});
                color: var(--background-color, ${backgroundColorBase});
            }
            49% {
                background-color: var(--background-color, ${backgroundColorBase});
                color: var(--background-color, ${backgroundColorBase});
            }
            50% {
                background-color: var(--color, ${colorBase});
                color: var(--color, ${colorBase});
            }
            100% {
                background-color: var(--color, ${colorBase});
                color: var(--color, ${colorBase});
            }
        }
        .--animate-blink {
            animation: blink ${blinkDuration}ms linear infinite;
        }
        @keyframes delayVisible {
            0% {
                width: 0;
                height: 0;
            }
            1% {
                width: auto;
                height: auto;
            }
            100% {
                width: auto;
                height: auto;
            }
        }
        .--animate-delay-visible {
            animation: delayVisible .25ms linear both;
        }
        @keyframes delayVisibleLine {
            0% {
                visbility: hidden;
                position: absolute;
                top: 0;
                left: 0;
            }
            1% {
                visibility: visible;
                position: static;
            }
            99% {
                visibility: visible;
                position: static;
                width: auto;
                height: auto;
            }
            100% {
                visibility: hidden;
                position: absolute;
                top: 0;
                left: 0;
                width: 0;
                height: 0;
            }
        }
        .--animate-delay-visible-line {
            visibility: hidden;
            animation: delayVisibleLine .25ms linear both;
        }
        @keyframes delayVisibleLastLine {
            0% {
                width: 0;
                height: 0;
            }
            1% {
                width: auto;
                height: auto;
            }
            100% {
                width: auto;
                height: auto;
            }
        }
        .--animate-delay-visible-last-line {
            animation: delayVisibleLastLine .25ms linear both;
        }
        :host {
            box-sizing: border-box;
            display: block;
            width: 100%;
            min-height: var(--height, 250px);
            overflow: hidden;
            background-color: var(--background-color, ${backgroundColorBase});
        }
        .lines {
            position: relative;
            padding: 10px;
            background-color: var(--background-color, ${backgroundColorBase});
        }
        .line {
            display: inline-flex;
            flex-wrap: wrap;
            width: auto;
            height: auto;
            overflow: hidden;
            font-family: var(--font-family, ${fontFamilyBase});
            font-size: var(--font-size, inherit);
            font-weight: var(--font-weight, normal);
            letter-spacing: var(--letter-spacing, normal);
            color: var(--color, ${colorBase});
            background-color: var(--background-color, ${backgroundColorBase});
        }
        .line-placeholder {
            display: inline-block;
            color: var(--background-color, ${backgroundColorBase});
            width: 1px;
        }
        .word {
            display: flex;
        }
        .char {
            width: 0;
            overflow: hidden;
        }
        .cursor {
            background-color: var(--color, ${colorBase});
            color: var(--color, ${colorBase});
        }
        .cursor:before {
            content: 'X';
        }
        slot,
        ::slotted(*) {
            display: none;
        }
    `;
};
