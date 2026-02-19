import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CareersModule } from './careers/careers.module';
import { validateEnv } from './common/config/env.validation';
import { ImportModule } from './import/import.module';
import { PrismaService } from './prisma.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        CareersModule,
        ImportModule,
    ],
    controllers: [AppController],
    providers: [PrismaService],
})
export class AppModule { }
