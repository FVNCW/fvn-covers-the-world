import { t } from "elysia";

export const character = t.Object({
    display_name: t.String(),
    personality: t.String(),
});
