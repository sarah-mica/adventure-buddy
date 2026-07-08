import { Request } from "@hapi/hapi";
import Joi from "joi";

export type CreateUserRequest = Request<{
    Payload: {
        email: string;
        password: string;
        location: string;
    };
}>;

export type UserResponse = {
    uuid: string;
    email: string;
    location: string;
};

export type GetUserByUuidRequest = Request<{
    Params: {
        userUuid: string;
    };
}>;

export type LoginRequest = Request<{
    Payload: {
        email: string;
        password: string;
    };
}>;

export const createUserPayloadSchema = Joi.object<CreateUserRequest["payload"]>({
    email: Joi.string().required().description("User email"),
    password: Joi.string().required().description("User password"),
    location: Joi.string().required().description("User location"),
}).label("CreateUserPayload");

export const getUserByUuidParamsSchema = Joi.object<GetUserByUuidRequest["params"]>({
    userUuid: Joi.string().required().description("User uuid"),
}).label("GetUserByUuidParams");

export const loginRequestSchema = Joi.object<LoginRequest["payload"]>({
    email: Joi.string().required().description("User email"),
    password: Joi.string().required().description("User password"),
}).label("LoginRequest");

export const userResponseSchema = Joi.object<UserResponse>({
    uuid: Joi.string().description("User uuid"),
    email: Joi.string().description("User email"),
    location: Joi.string().description("User location"),
}).label("UserResponse");

