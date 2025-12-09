import { tokenize } from "./lexer.js";

export function parse(input) {
  const tokens = tokenize(input);
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function next() {
    return tokens[pos++];
  }

  function expect(type, val) {
    const t = peek();
    if (!t) throw new Error(`Se esperaba ${type} pero es un EOF`);
    if (t.type !== type && t.type !== "KEYWORD")
      throw new Error(`Se esperaba ${type} pero es ${t.type} (${t.value})`);
    if (val && t.value !== val)
      throw new Error(`Se esperaba ${val} pero es ${t.value}`);
    return next();
  }

  function parseStatement() {
    const t = peek();
    if (t.type === "KEYWORD") {
      if (t.value === "SELECT") return parseSelect();
      if (t.value === "INSERT") return parseInsert();
      if (t.value === "UPDATE") return parseUpdate();
      if (t.value === "DELETE") return parseDelete();
    }
    throw new Error(`No se soporta la query ${t.type} ${t.value}`);
  }

  // Identificadores con .
  function parseIdentifier() {
    const t = peek();
    if (t.type === "IDENT") {
      next();
      return t.value;
    }
    if (t.type === "KEYWORD") {
      next();
      return t.value.toLowerCase();
    } // ejemplo users.id, es decir, tabla.columna
    throw new Error(`Se esperaba pero se obtuvo ${t.type} ${t.value}`);
  }

  function parseSelect() {
    expect("KEYWORD", "SELECT");
    const fields = parseSelectList();
    expect("KEYWORD", "FROM");
    const table = parseIdentifier();
    // optional alias not critical
    // optional WHERE
    let where = null;
    let orderBy = null;
    let limit = null;
    while (peek().type !== "EOF" && peek().type !== ";") {
      const t = peek();
      if (t.type === "KEYWORD" && t.value === "WHERE") {
        next();
        where = parseExpr();
        continue;
      }
      if (t.type === "KEYWORD" && t.value === "LIMIT") {
        next();
        const n = next();
        if (n.type !== "NUMBER") throw new Error("LIMIT requires number");
        limit = n.value;
        continue;
      }
      if (t.type === "KEYWORD" && t.value === "ORDER") {
        // ORDER BY col [ASC|DESC]
        next();
        expect("KEYWORD", "BY");
        const col = parseIdentifier();
        let dir = "ASC";
        if (
          peek().type === "KEYWORD" &&
          (peek().value === "ASC" || peek().value === "DESC")
        )
          dir = next().value;
        orderBy = { col, dir };
        continue;
      }
      break;
    }
    return { type: "select", table, fields, where, limit, orderBy };
  }

  function parseSelectList() {
    const list = [];
    while (true) {
      const p = peek();
      if (p.type === "*") {
        next();
        list.push({ type: "*" });
      } else if (p.type === "IDENT" || p.type === "KEYWORD") {
        const id = parseIdentifier();
        list.push({ type: "field", value: id });
      } else {
        throw new Error(
          `Unexpected token in select list: ${p.type} ${p.value}`,
        );
      }
      if (peek().type === ",") {
        next();
        continue;
      } else break;
    }
    return list;
  }

  function parseInsert() {
    expect("KEYWORD", "INSERT");
    expect("KEYWORD", "INTO");
    const table = parseIdentifier();
    // optional column list
    let cols = [];
    if (peek().type === "(") {
      next();
      while (true) {
        const id = parseIdentifier();
        cols.push(id);
        if (peek().type === ",") {
          next();
          continue;
        }
        if (peek().type === ")") {
          next();
          break;
        }
        throw new Error("Unexpected token in column list");
      }
    }
    expect("KEYWORD", "VALUES");
    // assume one value list
    expect("(");
    const vals = [];
    while (true) {
      const v = next();
      if (v.type === "STRING" || v.type === "NUMBER" || v.type === "IDENT") {
        vals.push(v.value);
      } else {
        throw new Error("Unsupported value type in VALUES");
      }
      if (peek().type === ",") {
        next();
        continue;
      }
      if (peek().type === ")") {
        next();
        break;
      }
    }
    return { type: "insert", table, cols, values: vals };
  }

  function parseUpdate() {
    expect("KEYWORD", "UPDATE");
    const table = parseIdentifier();
    expect("KEYWORD", "SET");
    const assignments = {};
    while (true) {
      const col = parseIdentifier();
      const op = next();
      if (op.type !== "OP" || op.value !== "=")
        throw new Error("Expected '=' in SET");
      const valT = next();
      if (
        !(
          valT.type === "STRING" ||
          valT.type === "NUMBER" ||
          valT.type === "IDENT"
        )
      )
        throw new Error("Unsupported value in SET");
      assignments[col] = valT.value;
      if (peek().type === ",") {
        next();
        continue;
      }
      break;
    }
    let where = null;
    if (peek().type === "KEYWORD" && peek().value === "WHERE") {
      next();
      where = parseExpr();
    }
    return { type: "update", table, assignments, where };
  }

  function parseDelete() {
    expect("KEYWORD", "DELETE");
    expect("KEYWORD", "FROM");
    const table = parseIdentifier();
    let where = null;
    if (peek().type === "KEYWORD" && peek().value === "WHERE") {
      next();
      where = parseExpr();
    }
    return { type: "delete", table, where };
  }

  // Niveles OR -> AND -> comparison -> primary
  function parseExpr() {
    return parseOr();
  }
  function parseOr() {
    let left = parseAnd();
    while (peek().type === "KEYWORD" && peek().value === "OR") {
      next();
      const right = parseAnd();
      left = { type: "or", left, right };
    }
    return left;
  }
  function parseAnd() {
    let left = parseComparison();
    while (peek().type === "KEYWORD" && peek().value === "AND") {
      next();
      const right = parseComparison();
      left = { type: "and", left, right };
    }
    return left;
  }
  function parseComparison() {
    if (peek().type === "(") {
      next();
      const e = parseExpr();
      expect(")");
      return e;
    }
    const leftToken = next();
    if (!(leftToken.type === "IDENT"))
      throw new Error("El operador debe ser de comparacion");
    const left = leftToken.value;
    const op = next();
    if (op.type !== "OP")
      throw new Error("Se esperaba operador de comparacion");
    const rightToken = next();
    if (
      !(
        rightToken.type === "IDENT" ||
        rightToken.type === "STRING" ||
        rightToken.type === "NUMBER"
      )
    )
      throw new Error("El operador debe ser literal o de indetacion");
    const right = rightToken.value;
    return { type: "cmp", op: op.value, left, right };
  }

  const ast = parseStatement();
  return ast;
}
