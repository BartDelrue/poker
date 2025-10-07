import {Room} from '~~/server/lib/room'


const peerToRooms = new Map<string, Set<Room>>()
const rooms = new Map<string, Room>()

export default defineWebSocketHandler({

    open(peer) {
        console.log("[ws] open", peer.id)
    },

    message(peer, message) {
        const {type, roomId, data} = message.json<PokerMessage>()
        if (!roomId) return;

        // initial creation
        if (type === 'join' && !rooms.has(roomId)) rooms.set(roomId, new Room(roomId));

        const room = rooms.get(roomId)
        if (!room) return;

        if (type === 'join') room.join(peer, () => {
            if (!peerToRooms.has(peer.id)) peerToRooms.set(peer.id, new Set())
            peerToRooms.get(peer.id)!.add(room)
        })

        if (type === 'leave') room.leave(peer, (size) => {
            peerToRooms.get(peer.id)?.delete(room)
            if (!size) rooms.delete(roomId)
        })

        if (type === 'score') room.score(peer, data)

        if (type === 'reveal') room.toggleReveal(data)

        if (type === 'config') room.updateConfig(data)

    },

    close(peer) {

        peerToRooms.get(peer.id)?.forEach(room =>
            room.leave(
                peer,
                size => {
                    if (!size) rooms.delete(room.id)
                }))

        peerToRooms.delete(peer.id)
    },

    error(peer, error) {
        console.log("[ws] error", error);
    },
});

