import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { vi } from "vitest";
import testPrisma from "./setup.js";

// Mock the prisma singleton to use the test client
vi.mock("../../lib/prisma.js", () => ({
	default: testPrisma,
}));

// Import app AFTER mocking prisma
const { default: app } = await import("../../app.js");
import request from "supertest";

describe("Task API E2E Tests", () => {
	beforeEach(async () => {
		// Clean up database between tests
		await testPrisma.task.deleteMany();
	});

	afterAll(async () => {
		await testPrisma.$disconnect();
	});

	describe("POST /api/tasks", () => {
		it("should create a new task", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ title: "E2E Task", description: "E2E Description" });

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			expect(res.body.title).toBe("E2E Task");
			expect(res.body.description).toBe("E2E Description");
			expect(res.body.completed).toBe(false);
		});
	});

	describe("GET /api/tasks", () => {
        it("should return all tasks", async () => {
            // 1. On crée une tâche d'abord
            await testPrisma.task.create({
                data: { title: "Task 1", description: "Desc 1" }
            });

            // 2. On vérifie qu'elle est bien récupérée
            const res = await request(app).get("/api/tasks");

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].title).toBe("Task 1");
        });
    });

    describe("DELETE /api/tasks/:id", () => {
        it("should delete a task", async () => {
            // 1. On crée une tâche
            const task = await testPrisma.task.create({
                data: { title: "Delete Me", description: "Desc" }
            });

            // 2. On la supprime
            const res = await request(app).delete(`/api/tasks/${task.id}`);

            expect(res.status).toBe(204);

            // 3. Vérification qu'elle n'existe plus
            const check = await testPrisma.task.findUnique({ where: { id: task.id } });
            expect(check).toBeNull();
        });
    });
});
