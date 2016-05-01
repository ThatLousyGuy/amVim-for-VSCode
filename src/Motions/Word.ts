import {window, Position} from 'vscode';
import {Configuration} from '../Configuration';
import {Motion} from './Motion';

enum MotionWordDirection {Previous, Next};
enum MotionWordMatchKind {Start, End, Both};

enum MotionWordCharacterKind {Regular, WordSeparator, BlankSeparator}

export class MotionWord extends Motion {

    private static blankSeparators = ' \f\n\r\t\v​\u00a0\u1680​\u180e\u2000​-\u200a​\u2028\u2029\u202f\u205f​\u3000\ufeff';
    private static characterKinds: MotionWordCharacterKind[];

    private useBlankSeparatedStyle: boolean;
    private direction: MotionWordDirection;
    private matchKind: MotionWordMatchKind;

    // Configuration.getEditorSetting<string>('wordSeparators');

    static updateCharacterKinds(wordSeparators: string): void {
        const result: MotionWordCharacterKind[] = [];

        // Make array fast for ASCII text
        for (let chCode = 0; chCode < 256; chCode++) {
            result[chCode] = MotionWordCharacterKind.Regular;
        }

        for (let i = 0, len = wordSeparators.length; i < len; i++) {
            result[wordSeparators.charCodeAt(i)] = MotionWordCharacterKind.WordSeparator;
        }

        for (let i = 0, len = this.blankSeparators.length; i < len; i++) {
            result[this.blankSeparators.charCodeAt(i)] = MotionWordCharacterKind.BlankSeparator;
        }

        this.characterKinds = result;
    }

    constructor(args: {useBlankSeparatedStyle?: boolean} = {}) {
        super();
        args.useBlankSeparatedStyle = args.useBlankSeparatedStyle === undefined ? false : args.useBlankSeparatedStyle;

        this.useBlankSeparatedStyle = args.useBlankSeparatedStyle;
    }

    static nextStart(args: {useBlankSeparatedStyle?: boolean} = {}): Motion {
        const obj = new MotionWord(args);
        obj.direction = MotionWordDirection.Next;
        obj.matchKind = MotionWordMatchKind.Start;
        return obj;
    }

    static nextEnd(args: {useBlankSeparatedStyle?: boolean} = {}): Motion {
        const obj = new MotionWord(args);
        obj.direction = MotionWordDirection.Next;
        obj.matchKind = MotionWordMatchKind.End;
        return obj;
    }

    static prevStart(args: {useBlankSeparatedStyle?: boolean} = {}): Motion {
        const obj = new MotionWord(args);
        obj.direction = MotionWordDirection.Previous;
        obj.matchKind = MotionWordMatchKind.Start;
        return obj;
    }

    static prevEnd(args: {useBlankSeparatedStyle?: boolean} = {}): Motion {
        const obj = new MotionWord(args);
        obj.direction = MotionWordDirection.Previous;
        obj.matchKind = MotionWordMatchKind.End;
        return obj;
    }

    apply(from: Position, option: {isInclusive?: boolean, isChangeAction?: boolean} = {}): Position {
        option.isInclusive = option.isInclusive === undefined ? false : option.isInclusive;
        option.isChangeAction = option.isChangeAction === undefined ? false : option.isChangeAction;

        // Match both start and end if used in change action.
        if (option.isChangeAction && this.matchKind === MotionWordMatchKind.Start) {
            this.matchKind = MotionWordMatchKind.Both;
        }

        from = super.apply(from);

        const activeTextEditor = window.activeTextEditor;

        if (! activeTextEditor) {
            return from;
        }

        const document = activeTextEditor.document;

        let line = from.line;

        if (this.direction === MotionWordDirection.Next) {
            while (line < document.lineCount) {
                const text = document.lineAt(line).text;
                let character = line === from.line ? from.character : 0;

                while (character <= text.length) {
                    const characterKind = MotionWord.characterKinds[text.charCodeAt(character)];
                    if (characterKind === MotionWordCharacterKind.WordSeparator) {

                    }
                    else if (characterKind === MotionWordCharacterKind.BlankSeparator) {

                    }
                    else {

                    }
                    character++;
                }

                line++;
            }
        }

        // TODO: Move to next line if needed

        return from;
    }

}
