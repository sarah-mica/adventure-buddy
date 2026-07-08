import { Boom } from "@hapi/boom";
import { Plugin, Request, ResponseToolkit, Server } from "@hapi/hapi";

const preResponse = (request: Request, h: ResponseToolkit) => {
    const response = request.response;

    if ((response as Boom).isBoom) {
        const res = response as Boom;

        (res.output.payload as any) = {
            errors: [
                {
                    status: res.output.statusCode,
                    title: res.output.payload.error,
                    detail: res.output.payload.message,
                    data: res.data,
                },
            ],
        };
    }

    return h.continue;
};

export const jsonapiErrorPlugin: Plugin<void> = {
    name: "jsonapi-error",
    version: "0.0.0",
    register: async (server: Server) => {
        server.ext("onPreResponse", preResponse);
    },
};
