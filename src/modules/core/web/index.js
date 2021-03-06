import download from "./download";

export default fastify => {
    fastify.get(fastify.zoiaConfig.routes.download, download());
    fastify.get(`/:language${fastify.zoiaConfig.routes.download}`, download());
};
