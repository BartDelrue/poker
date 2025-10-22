type Peer = Parameters<NonNullable<Parameters<typeof defineWebSocketHandler>[0]["open"]>>[0]

export class Room {

    rubric: Rubric
    members: Map<string, Set<Peer>>

    id: string
    revealed: boolean = false

    constructor(id: string) {
        this.members = new Map()
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
                })),
                members: Array.from(this.members.entries()
                    .map(([userId, peers]) =>
                        ({userId, active: peers.size > 0})
                    )),
            }
        })
    }

    join(userId: string, peer: Peer, done = () => {
    }) {

        if (!this.members.has(userId))
            this.members.set(userId, new Set())

        this.members.get(userId)!.add(peer)

        this.rubric
            .criteria
            .forEach(c => {
                if (!(c.scores as Map<string, Score>).has(userId))
                    (c.scores as Map<string, Score>).set(userId, null)
            })

        peer.send(JSON.stringify({
            type: 'joined',
            data: userId
        }))

        this.sendRubric()

        done()
    }

    score(userId: string, {criteriumId, value}: { criteriumId: string, value: string }) {

        const criterium = this.rubric.criteria.find(c => c.id === criteriumId)

        if (criterium)
            (criterium.scores as Map<string, Score>).set(userId, value)

        this.sendRubric()
    }

    toggleReveal(criteriumId: string) {

        const criterium = this.rubric.criteria.find(c => c.id === criteriumId)
        if (!criterium) return

        criterium.revealed = !criterium.revealed
        this.sendRubric()
    }

    leave(userId: string, peer: Peer, done: (count?: number) => void = () => {
    }) {

        if (!this.members.has(userId)) return

        // remove connection
        this.members.get(userId)!.delete(peer)

        // member has no more active connections
        if (!this.members.get(userId)?.size) {
            console.log('member gone')
        }

        // no active members
        if (this.members.values().every(v => v.size === 0)) {
            console.log('no active members')
            done()
        }

        this.sendRubric()

    }

    broadCast(message: Partial<PokerMessage>) {
        this.members.forEach(
            m => m.values()
                .forEach(
                    p =>
                        p.send(JSON.stringify({
                            ...message,
                            roomId: this.id
                        }))))
    }

    private addCriterium({name, options}: { name?: string, options: Score[] }) {
        this.rubric.criteria.push({
            id: `cr-${
                this.rubric.criteria.length +
                (Math.random() + 1).toString(36).slice(-6)}`,
            name,
            options,
            scores: new Map(this.members.keys().map(userId => ([userId, null]))),
            revealed: false
        })
    }

    updateConfig({id, name, options}: { id?: string, name?: string, options: Score[] }) {
        if (!id) this.addCriterium({name, options})
        else {
            const criterium = this.rubric.criteria.find(c => c.id === id)
            if (!criterium) return

            criterium.name = name
            criterium.options = options;
            (criterium.scores as Map<string, Score>)
                .forEach((value, key, map: Map<string, Score>) => {
                    if (!options.includes(value)) map.set(key, null)
                })
        }

        this.sendRubric()
    }

    reset({criteriumIds}: {criteriumIds: string[]}) {
        this.rubric.criteria
            .filter(c => criteriumIds.includes(c.id))
            .forEach(c =>
                (c.scores as ScoreMap).forEach((value, key) =>
                {
                    (c.scores as ScoreMap).set(key, null)
                    c.revealed = false
                }))

        this.sendRubric()
    }
}