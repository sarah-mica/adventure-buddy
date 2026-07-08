import Boom from "@hapi/boom";
import { ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { StatusCodes } from "http-status-codes";
import { UserRepo } from "../../managers/user/user.repo.js";
import {
    CreateUserRequest,
    GetUserByUuidRequest,
    LoginRequest,
    UserResponse,
} from "./user.responses.js";

export class UserHandlers {
    public static build(options: {
        userRepo: UserRepo;
    }): UserHandlers {
        return new UserHandlers(options.userRepo);
    }

    private constructor(
        private readonly userRepo: UserRepo,
    ) {
        this.createUser = this.createUser.bind(this);
        this.getUserByUuid = this.getUserByUuid.bind(this);
        this.login = this.login.bind(this);
    }

    public async createUser(request: CreateUserRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { email, password, location } = request.payload;

        try {
            const user = await this.userRepo.create({
                email,
                password,
                location,
            });

            return h
                .response({ uuid: user.uuid, email: user.email, location: user.location })
                .code(StatusCodes.CREATED);
        } catch (error) {
            console.log("error", error);
            throw Boom.badRequest("Error creating user");
        }
    }

    public async getUserByUuid(request: GetUserByUuidRequest): Promise<UserResponse> {
        const { userUuid } = request.params;

        const user = await this.userRepo.getByUuid(userUuid);
        if (!user) {
            throw Boom.notFound("User not found");
        }

        return {
            uuid: user.uuid,
            email: user.email,
            location: user.location,
        };
    }

    public async login(request: LoginRequest): Promise<UserResponse> {
        const { email, password } = request.payload;

        const user = await this.userRepo.getByEmail(email);
        if (!user) {
            throw Boom.notFound("User not found");
        }

        if (user.password !== password) {
            throw Boom.unauthorized("Incorrect password");
        }

        return {
            uuid: user.uuid,
            email: user.email,
            location: user.location,
        };
    }
}
