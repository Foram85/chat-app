import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { PayLoad } from 'src/auth/dto/payload.dto';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map to store socket.id => userId mapping
  private activeUsers = new Map<string, string>();

  constructor(
    @Inject(forwardRef(() => ChatService)) private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1]; // Extract token from 'Bearer <token>'
      if (!token) {
        console.warn(
          `Client ${client.id} connected without a token! Disconnecting...`,
        );
        client.disconnect();
        return;
      }

      const payload: PayLoad = this.jwtService.verify(token, {
        secret: 'Foram3138',
      });
      const userId = payload.sub; // Extract userId from payload

      client.join(userId);
      this.activeUsers.set(client.id, userId); // Store mapping

      console.log(
        `Client ${client.id} (User: ${userId}) connected and joined their room.`,
      );
    } catch (err) {
      console.error(`Invalid token from client ${client.id}:`, err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.activeUsers.get(client.id);
    console.log(`Client disconnected: ${client.id} (User: ${userId})`);
    this.activeUsers.delete(client.id);
  }

  /**
   * Handles sending messages securely.
   * The sender is determined from the authenticated connection, NOT from the request body.
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { receiver: string; message: string },
  ): Promise<void> {
    const sender = this.activeUsers.get(client.id); // Retrieve sender's userId

    if (!sender) {
      console.error(`Unauthorized message attempt from client ${client.id}`);
      throw new UnauthorizedException('Unauthorized sender');
    }

    console.log(
      `Message from ${sender} to ${payload.receiver}: ${payload.message}`,
    );

    // Save the message to the database
    const savedMessage = await this.chatService.createMessage(
      payload.message,
      sender,
      payload.receiver,
    );

    const responseMessage = {
      sender: savedMessage.sender,
      message: savedMessage.message,
      timestamp: savedMessage.createdAt,
    };

    // Emit the message to the receiver's room
    this.server.to(payload.receiver).emit('newMessage', responseMessage);
  }
}
