import {dateToInput} from "../../src/utils/dateFormatters";

describe('dateToInput', () => {
    describe('Common cases', () => {
        it('should return null for null input', () => {
            expect(dateToInput(null)).toBeNull();
        });

        it('should return null for invalid Date', () => {
            expect(dateToInput(new Date('invalid'))).toBeNull();
        });
    });

    describe('Valid dates formatting', () => {
        const testCases = [
            {
                input: new Date(2023, 0, 1), // 1 января 2023
                expected: '2023-01-01',
                description: 'first day of year'
            },
            {
                input: new Date(2023, 11, 31), // 31 декабря 2023
                expected: '2023-12-31',
                description: 'last day of year'
            },
            {
                input: new Date(2020, 1, 29), // 29 февраля 2020 (високосный год)
                expected: '2020-02-29',
                description: 'leap year date'
            },
            {
                input: new Date(2000, 0, 1), // 1 января 2000
                expected: '2000-01-01',
                description: 'year 2000'
            },
            {
                input: new Date(9999, 11, 31), // 31 декабря 9999
                expected: '9999-12-31',
                description: 'max supported date'
            },
            {
                input: new Date(1970, 0, 1), // 1 января 1970
                expected: '1970-01-01',
                description: 'Unix epoch start'
            }
        ];

        testCases.forEach(({ input, expected, description }) => {
            it(`should format ${description} correctly`, () => {
                expect(dateToInput(input)).toBe(expected);
            });
        });
    });

    describe('Edge cases', () => {
        const edgeCases = [
            {
                input: new Date(1970, 0, 1), // 1 января 1970 - начало дат для JavaScript
                expected: '1970-01-01',
                description: 'minimum year'
            },
            {
                input: new Date(10000, 0, 1), // 1 января 10000
                expected: '10000-01-01',
                description: 'year with 5 digits'
            },
            {
                input: new Date(2023, 0, 1, 23, 59, 59), // С временем в конце дня
                expected: '2023-01-01',
                description: 'date with time component'
            }
        ];

        edgeCases.forEach(({ input, expected, description }) => {
            it(`should handle ${description}`, () => {
                expect(dateToInput(input)).toBe(expected);
            });
        });
    });

    describe('Invalid dates', () => {
        const invalidCases = [
            {
                input: new Date(''),
                description: 'empty string date'
            },
            {
                input: new Date('invalid date'),
                description: 'invalid date string'
            },
            {
                input: new Date(NaN),
                description: 'NaN date'
            }
        ];

        invalidCases.forEach(({ input, description }) => {
            it(`should return null for ${description}`, () => {
                expect(dateToInput(input)).toBeNull();
            });
        });
    });

});