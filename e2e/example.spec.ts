import {test, expect} from '@playwright/test';

const new_unique = `${(new Date().toISOString())}`


test('try to create with 3 symbs', async ({page}) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', {name: 'Добавить задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill('abc');
    await page.getByRole('button', {name: 'Создать'}).click();
    await expect(page.locator('#swal2-validation-message')).toContainText('Минимальная длина название: 4 символа');
});

test('create with 4 symbs', async ({page}) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', {name: 'Добавить задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill(`${new_unique} abcd`);
    await page.getByRole('button', {name: 'Создать'}).click();
    await expect(page.getByRole('main')).toMatchAriaSnapshot(`
        - checkbox
        - heading "${new_unique} abcd" [level=4]
        - button "×"
        - text: MEDIUM ACTIVE
        `);
});

test('edit all attrs + next day deadline', async ({page}) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', {name: 'Добавить задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill(`${new_unique} abcd2`);
    await page.getByRole('button', {name: 'Создать'}).click();

    await page.getByText(`${new_unique} abcd2×MEDIUMACTIVE`).dblclick();
    await page.getByRole('button', {name: 'Редактировать задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill(`${new_unique} abcd_new`);
    await page.getByRole('textbox', {name: 'Описание:'}).click();
    await page.getByRole('textbox', {name: 'Описание:'}).fill('description');
    await page.getByRole('textbox', {name: 'Срок выполнения:'}).fill('2025-05-15');
    await page.getByLabel('Приоритет:').selectOption('LOW');
    await page.getByRole('button', {name: 'Изменить'}).click();

    const taskNameCell = page.locator(
        `tr:has(td.attribute-name:text("Название задачи:")) td.attribute-value:text("${new_unique} abcd_new")`
    );
    const taskTable = taskNameCell.locator('..').locator('..');
    const deadlineInSameTable = taskTable.locator('tr:has(td.attribute-name:text("Deadline:")) td.attribute-value.soon');
    await expect(deadlineInSameTable).toHaveCSS('background-color', 'rgb(255, 243, 224)');
    await expect(deadlineInSameTable).toBeVisible();
});

test('checking prev day deadline', async ({page}) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', {name: 'Добавить задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill(`${new_unique} abcd3`);
    await page.getByRole('button', {name: 'Создать'}).click();

    await page.getByText(`${new_unique} abcd3×MEDIUMACTIVE`).dblclick();

    await page.getByRole('button', {name: 'Редактировать задачу'}).click();
    await page.getByRole('textbox', {name: 'Срок выполнения:'}).fill('2025-05-01');
    await page.getByRole('button', {name: 'Изменить'}).click();
    await expect(page.getByRole('cell', {name: '1 мая 2025 г'})).toBeVisible();

    const taskNameCell = page.locator(
        `tr:has(td.attribute-name:text("Название задачи:")) td.attribute-value:text("${new_unique} abcd3")`
    );
    const taskTable = taskNameCell.locator('..').locator('..');
    const deadlineInSameTable = taskTable.locator('tr:has(td.attribute-name:text("Deadline:")) td.attribute-value.late');
    await expect(deadlineInSameTable).toHaveCSS('background-color', 'rgb(255, 235, 238)');
    await expect(deadlineInSameTable).toBeVisible();

    await expect(page.getByRole('table')).toContainText('OVERDUE');

})

