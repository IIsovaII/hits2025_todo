// export function dateToInput(date: Date | null) {
//     if (!date) {
//         return null;
//     }
//     if (!(date instanceof Date) || isNaN(date.getTime())) {
//         return null;
//     }
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//
//     const result : string= `${year}-${month}-${day}`;
//     console.log(result);
//     return result;
//
// }

export function dateToInput(date: Date | string | null) {
    // Convert string to Date if needed
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    if (!parsedDate) {
        return null;
    }

    // Check if it's a valid Date object
    if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
        return null;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}