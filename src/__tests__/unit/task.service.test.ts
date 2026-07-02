import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@prisma/client";

// Mock the prisma module before importing the service
vi.mock("../../lib/prisma.js", () => {
	return {
		default: {
			task: {
				findMany: vi.fn(),
				findUnique: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				delete: vi.fn(),
			},
		},
	};
});

import prisma from "../../lib/prisma.js";
import * as taskService from "../../services/task.service.js";

const mockPrisma = vi.mocked(prisma);

const mockTask: Task = {
	id: 1,
	title: "Test Task",
	description: "A test task description",
	completed: false,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("TaskService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("findAll", () => {
		it("should return all tasks ordered by createdAt desc", async () => {
			const tasks = [mockTask];
			(mockPrisma.task.findMany as any).mockResolvedValue(tasks);

			const result = await taskService.findAll();

			expect(result).toEqual(tasks);
			expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
				orderBy: { createdAt: "desc" },
			});
		});
	});

	describe("findById", () => {
        it("should return a task by id", async () => {
            (mockPrisma.task.findUnique as any).mockResolvedValue(mockTask);

            const result = await taskService.findById(1);

            expect(result).toEqual(mockTask);
            expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    describe("create", () => {
        it("should create a new task", async () => {
            (mockPrisma.task.create as any).mockResolvedValue(mockTask);

            const result = await taskService.create({ title: "Test Task", description: "A test task description" });

            expect(result).toEqual(mockTask);
            expect(mockPrisma.task.create).toHaveBeenCalledWith({
                data: { title: "Test Task", description: "A test task description" },
            });
        });
    });

    describe("delete", () => {
    it("should delete a task", async () => {
        (mockPrisma.task.delete as any).mockResolvedValue(mockTask);

        // Utilise le nouveau nom ici
        await taskService.deleteTask(1); 

        expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
});
});
