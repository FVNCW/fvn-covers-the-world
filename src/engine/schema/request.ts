import { t } from "elysia";

export const character = t.Object({
    displayName: t.String(),
    personality: t.String(),
});
