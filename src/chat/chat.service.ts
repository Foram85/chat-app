import { Injectable, NotFoundException } from '@nestjs/common';
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
  ): Promise<ChatMessage> {
    const message = await this.chatRepository.findOne({ where: { id } });
    Object.assign(message, updateDto); // Update fields dynamically
    return await this.chatRepository.save(message);
  }

  async delete(id: string): Promise<void> {
    const result = await this.chatRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
