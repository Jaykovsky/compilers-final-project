export function generate(ast) {
  switch (ast.type) {
    case "select":
      return genSelect(ast);
    case "insert":
      return genInsert(ast);
    case "update":
      return genUpdate(ast);
    case "delete":
      return genDelete(ast);
    default:
      throw new Error("Generador: tipo no soportado " + ast.type);
  }
}

function litToMongo(v) {
  if (typeof v === "number") return v;
  // Parsea un string numerico ? To test
  if (!isNaN(v) && v !== "") return Number(v);
  return v;
}

function cmpToMongo(op, right) {
  switch (op) {
    case "=":
      return right;
    case "!=":
    case "<>":
      return { $ne: right };
    case ">":
      return { $gt: right };
    case "<":
      return { $lt: right };
    case ">=":
      return { $gte: right };
    case "<=":
      return { $lte: right };
    default:
      throw new Error("Operador no soportado: " + op);
  }
}

function exprToFilter(expr) {
  if (!expr) return {};
  if (expr.type === "cmp") {
    const right = litToMongo(expr.right);
    const v = cmpToMongo(expr.op, right);
    if (typeof v === "object" && !(v instanceof Array))
      return { [expr.left]: v };
    return { [expr.left]: v };
  }
  if (expr.type === "and") {
    return { $and: [exprToFilter(expr.left), exprToFilter(expr.right)] };
  }
  if (expr.type === "or") {
    return { $or: [exprToFilter(expr.left), exprToFilter(expr.right)] };
  }
  throw new Error("Expresión no soportada en exprToFilter: " + expr.type);
}

function genSelect(ast) {
  const coll = ast.table;
  const filter = exprToFilter(ast.where);
  let proj = null;
  if (ast.fields.length === 1 && ast.fields[0].type === "*") proj = null;
  else {
    proj = {};
    for (const f of ast.fields) {
      if (f.type === "field") proj[f.value] = 1;
    }
  }
  let out = `db.${coll}.find(${JSON.stringify(filter)}`;
  if (proj) out += `, ${JSON.stringify(proj)}`;
  out += `)`;
  if (ast.orderBy) {
    const dir = ast.orderBy.dir === "DESC" ? -1 : 1;
    out += `.sort({ "${ast.orderBy.col}": ${dir} })`;
  }
  if (ast.limit) out += `.limit(${ast.limit})`;
  return out + ";";
}

function genInsert(ast) {
  const coll = ast.table;
  const doc = {};
  if (ast.cols && ast.cols.length > 0) {
    for (let i = 0; i < ast.cols.length; i++) {
      const c = ast.cols[i];
      doc[c] = litToMongo(ast.values[i]);
    }
  } else {
    // if no cols, assume single value is document?
    for (let i = 0; i < ast.values.length; i++)
      doc[`col${i}`] = litToMongo(ast.values[i]);
  }
  return `db.${coll}.insertOne(${JSON.stringify(doc)});`;
}

function genUpdate(ast) {
  const coll = ast.table;
  const filter = exprToFilter(ast.where);
  const set = { $set: {} };
  for (const k of Object.keys(ast.assignments)) {
    set.$set[k] = litToMongo(ast.assignments[k]);
  }
  return `db.${coll}.updateMany(${JSON.stringify(filter)}, ${JSON.stringify(set)});`;
}

function genDelete(ast) {
  const coll = ast.table;
  const filter = exprToFilter(ast.where);
  return `db.${coll}.deleteMany(${JSON.stringify(filter)});`;
}
