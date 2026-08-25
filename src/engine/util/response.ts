export function apiState(success: boolean, message: string, data?: object) {
    return { ...data, success, message };
}
