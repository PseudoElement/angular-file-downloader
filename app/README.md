TODO:

-++ connection to the same room after page reload
-++ offer sent, but answer not taken
-++ fix ID and users count in voiceroom
-++ handle eror on disconnect [VoiceChatRoomService_disconnect] me is undefined
-++ counter of users in room is not changed of USER_JOINED/USER_LEFT events
-++ add loader on user square which connected, but answer not created yet
-++ host not changed after old host disconnected
-++ add LIMIT 20 users per room

- add indetiicator of speaking user

ON SERVER:

- add Microphone sign (red/green) of user muted/unmuted and event USER_TOGGLED_MICRO
- fix USER_DISCONNECTED sent 2 times on user disconnection
