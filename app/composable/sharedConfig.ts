const config = ref<{ name: string, options: Score[] }[]>()


export const useSharedConfig = () => {

    return {
        config
    }
}