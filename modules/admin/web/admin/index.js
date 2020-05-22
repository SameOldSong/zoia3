import fs from "fs-extra";
import path from "path";
import Auth from "../../../../shared/lib/auth";
import template from "./template.marko";
import C from "../../../../shared/lib/constants";
import moduleData from "../../module.json";

const packageJson = fs.readJSONSync(path.resolve(`${__dirname}/../../package.json`));

export default (fastify) => ({
    async handler(req, rep) {
        const auth = new Auth(this.mongo.db, fastify, req, rep, C.USE_COOKIE_FOR_TOKEN);
        try {
            const site = new req.ZoiaSite(req, "admin");
            if (!(await auth.getUserData()) || !auth.checkStatus("admin")) {
                auth.clearAuthCookie();
                return rep.redirectToLogin(req, rep, site, "/admin");
            }
            site.setAuth(auth);
            const render = await template.stream({
                $global: {
                    serializedGlobals: {
                        template: true,
                        pageTitle: true,
                        ...site.getSerializedGlobals()
                    },
                    template: "admin",
                    pageTitle: `${site.i18n.t("moduleTitle")} | ${site.i18n.t("adminPanel")}`,
                    ...site.getGlobals()
                },
                modules: req.zoiaModules,
                version: packageJson.version,
                moduleId: moduleData.id
            });
            return rep.sendHTML(rep, render);
        } catch (e) {
            return Promise.reject(e);
        }
    }
});
