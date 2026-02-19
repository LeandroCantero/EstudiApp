import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CareersModule } from './careers/careers.module';
import { validateEnv } from './common/config/env.validation';
import { ImportModule } from './import/import.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentSubjectsModule } from './student-subjects/student-subjects.module';
import { RecommendationsService } from './recommendations/recommendations.service';
import { RecommendationsController } from './recommendations/recommendations.controller';
import { SimulatorService } from './simulator/simulator.service';
import { SimulatorController } from './simulator/simulator.controller';
import { CreditsService } from './credits/credits.service';
import { CreditsController } from './credits/credits.controller';
import { NotesService } from './notes/notes.service';
import { NotesController } from './notes/notes.controller';
import { EventsService } from './events/events.service';
import { EventsController } from './events/events.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        CareersModule,
        ImportModule,
        AuthModule,
        UsersModule,
        StudentSubjectsModule,
    ],
    controllers: [
        AppController,
        RecommendationsController,
        SimulatorController,
        CreditsController,
        NotesController,
        EventsController,
    ],
    providers: [
        PrismaService,
        RecommendationsService,
        SimulatorService,
        CreditsService,
        NotesService,
        EventsService,
    ],
})
export class AppModule { }
