const config = ref<{ name: string, options: Score[] }[]>()


const checkQuery = (config: string) => {
    if (!config) return

    try {
        config = JSON.parse(config)
        if (!Array.isArray(config)) return
        if (config.some(c => {
            return typeof c.name !== 'string' || !Array.isArray(c.options)
        })) return
    } catch {
        return
    }

    return config
}

export const useSharedConfig = () => {

    const route = useRoute()
    const queryConfig = checkQuery(route.query.config as string)
    if (queryConfig) {
        config.value = queryConfig
        const router = useRouter()

        // todo: why does this not work?
        router.replace({query: { }})
    }


    return {
        config
    }
}