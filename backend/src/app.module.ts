import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CareersModule } from './careers/careers.module';
import { validateEnv } from './common/config/env.validation';
import { ImportModule } from './import/import.module';
import { PrismaService } from './prisma.service';
import { SubjectsModule } from './subjects/subjects.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        SubjectsModule,
        UsersModule,
        CareersModule,
        ImportModule,
    ],
    controllers: [AppController],
    providers: [PrismaService],
})
export class AppModule { }
