import { ServerRoute } from "@hapi/hapi";
import { ServiceHandlers } from "../app.js";
import { userRoutes } from "./user/user.routes.js";

export const getV1Routes = (handlers: ServiceHandlers): ServerRoute[] => [
    ...userRoutes(handlers.userHandlers),
];