test('checking status', async ({page}) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', { name: 'Добавить задачу' }).click();
    await page.getByRole('textbox', { name: 'Название:' }).fill(`${new_unique} abcd4`);
    await page.getByRole('textbox', { name: 'Срок выполнения:' }).fill('2025-05-01');
    await page.getByRole('button', { name: 'Создать' }).click();
    await page.getByText(`${new_unique} abcd4×MEDIUMOVERDUE1 мая 2025 г`).dblclick();

    await test.step("checking LATE", async () => {
        await page.locator('label').click();
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
        - checkbox "✓" [checked]
        - text: ✓
        - button "×"
        `);

        await expect(page.getByRole('table')).toContainText('LATE');
    })

    await test.step("checking OVERDUE", async () => {
        await page.locator('label').click();
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
        - checkbox
        - button "×"
        `);

        await expect(page.getByRole('table')).toContainText('OVERDUE');

        await page.locator('label').click();
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
        - checkbox "✓" [checked]
        - text: ✓
        - button "×"
        `);
    })

    await test.step("checking COMPLETED", async () => {
        await page.getByRole('button', {name: 'Редактировать задачу'}).click();
        await page.getByRole('textbox', {name: 'Срок выполнения:'}).fill('2025-05-31');
        await page.getByRole('button', {name: 'Изменить'}).click();

        const taskTable = page.locator('.attributes-table');
        const deadlineCell = taskTable.locator('tr:has(td.attribute-name:text("Deadline:")) td.attribute-value');
        await expect(deadlineCell).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

        await expect(page.getByRole('cell', {name: '31 мая 2025 г'})).toBeVisible();
        await expect(page.locator('text')).toContainText('31 мая 2025 г.');

        await expect(page.getByRole('table')).toContainText('COMPLETED');

    })
});


test('checking priority macros !1', async ({page}) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', {name: 'Добавить задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill(`!1 ${new_unique} priority macro test`);
    await page.getByRole('button', {name: 'Создать'}).click();
    await page.waitForSelector('.todo-item');

    const task = page.locator('.todo-item').filter({
        has: page.locator(`.todo-title:has-text("${new_unique} priority macro test")`)
    }).first();

    await expect(task).toBeVisible();

    await expect(task.locator('.todo-badge.priority-critical')).toHaveText('CRITICAL');
})


test('checking date macro !before 31.12.2025', async ({page}) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', {name: 'Добавить задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill(`!before 31.12.2025 ${new_unique} date macro test`);
    await page.getByRole('button', {name: 'Создать'}).click();

    const task = page.locator('.todo-item').filter({
        has: page.locator(`.todo-title:has-text("${new_unique} date macro test")`)
    }).first();

    await expect(task).toBeVisible();

    await expect(task.locator('.todo-deadline')).toHaveText('31 декабря 2025 г.');
})

test('checking 2 macros', async ({page}) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', {name: 'Добавить задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill(`!before 20.01.2050 !2 ${new_unique} macros test`);
    await page.getByRole('button', {name: 'Создать'}).click();

    const task = page.locator('.todo-item').filter({
        has: page.locator(`.todo-title:has-text("${new_unique} macros test")`)
    }).first();

    await expect(task).toBeVisible();

    await expect(task.locator('.todo-badge.priority-high')).toHaveText('HIGH');

    await expect(task.locator('.todo-deadline')).toHaveText('20 января 2050 г.');

})

test('checking 2 macros and deadline, priority params', async ({page}) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', {name: 'Добавить задачу'}).click();
    await page.getByRole('textbox', {name: 'Название:'}).fill(`!before 01.01.2033 !4 ${new_unique} macros + params test`);
    await page.getByRole('textbox', {name: 'Срок выполнения:'}).fill('2029-10-25');
    await page.getByLabel('Приоритет:').selectOption('MEDIUM');
    await page.getByRole('button', {name: 'Создать'}).click();

    await page.waitForSelector('.todo-item');

    const task = page.locator('.todo-item').filter({
        has: page.locator(`.todo-title:has-text("${new_unique} macros + params test")`)
    }).first();

    await expect(task).toBeVisible();

    await expect(task.locator('.todo-badge.priority-medium')).toHaveText('MEDIUM');

    await expect(task.locator('.todo-deadline')).toHaveText('25 октября 2029 г.');
})


test('checking deleting', async ({page}) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', { name: 'Добавить задачу' }).click();
    await page.getByRole('textbox', { name: 'Название:' }).fill(`${new_unique} to delete`);
    await page.getByRole('button', { name: 'Создать' }).click();

    const taskBeforeDeletion = page.locator('.todo-item').filter({
        has: page.locator(`.todo-title:has-text("${new_unique} to delete")`)
    }).first();
    await expect(taskBeforeDeletion).toBeVisible();

    await page.locator('div')
        .filter({
            hasText: new RegExp(`^${new_unique} to delete×$`)
        })
        .getByRole('button')
        .click();

    await page.getByRole('button', {name: 'Да, удалить!'}).click();

    await expect(page.locator('.todo-item').filter({
        has: page.locator(`.todo-title:has-text("${new_unique} to delete")`)
    })).toHaveCount(0);
})

test('checking sorting by priority desc', async ({page}) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Добавить задачу' }).click();
    await page.getByRole('textbox', { name: 'Название:' }).fill('task1');
    await page.getByLabel('Приоритет:').selectOption('LOW');
    await page.getByRole('button', { name: 'Создать' }).click();

    await page.getByRole('button', { name: 'Добавить задачу' }).click();
    await page.getByRole('textbox', { name: 'Название:' }).fill('task2');
    await page.getByLabel('Приоритет:').selectOption('MEDIUM');
    await page.getByRole('button', { name: 'Создать' }).click();

    await page.getByRole('button', { name: 'Добавить задачу' }).click();
    await page.getByRole('textbox', { name: 'Название:' }).fill('task3');
    await page.getByLabel('Приоритет:').selectOption('HIGH');
    await page.getByRole('button', { name: 'Создать' }).click();

    await page.getByRole('button', { name: 'Добавить задачу' }).click();
    await page.getByRole('textbox', { name: 'Название:' }).fill('task4');
    await page.getByLabel('Приоритет:').selectOption('CRITICAL');
    await page.getByRole('button', { name: 'Создать' }).click();

    await page.getByRole('combobox').nth(1).selectOption('priority');
    await page.getByRole('combobox').nth(2).selectOption('desc');

    const items = await page.locator('.todo-item').all();
    const priorities = await Promise.all(items.map(async (item) => {
        const classList = await item.getAttribute('class');
        if (classList.includes('priority-critical')) return 0;
        if (classList.includes('priority-high')) return 1;
        if (classList.includes('priority-medium')) return 2;
        if (classList.includes('priority-low')) return 3;
        return 4;
    }));

    for (let i = 0; i < priorities.length - 1; i++) {
        expect(priorities[i]).toBeLessThanOrEqual(priorities[i + 1]);
    }
})
