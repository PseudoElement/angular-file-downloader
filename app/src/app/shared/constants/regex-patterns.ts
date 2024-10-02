export const START_WITH_LETTER_AND_ALLOWED_HAVE_DIGITS = '^[A-Za-z].*$';

export const REGEX_PATTERN_ERRORS = {
    [START_WITH_LETTER_AND_ALLOWED_HAVE_DIGITS]: 'Value has to start from letter and can contain letters and digits.'
} as const;

export type RegexPattern = keyof typeof REGEX_PATTERN_ERRORS;
