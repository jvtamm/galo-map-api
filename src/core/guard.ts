export interface IGuardResult {
    succeeded: boolean;
    message?: string;
}

export interface IGuardArgument {
    argument: any;
    argumentName: string;
}

export type GuardArgumentCollection = IGuardArgument[];

export class Guard {
    public static combine(guardResults: IGuardResult[]): IGuardResult {
        for (let i = 0; i < guardResults.length; i += 1) {
            const result = guardResults[i];
            if (result.succeeded === false) return result;
        }

        return { succeeded: true };
    }

    public static greaterThan(minValue: number, actualValue: number): IGuardResult {
        return actualValue > minValue
            ? { succeeded: true }
            : {
                succeeded: false,
                message: `Number given {${actualValue}} is not greater than {${minValue}}`,
            };
    }

    public static againstAtLeast(numChars: number, text: string, valueName?: string): IGuardResult {
        if (text && text.length >= numChars) {
            return {
                succeeded: true,
            };
        }

        const errorMessage = valueName ? `${valueName} is not at least ${numChars} chars.`
            : `Text is not at least ${numChars} chars.`;
        return {
            succeeded: false,
            message: errorMessage,
        };
    }

    public static againstAtMost(numChars: number, text: string, valueName?: string): IGuardResult {
        if (text && text.length <= numChars) {
            return { succeeded: true };
        }

        const errorMessage = valueName ? `${valueName} is greater than ${numChars} chars.`
            : `Text is not at least ${numChars} chars.`;

        return {
            succeeded: false,
            message: errorMessage,
        };
    }

    public static againstEmpty<T>(list: Array<T>, argumentName: string): IGuardResult {
        if (!list || !list.length) {
            return { succeeded: false, message: `${argumentName} is empty` };
        }

        return { succeeded: true };
    }

    public static againstNullOrUndefined(argument: any, argumentName: string): IGuardResult {
        if (argument === null || argument === undefined) {
            return { succeeded: false, message: `${argumentName} is null or undefined` };
        }
        return { succeeded: true };
    }

    public static againstNullOrUndefinedBulk(args: GuardArgumentCollection): IGuardResult {
        for (let i = 0; i < args.length; i += 1) {
            const arg = args[i];
            const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
            if (!result.succeeded) return result;
        }

        return { succeeded: true };
    }

    public static isOneOf(value: any, validValues: any[], argumentName: string): IGuardResult {
        let isValid = false;
        validValues.forEach((validValue) => {
            if (value === validValue) {
                isValid = true;
            }
        });

        if (isValid) {
            return { succeeded: true };
        }
        return {
            succeeded: false,
            message: `${argumentName} isn't oneOf the correct types in ${JSON.stringify(validValues)}. Got "${value}".`,
        };
    }

    public static againstRegex(value: string, pattern: RegExp | string, argumentName: string): IGuardResult {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

        if (!regex.test(value)) {
            return {
                succeeded: false,
                message: `${argumentName} is not a valid match to pattern ${pattern}.`,
            };
        }

        return { succeeded: true };
    }

    public static inRange(num: number, min: number, max: number, argumentName: string): IGuardResult {
        const isInRange = num >= min && num <= max;
        if (!isInRange) {
            return { succeeded: false, message: `${argumentName} is not within range ${min} to ${max}.` };
        }
        return { succeeded: true };
    }

    public static allInRange(numbers: number[], min: number, max: number, argumentName: string): IGuardResult {
        let failingResult: IGuardResult | null = null;

        numbers.forEach((num) => {
            const numIsInRangeResult = this.inRange(num, min, max, argumentName);
            if (!numIsInRangeResult.succeeded) failingResult = numIsInRangeResult;
        });

        if (failingResult) {
            return { succeeded: false, message: `${argumentName} is not within the range.` };
        }
        return { succeeded: true };
    }
}
