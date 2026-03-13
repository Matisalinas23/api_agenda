import request from "supertest";
import app from "../src/app";
import { generateAccessToken } from "../src/modules/auth/auth.service";
import { prisma } from "../src/lib/prisma";

const SECRET = process.env.SECRET!;
const token = generateAccessToken(999, "dup@test", SECRET);

describe("POST /notes/:id", () => {
    it("Should create a new note for an user", async () => {
        const res = await request(app)
            .post("/notes/999")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Nota Prueba",
                assignature: "Asig Prueba",
                color: "#8CADFE",
                limitDate: new Date(),
                description: "Descripcion de prueba",
            })

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("title");
        expect(res.body).toHaveProperty("assignature");
        expect(res.body).toHaveProperty("color");
        expect(res.body).toHaveProperty("limitDate");
        expect(res.body).toHaveProperty("description");

        await prisma.nota.delete({ where: { id: res.body.id} })
    })

    it("If ID is incorrect must return 404", async () => {
        const res = await request(app)
            .put("/notes/9999")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Nota Prueba",
                assignature: "Asig Prueba",
                color: "#8CADFE",
                limitDate: new Date(),
                description: "Descripcion de prueba",
            })
                
        expect(res.statusCode).toBe(404);
    })

    it("should return 400 if required fields are missing", async () => {

    const res = await request(app)
      .post("/notes/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: 21,
        assignature: "Asignaturedd",
        color: "#8CADFE",
        limitDate: "12-12-2012", // new Date(),
        description: "Descripcion de prueba",
      })

    expect(res.status).toBe(400)
  })
})

describe("PUT /notes/:id", () => {
    it("Should update an existing note", async () => {
        const token = generateAccessToken(999, "dup@test.com", SECRET);

        const res = await request(app)
            .put("/notes/4")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Prueba actualizada",
                assignature: "Asignatura actualizada",
                color: "#FFAA74",
                limitDate: new Date(),
                description: "Descripcion actualizada",
            })
        
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("title");
            expect(res.body).toHaveProperty("assignature");
            expect(res.body).toHaveProperty("color");
            expect(res.body).toHaveProperty("limitDate");
            expect(res.body).toHaveProperty("description");
    })
})

