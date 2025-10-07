export const useBurnAfterReading = function <T>(source: MaybeRef<T | null>): T | null{
    const value = toValue(source)
    console.log('reading')
    if (isRef(source)) source.value = null
    else source = null

    return value
}