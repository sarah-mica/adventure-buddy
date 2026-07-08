import { initHandlers, createServer, initManagers } from "./app";
import { initModels } from "./models";

(async () => {
    await initModels({
        dialect: "sqlite",
        logging: true,
        supportsUpdateOnDuplicates: true,
        paranoid: false,
    });
    console.log("Initialized Sequelize models");

    const managers = initManagers();
    console.log("initialized Managers");

    const handlers = initHandlers(managers);
    console.log("initialized Handlers");

    await createServer(handlers);

    //return app.boot();
})().catch((e) => {
    console.error(`root: Error: ${e}`);
    process.exit(1);
});