import { Controller, Get, Body, Param, Put, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat-message.entity';
import { UpdateChatMessageDto } from './dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async findAll(): Promise<ChatMessage[]> {
    return await this.chatService.getMessages();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChatMessageDto,
  ): Promise<ChatMessage> {
    return await this.chatService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.chatService.delete(id);
  }
}
