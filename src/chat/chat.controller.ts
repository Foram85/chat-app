import {
  Controller,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UpdateChatMessageDto } from './dto/chat-message.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChatMessageDto,
    @Req() req,
  ) {
    return await this.chatService.update(id, updateDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return await this.chatService.delete(id, req.user.userId);
  }
}
