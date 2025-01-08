import { RoomsArray, RoomsMapResp } from '../models/sea-battle-api-types';

export function roomsMapToArray(roomsMap: RoomsMapResp): RoomsArray {
    return Object.values(roomsMap.rooms);
}
