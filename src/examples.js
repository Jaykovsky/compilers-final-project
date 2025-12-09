import { parse } from "./parser.js";
import { generate } from "./generador.js";

function run(sql) {
  try {
    const ast = parse(sql);
    const out = generate(ast);
    console.log("-- SQL:", sql);
    console.log(out);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}

const examples = [
  `SELECT nombre, edad FROM usuarios WHERE edad > 20;`,
  `SELECT nombre, libro_id, text_id FROM productos WHERE precio >= 100 AND categoria = 'libros' LIMIT 10;`,
  `INSERT INTO usuarios (nombre,edad,email) VALUES ('Ana', 28, 'ana@mail.com');`,
  `UPDATE usuarios SET puntos = 100 WHERE id = 5;`,
  `DELETE FROM sesiones WHERE expirado = 1;`,
  `SELECT id FROM users WHERE id = 2;`,
];

for (const ex of examples) run(ex);
