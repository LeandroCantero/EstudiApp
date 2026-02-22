import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CareersModule } from './careers/careers.module';
import { validateEnv } from './common/config/env.validation';
import { CreditsController } from './credits/credits.controller';
import { CreditsService } from './credits/credits.service';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { ExamsController } from './exams/exams.controller';
import { ExamsService } from './exams/exams.service';
import { ImportModule } from './import/import.module';
import { NotesController } from './notes/notes.controller';
import { NotesService } from './notes/notes.service';
import { PrismaService } from './prisma.service';
import { RecommendationsController } from './recommendations/recommendations.controller';
import { RecommendationsService } from './recommendations/recommendations.service';
import { SimulatorController } from './simulator/simulator.controller';
import { SimulatorService } from './simulator/simulator.service';
import { StudentSubjectsModule } from './student-subjects/student-subjects.module';
import { UsersModule } from './users/users.module';

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
        ExamsController,
    ],
    providers: [
        PrismaService,
        RecommendationsService,
        SimulatorService,
        CreditsService,
        NotesService,
        EventsService,
        ExamsService,
    ],
})
export class AppModule { }
