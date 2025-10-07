export const useBurnAfterReading = function <T>(source: MaybeRef<T | null>): T | null{
    const value = toValue(source)
    if (isRef(source)) source.value = null
    else source = null

    return value
}