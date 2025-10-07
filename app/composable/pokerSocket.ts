export const usePokerSocket = function (roomId: string) {
    let ws: WebSocket | null = null

    const rubric = ref<Rubric>()
    const scores = ref(new Map<string, string | null>())
    const connectionId = ref<string>()
    const revealed = ref<boolean>(false)


    let _onOpen = () => {
    }
    const onOpen = (cb: () => void) => _onOpen = cb

    const updateConfig = ({name, options}: { name: string, options: Score[] }, id?: string) => {
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

        if (type === 'joined') {
            connectionId.value = data
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

    return {connectionId, scores, score, revealed, toggleReveal, rubric, updateConfig, onOpen}
}