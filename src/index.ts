import { app } from "./engine/app";
import { env } from "./engine/env-load";
import "./engine/route";

app.listen(Number(env.FCTW_PORT), () => {
    console.log(env.FCTW_PORT);
});
