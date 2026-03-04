import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";

// REGISTER TESTS
describe("POST /auth/register", () => {
    // Register a new user with status code 201.
    // response body must have id, username, createdAt, verified, email and notes properties but pssword must not be included. 
    it("should register a new user", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                username: "matute02",
                email: "matutesalinas02@gmail.com",
                password: "matutesalinas02"
            });        

        expect(res.statusCode).toBe(201);

        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('username');
        expect(res.body).toHaveProperty('createdAt');
        expect(res.body).toHaveProperty('verified');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('notes');
        expect(res.body.email).toBe("matutesalinas02@gmail.com");
        expect(res.body.verified).toBe(false);
        expect(res.body.notes).toStrictEqual([]);

        expect(res.body).not.toHaveProperty("password");
    })

    // Register must fails if email is already registered with status code 409.
    it("should not allow duplicate email", async () => {
        const user = {
            username: "test",
            email: "dup@test.com",
            password: "123456"
        };

        const res = await request(app).post("/auth/register").send(user);

        expect(res.statusCode).toBe(409);
    });

    //Validation Error. Username must be a string, passwordd must be at least 6 characters, email must have valid format
    it("should not allow invalid data", async () => {
        const user = {
            username: 12345, //"user123", //null, //undefined,
            email: /*"user123-test.com",*/ "user123@test.com", //null //undefined,
            password: /*"user1",*/ "123456", //null, //undefined,
        };

        const res = await request(app).post("/auth/register").send(user);

        expect(res.statusCode).toBe(400);
    });

    afterAll(async () => {
        await prisma.verificationToken.deleteMany();
        await prisma.user.delete({
            where: {email: "matutesalinas02@gmail.com"}
        });
    });
})




// LOGIN TESTS
describe("POST /auth/login", () => {
    // Login is successfuly with status 200 and response body have a token property and set-cookie header with refresh token.
    it("should login a user", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "matisalinas1602@gmail.com",
                password: "matisalinas1602" 
            });
        
        expect(res.statusCode).toBe(200);
        expect(typeof res.body).toBe("string");
        expect(res.headers["set-cookie"]).toBeDefined();
    })

    afterAll(async () => {
        await prisma.$disconnect();
    })

    // Login must fail if email or password are incorrect with status 401.
    it("should not allow invalid credentials", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "matisalinas1602@gmail.com", //"matisali16gmail.com", //null, //undefined,
                password: /*"matisalinas1602",*/ "matisal1111", //null, //undefined,
            });
        
        expect(res.statusCode).toBe(401);
    })

    // Login must fail if user is not verified with status code 403.
    it("should not allow login for unverified users", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "notverified@test.com",
                password: "123456"
            });

        expect(res.statusCode).toBe(403);
    })

    afterAll(async () => {
        await prisma.$disconnect();
    })
})
