// import TodoModal from './TodoModal';
// import {Todo, TodoPriority, TodoStatus} from "../../models/todo";
// import Swal from 'sweetalert2';
//
// jest.mock('sweetalert2', () => ({
//     __esModule: true,
//     default: {
//         fire: jest.fn().mockResolvedValue({
//             isConfirmed: true,
//             value: {
//                 title: 'Test Task',
//                 description: 'Test Description',
//                 deadline: new Date(),
//                 priority: 'MEDIUM'
//             }
//         }),
//         getPopup: jest.fn(() => ({
//             querySelector: jest.fn().mockImplementation((selector) => {
//                 const elements: Record<string, any> = {
//                     '#title': {value: ''},
//                     '#description': {value: ''},
//                     '#deadline': {value: null},
//                     '#priority': {value: 'null'},
//                 };
//                 return elements[selector];
//             })
//         })),
//         showValidationMessage: jest.fn(),
//         close: jest.fn()
//     }
//     // fire: jest.fn(),
//     // getPopup: jest.fn(() => ({
//     //     querySelector: jest.fn().mockImplementation((selector) => {
//     //         const elements: Record<string, any> = {
//     //             '#title': { value: '' },
//     //             '#description': { value: '' },
//     //             '#deadline': { value: '' },
//     //             '#priority': { value: 'null' },
//     //         };
//     //         return elements[selector];
//     //     }),
//     // })),
//     // showValidationMessage: jest.fn(),
// }));
//
//
// // jest.mock('sweetalert2', () => ({
// //     fire: jest.fn().mockImplementation(() => Promise.resolve({
// //         isConfirmed: true,
// //         isDenied: false,
// //         isDismissed: false,
// //         value: {}
// //     })),
// //     getPopup: jest.fn().mockImplementation(() => ({
// //         querySelector: jest.fn().mockImplementation((selector: '#title' | '#description' | '#deadline' | '#priority') => {
// //             const elements = {
// //                 '#title': { value: '' },
// //                 '#description': { value: '' },
// //                 '#deadline': { value: '' },
// //                 '#priority': { value: 'null' }
// //             };
// //             return elements[selector];
// //         })
// //     })),
// //     showValidationMessage: jest.fn(),
// //     close: jest.fn()
// // }));
//
// describe('TodoModal', () => {
//     const mockCreateTodo = jest.fn();
//     const mockPrevTodo: Todo = {
//         createdAt: new Date('2020-12-31'),
//         id: '1',
//         title: 'Test Todo',
//         description: 'Test Description',
//         deadline: new Date('2026-12-31'),
//         priority: TodoPriority.MEDIUM,
//         status: TodoStatus.ACTIVE,
//         completed: false
//     };
//
//     beforeEach(() => {
//         jest.clearAllMocks();
//
//         // jest.mocked(Swal.getPopup).mockImplementation(() => ({
//         //     querySelector: jest.fn().mockImplementation((selector: '#title' | '#description' | '#deadline' | '#priority') => {
//         //         const elements: Record<string, any> = {
//         //             '#title': { value: 'Test Task' },
//         //             '#description': { value: 'Test Description' },
//         //             '#deadline': { value: '2023-12-31' },
//         //             '#priority': { value: 'MEDIUM' }
//         //         };
//         //         return elements[selector];
//         //     })
//         // }));
//         // (Swal.getPopup as jest.Mock).mockImplementation(() => ({
//         //     querySelector: jest.fn().mockImplementation((selector) => {
//         //         const elements: Record<string, any> = {
//         //             '#title': { value: '' },
//         //             '#description': { value: '' },
//         //             '#deadline': { value: '' },
//         //             '#priority': { value: 'null' },
//         //         };
//         //         return elements[selector];
//         //     }),
//         // }));
//         // Настраиваем базовый мок Swal
//
//         // (Swal.fire as jest.Mock).mockImplementation(() => ({
//         //     isConfirmed: true,
//         //     value: null
//         // }));
//         (Swal.fire as jest.Mock).mockImplementation(async (options) => {
//             // Имитируем вызов preConfirm при подтверждении
//             if (options.preConfirm) {
//                 try {
//                     options.value = await options.preConfirm();
//                 } catch (e) {
//                     return { isConfirmed: false };
//                 }
//             }
//             return { isConfirmed: true, value: options.value };
//         });
//
//         // Мокаем getPopup для возврата элементов формы
//         (Swal.getPopup as jest.Mock).mockImplementation(() => ({
//             querySelector: jest.fn((selector) => {
//                 const elements: Record<string, any> = {
//                     '#title': { value: '' }, // Пустое название - должно вызвать ошибку
//                     '#description': { value: 'Test' },
//                     '#deadline': { value: '' },
//                     '#priority': { value: 'null' }
//                 };
//                 return elements[selector];
//             })
//         }));
//     });
//
//     describe('Rendering', () => {
//         it('should render create modal when prevTodo is null', async () => {
//             await TodoModal(mockCreateTodo, null);
//             expect(Swal.fire).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     title: 'Создать новую задачу',
//                     confirmButtonText: 'Создать',
//                 })
//             );
//         });
//
//         it('should render edit modal when prevTodo exists', async () => {
//             await TodoModal(mockCreateTodo, mockPrevTodo);
//             expect(Swal.fire).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     title: 'Изменить задачу',
//                     confirmButtonText: 'Изменить',
//                 })
//             );
//         });
//     });
//
//     const setupInputs = (inputs: Record<string, string>) => {
//         (Swal.getPopup as jest.Mock).mockImplementation(() => ({
//             querySelector: jest.fn().mockImplementation((selector) => {
//                 const elements: Record<string, any> = {
//                     '#title': {value: inputs.title || ''},
//                     '#description': {value: inputs.description || ''},
//                     '#deadline': {value: inputs.deadline || ''},
//                     '#priority': {value: inputs.priority || 'null'},
//                 };
//                 return elements[selector];
//             }),
//         }));
//     };
//
//
//     describe('Validation', () => {
//
//         it('should show validation error for empty title', async () => {
//             await TodoModal(mockCreateTodo, null);
//             expect(Swal.showValidationMessage).toHaveBeenCalledWith(
//                 'Пожалуйста, введите название задачи'
//             );
//         });
//
//
//         // it('should show error when title is empty', async () => {
//         //     // setupInputs({title: ''});
//         //     await TodoModal(mockCreateTodo, null);
//         //     expect(Swal.showValidationMessage).toHaveBeenCalledWith(
//         //         'Пожалуйста, введите название задачи'
//         //     );
//         // });
//
//         it('should show error when title is too short', async () => {
//             setupInputs({title: 'abc'});
//             await TodoModal(mockCreateTodo, null);
//             expect(Swal.showValidationMessage).toHaveBeenCalledWith(
//                 'Минимальная длина название: 4 символа'
//             );
//         });
//
//         it('should accept valid title', async () => {
//             setupInputs({title: 'Valid Title'});
//             // (Swal.fire as jest.Mock).mockResolvedValue({isConfirmed: true, value: {}});
//             await TodoModal(mockCreateTodo, null);
//             expect(Swal.showValidationMessage).not.toHaveBeenCalled();
//         });
//     });
//
//     describe('Macro processing', () => {
//         it('should process !before deadline macro', async () => {
//             setupInputs({title: 'Task !before 31.12.2025'});
//             // (Swal.fire as jest.Mock).mockResolvedValue({isConfirmed: true, value: {}});
//             await TodoModal(mockCreateTodo, null);
//             // Проверяем, что deadline установлен правильно
//             expect(mockCreateTodo).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     deadline: new Date('2025-12-30T17:00:00.000Z'),
//                 })
//             );
//         });
//
//         it('should show error for invalid macro', async () => {
//             setupInputs({title: 'Task !5'});
//             await TodoModal(mockCreateTodo, null);
//             expect(Swal.showValidationMessage).toHaveBeenCalled();
//         });
//     });
//
//     describe('Result handling', () => {
//         it('should show success on create', async () => {
//             (Swal.fire as jest.Mock).mockResolvedValue({isConfirmed: true, value: {}});
//             mockCreateTodo.mockResolvedValue(undefined);
//             await TodoModal(mockCreateTodo, null);
//             expect(Swal.fire).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     icon: 'success',
//                     title: 'Задача создана!',
//                 })
//             );
//         });
//
//         it('should show error on failure', async () => {
//             (Swal.fire as jest.Mock).mockResolvedValue({isConfirmed: true, value: {}});
//             mockCreateTodo.mockRejectedValue(new Error('Test Error'));
//             await TodoModal(mockCreateTodo, null);
//             expect(Swal.fire).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     icon: 'error',
//                     title: 'Ошибка!',
//                 })
//             );
//         });
//     });
// });