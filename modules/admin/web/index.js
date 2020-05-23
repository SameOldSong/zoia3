import admin from "./admin";

export default fastify => {
    fastify.get(fastify.zoiaModulesConfig["admin"].routes.admin, admin(fastify));
    fastify.get(`/:language${fastify.zoiaModulesConfig["admin"].routes.admin}`, admin(fastify));
};
