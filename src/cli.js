import fs from "fs";
import { parse } from "./parser.js";
import { generate } from "./generador.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isMain = process.argv[1] === __filename;

export function runSql(sql) {
  try {
    const ast = parse(sql);
    const out = generate(ast);
    return { ast, out };
  } catch (err) {
    return { error: err.message };
  }
}

if (isMain) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Uso: node src/cli.js "SELECT ..."  (o pasar -f archivo.sql)');
    process.exit(0);
  }
  if (args[0] === "-f" && args[1]) {
    const sql = fs.readFileSync(args[1], "utf8");
    const res = runSql(sql);
    if (res.error) {
      console.error("ERROR:", res.error);
      process.exit(1);
    }
    console.log(res.out);
  } else {
    const sql = args.join(" ");
    const res = runSql(sql);
    if (res.error) {
      console.error("ERROR:", res.error);
      process.exit(1);
    }
    console.log(res.out);
  }
}
