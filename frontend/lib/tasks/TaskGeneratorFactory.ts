import type { AdminTask, TaskPriority, TaskType } from './types';

/**
 * Base interface for all task generators.
 * Each generator scans for specific conditions and returns tasks to create.
 */
export interface TaskGenerator {
    /** Unique identifier for this generator */
    readonly name: string;

    /** Human-readable description */
    readonly description: string;

    /** Scan for issues and return tasks to create */
    scan(): Promise<AdminTask[]>;
}

/**
 * Factory to run all registered task generators.
 */
export class TaskGeneratorFactory {
    private generators: TaskGenerator[] = [];

    register(generator: TaskGenerator): void {
        this.generators.push(generator);
    }

    async runAll(): Promise<AdminTask[]> {
        const { tasks } = await this.runAllDetailed();
        return tasks;
    }

    async runAllDetailed(): Promise<{
        tasks: AdminTask[];
        results: { name: string; count: number; error?: string }[];
    }> {
        const allTasks: AdminTask[] = [];
        const results: { name: string; count: number; error?: string }[] = [];

        for (const generator of this.generators) {
            try {
                const tasks = await generator.scan();
                allTasks.push(...tasks);
                results.push({ name: generator.name, count: tasks.length });
                console.log(`[TaskGenerator] ${generator.name}: generated ${tasks.length} tasks`);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[TaskGenerator] ${generator.name} FAILED:`, errorMsg);
                results.push({ name: generator.name, count: 0, error: errorMsg });
            }
        }

        return { tasks: allTasks, results };
    }

    getGeneratorNames(): string[] {
        return this.generators.map(g => g.name);
    }
}
