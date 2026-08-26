import { program } from "commander";

program.option("-e, --env", "", false);
program.parse();

export default program.opts() satisfies Partial<{
	env: boolean;
}>;
