export const usePokerSocket = function (roomId: string) {
    let ws: WebSocket | null = null
    let retries = 0
    let retryId: ReturnType<typeof setTimeout> | undefined
    let pingId: ReturnType<typeof setInterval> | undefined

    const rubric = ref<Rubric>()
    const scores = ref(new Map<string, string | null>())
    const userId = ref<string>()
    const revealed = ref<boolean>(false)

    let _onOpen = () => {
    }
    const onOpen = (cb: () => void) => _onOpen = cb

    const updateConfig = ({name, options}: { name: string | undefined, options: Score[] }, id?: string) => {
        // console.log(encodeURIComponent(JSON.stringify({name, options: [...options]})))
        // console.log(decodeURIComponent(encodeURIComponent(JSON.stringify({name, options: [...options]}))))
        send({
            type: 'config',
            data: {
                id, name, options
            }
        })
    }

    const setRevealed = (criteriumId: string, revealed: boolean) => send({
        type: 'reveal',
        data: {criteriumId, revealed}
    })

    const receiveMessage = (event: MessageEvent) => {
        const {data, type} = JSON.parse(event.data) as PokerMessage

        if (type === 'init' && data) {
            userId.value = data

            const expires = new Date()
            expires.setDate(expires.getDate() + 30)

            document.cookie = `ws_user_id=${data}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
        }

        if (type === 'joined') {
            userId.value = data
        }

        if (type === 'scored') {
            rubric.value = {...data, criteria: data.criteria.map(c => ({...c, scores: new Map(c.scores)}))}
        }
    }

    const score = (value: string, criteriumId: string) =>
        send({
            type: 'score',
            data: {
                criteriumId,
                value
            }
        })

    const reset = (criteriumIds: string[]) => send({
        type: 'reset', data: {
            criteriumIds
        }
    })

    const send = (msg: Partial<PokerMessage>) => {
        if (ws?.readyState !== WebSocket.OPEN) return

        ws.send(JSON.stringify({...msg, roomId}))
    }

    const errorHandler = (e: Event) => {
        console.error("ws error: ", e)
    }

    const closeHandler = (e: CloseEvent) => {
        console.warn("ws closed: ", e)

        clearInterval(pingId)

        retryId = setTimeout(() => {
            retries++
            connect()
        }, Math.min(((retries ** 2) * 1000), 30_000) + Math.floor(Math.random() * 1000))
    }

    const connect = () => {
        ws = new WebSocket(`ws${import.meta.dev ? '' : 's'}://${window.location.host}/poker/`)
        ws.addEventListener("open", () => {
            retries = 0
            send({type: 'join'})

            clearInterval(pingId)
            pingId = setInterval(() => send({type: 'ping'}), 25_000)

            _onOpen()
        })
        ws.addEventListener("message", receiveMessage)
        ws.addEventListener("error", errorHandler)
        ws.addEventListener("close", closeHandler)
    }

    onMounted(connect)

    onBeforeUnmount(() => {

        clearTimeout(retryId)
        clearInterval(pingId)

        send({type: 'leave'})

        ws?.removeEventListener('message', receiveMessage)
        ws?.removeEventListener("error", errorHandler)
        ws?.close()
        ws?.removeEventListener("close", closeHandler)
    })

    return {userId, scores, score, reset, revealed, setRevealed, rubric, updateConfig, onOpen}
}