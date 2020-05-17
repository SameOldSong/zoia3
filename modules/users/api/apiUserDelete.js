import {
    ObjectId
} from "mongodb";
import userDelete from "./data/userDelete.json";

export default () => ({
    schema: {
        body: userDelete.root
    },
    attachValidation: true,
    async handler(req, rep) {
        // Validate form
        if (req.validationError) {
            rep.logError(req, req.validationError.message);
            rep.validationError(rep, req.validationError);
            return;
        }
        try {
            // Delete requested IDs
            const result = await this.mongo.db.collection("users").deleteMany({
                $or: req.body.ids.map(id => ({
                    _id: new ObjectId(id)
                }))
            });
            // Check result
            if (!result || !result.result || !result.result.ok) {
                rep.requestError(rep, {
                    failed: true,
                    error: "Could not delete one or more items",
                    errorKeyword: "deleteError",
                    errorData: []
                });
                return;
            }
            // Send "success" result
            rep.successJSON(rep);
            return;
        } catch (e) {
            rep.logError(req, null, e);
            rep.internalServerError(rep, e.message);
        }
    }
});