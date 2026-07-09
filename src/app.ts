import * as Hapi from "@hapi/hapi";
import { registerHapiPlugins, registerServiceRoutes } from "./util/util.js";
import { getV1Routes } from "./routes/index.js";
import { UserHandlers } from "./routes/user/user.handlers.js";
import { UserRepo } from "./managers/user/user.repo.js";
import { TripHandlers } from "./routes/trip/trip.handlers.js";
import { TripRepo } from "./managers/trip/trip.repo.js";
import { TripManager } from "./managers/trip/trip.manager.js";

const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

const getAllowedOrigin = (origin: string | undefined): string | null => {
    if (!origin) {
        return null;
    }

    return allowedOrigins.includes(origin) ? origin : null;
};

const corsHeaders = (origin: string) => ({
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "Content-Type,Authorization",
});

export interface ServiceManagers {
    userRepo: UserRepo;
    tripRepo: TripRepo;
    tripManager: TripManager;
}

export interface ServiceHandlers {
    userHandlers: UserHandlers;
    tripHandlers: TripHandlers;
}

export async function createServer(handlers: ServiceHandlers): Promise<void> {
    const server = Hapi.server({
        port: 3000,
        host: "localhost",
        routes: {
            cors: {
                origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
                credentials: true,
                additionalHeaders: ["content-type", "authorization"],
            },
        },
    });

    server.route({
        method: "options",
        path: "/{any*}",
        handler: (request, h) => {
            const originHeader = request.headers["origin"];
            const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
            const allowedOrigin = getAllowedOrigin(origin);

            if (!allowedOrigin) {
                return h.response().code(204);
            }

            return h.response().code(204).header("access-control-allow-origin", allowedOrigin).header("access-control-allow-credentials", "true").header("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS").header("access-control-allow-headers", "Content-Type,Authorization");
        },
    });

    server.ext("onPreResponse", (request, h) => {
        const response = request.response;
        const originHeader = request.headers["origin"];
        const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
        const allowedOrigin = getAllowedOrigin(origin);

        if (!allowedOrigin) {
            return h.continue;
        }

        if (response && typeof response !== "string" && "header" in response) {
            const headers = corsHeaders(allowedOrigin);
            Object.entries(headers).forEach(([key, value]) => {
                response.header(key, value);
            });
        }

        return h.continue;
    });

    registerServiceRoutes(server, getV1Routes(handlers));

    await registerHapiPlugins(server);
    console.log("registered default hapi plugins");

    await server.start();
    console.log("Server running on %s", server.info.uri);
}

export function initManagers(): ServiceManagers {
    const userRepo = new UserRepo();
    const tripRepo = new TripRepo();

    const tripManager = TripManager.build({ tripRepo});

    // const productAggregator = ProductAggregator.build({ userRepo, productManager, companyManager });

    return { userRepo, tripRepo, tripManager, };
}

export function initHandlers(managers: ServiceManagers): ServiceHandlers {
    //const productHandlers = ProductHandlers.build({ productAggregator: managers.productAggregator });
    const userHandlers = UserHandlers.build({
        userRepo: managers.userRepo,
    });
    const tripHandlers = TripHandlers.build({
        tripManager: managers.tripManager,
    });

    return { userHandlers, tripHandlers };
}
