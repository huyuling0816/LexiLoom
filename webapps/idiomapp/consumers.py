import random
import string

from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
import json

from idiomapp.game_view import start_battle_session

active_rooms = {}


class BattleConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting to battle consumer")
        random_id = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        self.room_name = self.scope['url_route']['kwargs']['userId'] + "_" + random_id
        available_room = None
        for room, players in active_rooms.items():
            if len(players) < 2 and self.room_name.split('_')[0] not in players:
                available_room = room
                break

        if available_room:
            self.room_group_name = available_room
            active_rooms[self.room_group_name].append(self.room_name.split('_')[0])
        else:
            self.room_group_name = f"session_{self.room_name}"
            active_rooms[self.room_group_name] = [self.room_name.split('_')[0]]
        # Add the player to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        start_battle_session_async = sync_to_async(start_battle_session, thread_sensitive=True)
        if len(active_rooms[self.room_group_name]) == 2:
            player1, player2 = active_rooms[self.room_group_name]
            battle_id, questions, player1_name, player2_name = await start_battle_session_async(player1, player2)
            if battle_id == -1:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player.joined',
                        'battle_id': battle_id,
                        'questions': questions,
                        'message': 'Invalid Player ID!'
                    }
                )
            else:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player.joined',
                        'battle_id': battle_id,
                        'questions': questions,
                        'player1_name': player1_name,
                        'player2_name': player2_name,
                        'player1_id': player1,
                        'player2_id': player2,
                        'message': 'A player has joined the game! Game start!'
                    }
                )
        print(active_rooms)

    async def disconnect(self, close_code):
        print("Disconnecting from battle consumer")
        if self.room_group_name in active_rooms:
            if active_rooms[self.room_group_name]:
                # Notify the other player that opponent left
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'opponent_left',
                        'message': 'Your opponent has left the game.'
                    }
                )
                del active_rooms[self.room_group_name]
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(active_rooms)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'progress_update':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'progress.update',
                    'player': data['player'],
                    'progress': data['progress'],
                    'score': data['score']
                }
            )
        elif action == 'complete':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game.complete',
                    'player': data['player'],
                    'score': data['score'],
                    'time': data['time']
                }
            )
        elif action == 'battle_result':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'battle.result',
                    'time1': data['time1'],
                    'score1': data['score1'],
                    'time2': data['time2'],
                    'score2': data['score2'],
                    'winner_id': data['winner_id'],
                    'sender_id': data['sender_id'],
                }
            )

    async def battle_result(self, event):
        await self.send(text_data=json.dumps({
            'type': 'battle_result',
            'time1': event['time1'],
            'score1': event['score1'],
            'time2': event['time2'],
            'score2': event['score2'],
            'winner_id': event['winner_id'],
            'sender_id': event['sender_id']
        }))

    async def progress_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'progress',
            'player': event['player'],
            'progress': event['progress'],
            'score': event['score']
        }))

    async def game_complete(self, event):
        await self.send(text_data=json.dumps({
            'type': 'result',
            'player': event['player'],
            'score': event['score'],
            'time': event['time']
        }))

    async def player_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_joined',
            'battle_id': event['battle_id'],
            'questions': event['questions'],
            'player1_name': event['player1_name'],
            'player2_name': event['player2_name'],
            'player1_id': event['player1_id'],
            'player2_id': event['player2_id'],
            'message': event['message']
        }))

    async def opponent_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'opponent_left',
            'message': event['message']
        }))
