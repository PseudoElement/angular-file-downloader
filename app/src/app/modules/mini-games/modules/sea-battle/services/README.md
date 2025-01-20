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

### TODO

-   handle ALREADY_CHECKED case properly (maybe add counter with attempts, if more than 2, skip step for user)
-   update IS_OWNER status on client if host disconnected
-   handle user connected to room, where he already exists
-   fix cellValue undefined in positionsToMatrix
