import {Room} from '~~/server/lib/room'
import {randomUUID} from 'crypto'

const peerToRooms = new Map<string, Set<Room>>()
const rooms = new Map<string, Room>()
const peerToUserId = new Map<string, string>()

const parseCookies = function (cookieHeader: string): Record<string, string> {
    if (!cookieHeader) return {}

    return Object.fromEntries(
        cookieHeader
            .split(';')
            .map((c: string) => {
                const [key, ...v] = c.trim().split('=')
                return [key, v.join('=')]
            })
    )
}

export default defineWebSocketHandler({

    open(peer) {
        console.log("[ws] open", peer.id)

        const cookieHeader = peer.request.headers.get('cookie') || ''
        const cookies = parseCookies(cookieHeader)
        let userId = cookies.ws_user_id

        if (!userId) userId = randomUUID()
        peerToUserId.set(peer.id, userId)

        // Send userId to client so it can set the cookie
        peer.send({type: 'init', data: userId})
    },

    message(peer, message) {
        const {type, roomId, data} = message.json<PokerMessage>()
        if (!roomId) return;

        const userId = peerToUserId.get(peer.id)
        if (!userId) return;

        // initial creation
        if (type === 'join' && !rooms.has(roomId)) rooms.set(roomId, new Room(roomId));

        const room = rooms.get(roomId)
        if (!room) return;

        if (type === 'join') room.join(userId, peer, () => {
            if (!peerToRooms.has(peer.id)) peerToRooms.set(peer.id, new Set())
            peerToRooms.get(peer.id)!.add(room)
        })

        if (type === 'score') room.score(userId, data)

        if (type === 'reveal') room.toggleReveal(data)

        if (type === 'config') room.updateConfig(data)

        if (type === 'reset') room.reset(data)

    },

    close(peer) {

        const userId = peerToUserId.get(peer.id)
        if (!userId) return

        peerToRooms.get(peer.id)?.forEach(room =>
            room.leave(
                userId,
                peer,
                size => {
                    if (!size) setTimeout(
                        () => rooms.delete(room.id),
                        1 * 60 * 60 * 1000
                    )
                }))

        peerToRooms.delete(peer.id)
        peerToUserId.delete(peer.id)
    },

    error(peer, error) {
        console.log("[ws] error", error);
    },
});

