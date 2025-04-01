import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { UpdateChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepository: Repository<ChatMessage>,
  ) {}

  async createMessage(
    message: string,
    sender: string,
    receiver: string,
  ): Promise<ChatMessage> {
    const content = this.chatRepository.create({ message, sender, receiver });
    return await this.chatRepository.save(content);
  }

  async getMessages(): Promise<ChatMessage[]> {
    return await this.chatRepository.find({ order: { createdAt: 'ASC' } });
  }

  async update(
    id: string,
    updateDto: UpdateChatMessageDto,
    user: string, // current user's id from JWT
  ): Promise<ChatMessage> {
    const message = await this.chatRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    if (message.sender !== user) {
      throw new UnauthorizedException('You can not update this message');
    }
    Object.assign(message, updateDto);
    return await this.chatRepository.save(message);
  }

  async delete(id: string, user: string): Promise<void> {
    const message = await this.chatRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    if (message.sender !== user) {
      throw new UnauthorizedException('You can not delete this message');
    }
    const result = await this.chatRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
