import * as Hapi from "@hapi/hapi";
import { registerHapiPlugins, registerServiceRoutes } from "./util/util.js";
import { getV1Routes } from "./routes/index.js";
import { UserHandlers } from "./routes/user/user.handlers.js";
import { UserRepo } from "./managers/user/user.repo.js";


export interface ServiceManagers {
    userRepo: UserRepo;
}

export interface ServiceHandlers {
    userHandlers: UserHandlers;
}

export async function createServer(handlers: ServiceHandlers): Promise<void> {
    const server = Hapi.server({
        port: 3000,
        host: "localhost",
    });

    registerServiceRoutes(server, getV1Routes(handlers), "v1");

    await registerHapiPlugins(server);
    console.log("registered default hapi plugins");

    await server.start();
    console.log("Server running on %s", server.info.uri);
}

export function initManagers(): ServiceManagers {
    const userRepo = new UserRepo();

    // const productAggregator = ProductAggregator.build({ userRepo, productManager, companyManager });

    return { userRepo };
}

export function initHandlers(managers: ServiceManagers): ServiceHandlers {
    //const productHandlers = ProductHandlers.build({ productAggregator: managers.productAggregator });
    const userHandlers = UserHandlers.build({
        userRepo: managers.userRepo,
    });

    return { userHandlers };
}
