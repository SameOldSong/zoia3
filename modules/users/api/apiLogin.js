import crypto from "crypto";
import {
    v4 as uuid
} from "uuid";

export default fastify => ({
    schema: {
        body: {
            type: "object",
            properties: {
                username: {
                    type: "string",
                    minLength: 4,
                    maxLength: 32,
                    pattern: "^[a-zA-Z0-9_-]+$"
                },
                password: {
                    type: "string",
                    minLength: 8,
                    maxLength: 64
                }
            },
            required: ["username", "password"]
        }
    },
    attachValidation: true,
    async handler(req, rep) {
        if (req.validationError) {
            rep.logError(req, req.validationError.message);
            rep.validationError(rep, req.validationError);
            return;
        }
        try {
            const user = await this.mongo.db.collection("users").findOne({
                username: req.body.username.toLowerCase()
            });
            const passwordHash = crypto.createHmac("sha256", req.zoiaConfig.secret).update(req.body.password).digest("hex");
            if (!user || user.password !== passwordHash || !user.active) {
                rep.unauthorizedError(rep);
                return;
            }
            const ip = crypto.createHmac("md5", req.zoiaConfig.secret).update(req.body.password).digest("hex");
            const sessionId = user.sessionId || uuid();
            const token = fastify.jwt.sign({
                userId: String(user._id),
                sessionId,
                ip
            }, {
                expiresIn: req.zoiaConfig.authTokenExpiresIn
            });
            // Update database and set session ID
            await this.mongo.db.collection("users").updateOne({
                _id: user._id
            }, {
                $set: {
                    sessionId
                }
            });
            rep.successJSON(rep, {
                token
            });
            return;
        } catch (e) {
            rep.logError(req, null, e);
            rep.internalServerError(rep, e.message);
        }
    }
});