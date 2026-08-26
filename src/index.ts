import { env } from "./engine/env-load";
import cliOptions from "./engine/cli";

if (cliOptions.env) {
	console.log(env);
}

import { app } from "./engine/app";
import "./engine/route";

app.listen(Number(env.FCTW_PORT), () => {
	console.log(env.FCTW_PORT);
});
