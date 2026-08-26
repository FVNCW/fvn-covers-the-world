import { app } from "./engine/app";
import { env } from "./engine/env-load";
import "./engine/route";
import cliOptions from "./engine/cli";

if (cliOptions.env) {
	console.log(env);
}

app.listen(Number(env.FCTW_PORT), () => {
	console.log(env.FCTW_PORT);
});
