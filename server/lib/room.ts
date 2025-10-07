type Peer = Parameters<NonNullable<Parameters<typeof defineWebSocketHandler>[0]["open"]>>[0]

export class Room {

    rubric: Rubric
    members: Set<Peer>

    id: string
    revealed: boolean = false

    constructor(id: string) {
        this.members = new Set()
        this.id = id

        this.rubric = {
            criteria: []
        }
    }

    sendRubric() {
        this.broadCast({
            type: "scored",
            data: {
                ...this.rubric,
                criteria: this.rubric.criteria.map(c => ({
                    ...c,
                    scores: Array.from(c.scores)
                }))
            }
        })
    }

    join(peer: Peer, done = () => {
    }) {
        this.members.add(peer)

        this.rubric
            .criteria
            .forEach(c => c.scores.set(peer.id, null))

        peer.send(JSON.stringify({
            type: 'joined',
            data: peer.id
        }))

        this.sendRubric()

        done()
    }

    score(peer: Peer, {criteriumId, value}: { criteriumId: string, value: string }) {

        const criterium = this.rubric.criteria.find(c => c.id === criteriumId)
        criterium?.scores.set(peer.id, value)

        this.sendRubric()
    }

    toggleReveal(criteriumId: string) {

        const criterium = this.rubric.criteria.find(c => c.id === criteriumId)
        if (!criterium) return

        criterium.revealed = !criterium.revealed
        this.sendRubric()
    }

    leave(peer: Peer, done: (count?: number) => void = () => {
    }) {
        console.log(this.members.size)

        this.members.delete(peer)
        this.rubric
            .criteria
            .forEach(c => c.scores.delete(peer.id))

        this.sendRubric()
        done(this.members.size)
    }

    broadCast(message: Partial<PokerMessage>) {
        this.members.forEach(p => p.send(JSON.stringify({
            ...message,
            roomId: this.id
        })))
    }

    private addCriterium({name, options}: { name: string, options: Score[] }) {
        this.rubric.criteria.push({
            id: `cr-${
                this.rubric.criteria.length +
                (Math.random() + 1).toString(36).slice(-6)}`,
            name,
            options,
            scores: new Map(this.members.values().map(v => ([v.id, null]))),
            revealed: false
        })
    }

    updateConfig({id, name, options}: { id?: string, name: string, options: Score[] }) {
        console.log('hallo!')
        if (!id) this.addCriterium({name, options})
        else {
            const criterium = this.rubric.criteria.find(c => c.id === id)
            if (!criterium) return

            criterium.name = name
            criterium.options = options;
            criterium
                .scores
                .forEach((value, key, map: Map<string, Score>) => {
                    if (!options.includes(value)) map.set(key, null)
                })

        }

        this.sendRubric()
    }
}