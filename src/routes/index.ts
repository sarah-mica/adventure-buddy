import { ServerRoute } from "@hapi/hapi";
import { ServiceHandlers } from "../app.js";
import { userRoutes } from "./user/user.routes.js";
import { tripRoutes } from "./trip/trip.routes.js";

export const getV1Routes = (handlers: ServiceHandlers): ServerRoute[] => [
    ...tripRoutes(handlers.tripHandlers), 
    ...userRoutes(handlers.userHandlers),
];
