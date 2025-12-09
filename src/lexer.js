const KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "LIMIT",
  "ORDER",
  "BY",
  "ASC",
  "DESC",
  "JOIN",
  "ON",
  "AS",
]);

function isWhitespace(ch) {
  return /\s/.test(ch);
}
function isLetter(ch) {
  return /[a-zA-Z_]/.test(ch);
}
function isDigit(ch) {
  return /[0-9]/.test(ch);
}

export function tokenize(input) {
  const tokens = [];
  let i = 0;
  const len = input.length;
  while (i < len) {
    const ch = input[i];
    if (isWhitespace(ch)) {
      i++;
      continue;
    }

    if (ch === "," || ch === "(" || ch === ")" || ch === ";") {
      tokens.push({ type: ch, value: ch });
      i++;
      continue;
    }

    const two = input.substr(i, 2);
    if (two === ">=" || two === "<=" || two === "!=" || two === "<>") {
      tokens.push({ type: "OP", value: two });
      i += 2;
      continue;
    }

    if ("=<>+-*/".includes(ch)) {
      tokens.push({ type: "OP", value: ch });
      i++;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let str = "";
      while (j < len && input[j] !== quote) {
        if (input[j] === "\\" && j + 1 < len) {
          str += input[j + 1];
          j += 2;
        } else {
          str += input[j];
          j++;
        }
      }
      if (j >= len) throw new Error("No se pudo determinar el largo del string");
      tokens.push({ type: "STRING", value: str });
      i = j + 1;
      continue;
    }

    if (isDigit(ch)) {
      let j = i;
      while (j < len && (isDigit(input[j]) || input[j] === ".")) j++;
      const num = input.slice(i, j);
      tokens.push({ type: "NUMBER", value: Number(num) });
      i = j;
      continue;
    }

    // Esto es para las tablas que sigan con puntos. talble.column. TO TEST
    if (isLetter(ch)) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_.$]/.test(input[j])) j++;
      let word = input.slice(i, j);
      const upper = word.toUpperCase();
      if (KEYWORDS.has(upper)) tokens.push({ type: "KEYWORD", value: upper });
      else tokens.push({ type: "IDENT", value: word });
      i = j;
      continue;
    }

    throw new Error(`Caracter no permitido '${ch}' en posicion ${i}`);
  }
  tokens.push({ type: "EOF" });
  return tokens;
}
