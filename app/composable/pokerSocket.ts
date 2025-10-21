export const usePokerSocket = function (roomId: string) {
    let ws: WebSocket | null = null

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

    const toggleReveal = (id: string) => send({
        type: 'reveal',
        data: id
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

    const reset = (criteriumIds: string[]) => send({ type: 'reset', data: {
            criteriumIds
        }})


    const send = (msg: Partial<PokerMessage>) => ws?.send(JSON.stringify({...msg, roomId}))

    onMounted(() => {
        ws = new WebSocket(`ws${import.meta.dev ? '' : 's'}://${window.location.host}/poker/`)
        ws.addEventListener("open", () => {
            ws!.send(JSON.stringify({type: 'join', roomId}));
            _onOpen()
        })
        ws.addEventListener("message", receiveMessage)
    })

    onBeforeUnmount(() => {
        ws?.send(JSON.stringify({type: 'leave', roomId}))
        ws?.removeEventListener('message', receiveMessage)
        ws?.close()
    })

    return {userId, scores, score, reset, revealed, toggleReveal, rubric, updateConfig, onOpen}
}