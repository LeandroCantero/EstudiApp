import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        career: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        subjects: true,
        career: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { career, ...data } = updateUserDto;
    console.log(`🛠️ Actualizando usuario ${id}:`, { careerId: career });
    
    // Usamos el patrón connect para asegurar que la relación se establezca correctamente
    const updateData: any = { ...data };
    if (career) {
      updateData.career = { connect: { id: career } };
    }

    const result = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { career: true }
    });
    
    console.log('✅ Usuario actualizado:', { id: result.id, career: result.career?.name });
    return result;
  }

  async updateMe(updateUserDto: UpdateUserDto) {
    const users = await this.findAll();
    const user = users[0];
    if (!user) throw new NotFoundException('No users found in database');
    return this.update(user.id, updateUserDto);
  }
}
