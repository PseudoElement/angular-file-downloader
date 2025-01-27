###### Create new room

create new Room request ->
creation on server ->
create RoomSocket in rooms array with 1 player ->
apply listeners ->
on connect new player add Player in `players`

###### Connect to existing

connect to room ->
get data from response and set in `room.data` ->
apply listeners

##### Change mode of field

1. Toggle change mode to `true`
2. Save previous positions in `oldPositions`
3. Add selected cells in `newPositions`
4.

### TODO

-   handle ALREADY_CHECKED case properly (maybe add counter with attempts, if more than 2, skip step for user)
-   handle user connected to room, where he already exists
-   fix setPositions where you set positions and enemy field also updated
-   clear room fields and players data on enemy disconnection
