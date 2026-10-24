import Pattern from '../pattern/pattern';

export class Decoration {
    public readonly id: string;
    public readonly pattern: Pattern;
    public readonly colour: string;

    constructor(id: string, pattern: Pattern, colour: string) {
        this.id = id;
        this.pattern = pattern;
        this.colour = colour;
    }

    withCaseSensitivityToggled(): Decoration {
        return this.withPattern(this.pattern.toggleCaseSensitivity());
    }

    withWholeMatchToggled(): Decoration {
        return this.withPattern(this.pattern.toggleWholeMatch());
    }

    withPattern(newPattern: Pattern): Decoration {
        return new Decoration(this.id, newPattern, this.colour);
    }

    withColour(colour: string): Decoration {
        return new Decoration(this.id, this.pattern, colour);
    }
}
