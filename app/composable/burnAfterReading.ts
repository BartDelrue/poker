export const useBurnAfterReading = function <T>(source: Ref<T | null>): T | null{
    const value = source.value
    source.value = null

    return value
}