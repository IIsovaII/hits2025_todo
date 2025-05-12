import {TodoPriority} from "../../src/models/todo";
import findMacro from "../../src/utils/findMacro";

describe("findMacro", () => {
    describe("Common cases", () => {
        // назхвание без макроса
        it("should return empty error and default priority for title without macros", () => {
            const result = findMacro("Simple title");
            expect(result).toEqual({
                title: "Simple title",
                deadline: null,
                priority: TodoPriority.MEDIUM,
                er: "",
            });
        });

        // пустой заголовок
        it("should return error for empty title", () => {
            const result = findMacro("");
            expect(result).toEqual({
                title: "",
                deadline: null,
                priority: TodoPriority.MEDIUM,
                er: "Пожалуйста, введите название задачи",
            });
        });
    });

    describe("Date macro processing", () => {
        const testCases = [
            {
                // валидная дата с точками
                input: "Task !before 31.12.2023",
                expected: {
                    title: "Task",
                    deadline: new Date(2023, 11, 31),
                    priority: TodoPriority.MEDIUM,
                    er: "",
                },
                description: "valid date with dots",
            },
            {
                // валидная дата с тире
                input: "Task !before 31-12-2023",
                expected: {
                    title: "Task",
                    deadline: new Date(2023, 11, 31),
                    priority: TodoPriority.MEDIUM,
                    er: "",
                },
                description: "valid date with dashes",
            },
            {
                // валидная дата
                input: "Task !before 29.02.2020",
                expected: {
                    title: "Task",
                    deadline: new Date(2020, 1, 29),
                    priority: TodoPriority.MEDIUM,
                    er: "",
                },
                description: "valid leap year date",
            },
            {
                // не валидная дата 31 апреля
                input: "Task !before 31.04.2023",
                expected: {
                    title: "Task !before 31.04.2023",
                    deadline: null,
                    priority: TodoPriority.MEDIUM,
                    er: "Указана некорректная дата deadline в макросе title",
                },
                description: "invalid date (April 31)",
            },
            {
                // не валидная дата 29 февраля для не високосного года
                input: "Task !before 29.02.2023",
                expected: {
                    title: "Task !before 29.02.2023",
                    deadline: null,
                    priority: TodoPriority.MEDIUM,
                    er: "Указана некорректная дата deadline в макросе title",
                },
                description: "invalid date (non-leap year Feb 29)",
            },
            {
                // буквы в макросе
                input: "Task !before ab.cd.efgh",
                expected: {
                    title: "Task !before ab.cd.efgh",
                    deadline: null,
                    priority: TodoPriority.MEDIUM,
                    er: ""
                    // "Текст визуально похожий на макрос",
                },
                description: "completely invalid date format",
            },
        ];

        testCases.forEach(({ input, expected, description }) => {
            it(`should handle ${description}`, () => {
                const result = findMacro(input);
                if (expected.deadline) {
                    expect(result.deadline?.getTime()).toBe(expected.deadline.getTime());
                    expect({
                        title: result.title,
                        priority: result.priority,
                        er: result.er
                    }).toEqual({
                        title: expected.title,
                        priority: expected.priority,
                        er: expected.er
                    });
                } else {
                    expect(result).toEqual(expected);
                }
            });
        });
    });

    describe("Priority macro processing", () => {
        const priorityTestCases = [
            {
                // валидная критическая приоритетность
                input: "Task !1",
                expected: {
                    title: "Task",
                    deadline: null,
                    priority: TodoPriority.CRITICAL,
                    er: "",
                },
                description: "CRITICAL priority",
            },
            {
                // валидная высокая приоритетность
                input: "Task !2",
                expected: {
                    title: "Task",
                    deadline: null,
                    priority: TodoPriority.HIGH,
                    er: "",
                },
                description: "HIGH priority",
            },
            {
                // валидная средняя приоритетность
                input: "Task !3",
                expected: {
                    title: "Task",
                    deadline: null,
                    priority: TodoPriority.MEDIUM,
                    er: "",
                },
                description: "MEDIUM priority",
            },
            {
                // валидная низкая приоритетность
                input: "Task !4",
                expected: {
                    title: "Task",
                    deadline: null,
                    priority: TodoPriority.LOW,
                    er: "",
                },
                description: "LOW priority",
            },
            {
                // не валидная приоритетность
                input: "Task !5",
                expected: {
                    title: "Task",
                    deadline: null,
                    priority: TodoPriority.MEDIUM,
                    er: "Указана некорректная priority в макросе title",
                },
                description: "invalid priority number",
            },
            {
                // не валидная приоритетность
                input: "Task !0",
                expected: {
                    title: "Task",
                    deadline: null,
                    priority: TodoPriority.MEDIUM,
                    er: "Указана некорректная priority в макросе title",
                },
                description: "zero priority number",
            },
            {
                // не валидная приоритетность
                input: "Task !-1",
                expected: {
                    title: "Task",
                    deadline: null,
                    priority: TodoPriority.MEDIUM,
                    er: "Указана некорректная priority в макросе title",
                },
                description: "negative priority number",
            },
        ];

        priorityTestCases.forEach(({ input, expected, description }) => {
            it(`should handle ${description}`, () => {
                expect(findMacro(input)).toEqual(expected);
            });
        });
    });

    describe("Combined macros processing", () => {
        // валидная дата и макрос
        it("should handle both date and priority macros", () => {
            const result = findMacro("Task !before 31.12.2023 !2");
            expect(result.title).toBe("Task");
            expect(result.deadline).toEqual(new Date(2023, 11, 31));
            expect(result.priority).toBe(TodoPriority.HIGH);
            expect(result.er).toBe("");
        });

        // невалидная только дата
        it("should handle invalid date with valid priority", () => {
            const result = findMacro("Task !1 !before 31.04.2023");
            expect(result.title).toBe("Task !1 !before 31.04.2023");
            expect(result.deadline).toBeNull();
            expect(result.priority).toBe(TodoPriority.MEDIUM);
            expect(result.er).toBe("Указана некорректная дата deadline в макросе title");
        });

        // невалидная только приоритетность
        it("should handle valid date with invalid priority", () => {
            const result = findMacro("Task !before 31.12.2023 !5");
            expect(result.title).toBe("Task");
            expect(result.deadline).toEqual(new Date(2023, 11, 31));
            expect(result.priority).toBe(TodoPriority.MEDIUM);
            expect(result.er).toBe("Указана некорректная priority в макросе title");
        });
    });

    describe("Boundary values for dates", () => {
        const boundaryTestCases = [
            {
                // самая маленькая валидная дата
                input: "!before 01.01.1970",
                expected: new Date(1970, 0, 1),
                description: "Unix epoch start date",
            },
            {
                // самая большая валидная дата
                input: "!before 31.12.9999",
                expected: new Date(9999, 11, 31),
                description: "Far future date",
            },
            {
                // слишком большой год
                input: "!before 01.01.100110",
                expected: null,
                description: "Year beyond valid range",
                errorExpected: true,
            },
            {
                // нулевой день
                input: "!before 00.01.2023",
                expected: null,
                description: "Day zero",
                errorExpected: true,
            },
            {
                // 32 день
                input: "!before 32.01.2023",
                expected: null,
                description: "Day overflow",
                errorExpected: true,
            },
            {
                // нулевой месяц
                input: "!before 01.00.2023",
                expected: null,
                description: "Month zero",
                errorExpected: true,
            },
            {
                // 13 месяц
                input: "!before 01.13.2023",
                expected: null,
                description: "Month overflow",
                errorExpected: true,
            },
        ];

        boundaryTestCases.forEach(({ input, expected, description, errorExpected }) => {
            it(`should handle ${description}`, () => {
                const result = findMacro(input);
                if (expected) {
                    expect(result.deadline?.getTime()).toBe(expected.getTime());
                    expect(result.er).toBe("");
                } else {
                    expect(result.deadline).toBeNull();
                    expect(result.er).toBe(
                        errorExpected
                            ? "Указана некорректная дата deadline в макросе title"
                            : ""
                    );
                }
            });
        });
    });
});