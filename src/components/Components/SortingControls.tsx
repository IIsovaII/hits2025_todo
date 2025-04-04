import React from 'react';
import {SortConfig, Todo} from "../../models/todo.ts";
import '../../styles/SortingControls.css'

interface SortingControlsProps {
    sortConfigs: SortConfig<Todo>[];
    addSortCriteria: () => void;
    removeSortCriteria: (index: number) => void;
    updateSortCriteria: (index: number, field: 'key' | 'direction', value: any) => void;
}

export const SortingControls: React.FC<SortingControlsProps> = ({
                                                                    sortConfigs,
                                                                    addSortCriteria,
                                                                    removeSortCriteria,
                                                                    updateSortCriteria
                                                                }) => {
    const availableFields = [
        {value: 'title', label: 'Название'},
        {value: 'description', label: 'Описание'},
        {value: 'completed', label: 'Выполненность'},
        {value: 'createdAt', label: 'Время создания'},
        {value: 'updatedAt', label: 'Время редактирования'},
        {value: 'deadline', label: 'Срок выполнения'},
        {value: 'status', label: 'Статус'},
        {value: 'priority', label: 'Приоритет'}
    ];

    return (
        <div className="sorting-controls">
            <h3>Настройки сортировки</h3>

            {sortConfigs.map((config, index) => (
                <div key={index} className="sort-criteria-row">
                    <select
                        className="sort-select"
                        value={config.key as string}
                        onChange={(e) => updateSortCriteria(index, 'key', e.target.value)}
                    >
                        {availableFields.map((field) => (
                            <option key={field.value} value={field.value}>
                                {field.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="sort-select"
                        value={config.direction}
                        onChange={(e) => updateSortCriteria(
                            index,
                            'direction',
                            e.target.value as 'asc' | 'desc'
                        )}
                    >
                        <option value="asc">По возрастанию</option>
                        <option value="desc">По убыванию</option>
                    </select>

                    {sortConfigs.length > 1 && (
                        <button
                            onClick={() => removeSortCriteria(index)}
                            className="secondary-button-near"
                        >
                            Удалить
                        </button>
                    )}
                </div>
            ))}

            <button onClick={addSortCriteria} className="secondary-button">
                Добавить критерий
            </button>
        </div>
    );
};