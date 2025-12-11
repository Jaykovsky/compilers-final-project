## 📌 Descripción del Proyecto

Este proyecto es un **transpilador** que toma una consulta SQL y la convierte automáticamente en una instrucción equivalente de **MongoDB**.  
Está desarrollado en **Node.js** y funciona como herramienta educativa para comprender cómo se traducen operaciones de SQL (modelo relacional) a MongoDB (modelo documental).

Soporta:

- `SELECT` → `find()`
- `INSERT` → `insertOne()`
- `UPDATE` → `updateMany()`
- `DELETE` → `deleteMany()`

---

## 🚀 Objetivos

- Comprender diferencias entre SQL y MongoDB  
- Implementar un lexer y parser manual  
- Generar un AST y traducirlo a MongoDB  
- Desarrollar habilidades en parsing y generación de código  

---

## 📂 Estructura del Proyecto

```

sql-to-mongo/
│
├── src/
│   ├── lexer.js
│   ├── parser.js
│   ├── generador.js
│   ├── cli.js
│   ├── examples.js
│   ├── index.js
│
└── README.md

````

---

## 📦 Instalación

```bash
git clone https://github.com/Jaykovsky/compilers-final-project
cd sql-to-mongo
npm install
````

---

## ▶️ Uso

```js
const { transpileSQL } = require("./src");

const sql = "SELECT nombre, edad FROM usuarios WHERE edad > 20;";
console.log(transpileSQL(sql));
```

Salida:

```js
db.usuarios.find({ "edad": { "$gt": 20 } }, { "nombre": 1, "edad": 1 });
```

---

## 📘 Sentencias soportadas

### **SELECT**

**SQL**

```sql
SELECT nombre, edad FROM usuarios WHERE edad > 20;
```

**MongoDB**

```js
db.usuarios.find({ edad: { $gt: 20 } }, { nombre: 1, edad: 1 });
```

---

### **INSERT**

```sql
INSERT INTO usuarios (nombre, edad, email) VALUES ('Ana', 28, 'ana@mail.com');
```

```js
db.usuarios.insertOne({ nombre: "Ana", edad: 28, email: "ana@mail.com" });
```

---

### **UPDATE**

```sql
UPDATE usuarios SET puntos = 100 WHERE id = 5;
```

```js
db.usuarios.updateMany({ id: 5 }, { $set: { puntos: 100 } });
```

---

### **DELETE**

```sql
DELETE FROM usuarios WHERE expirado = 1;
```

```js
db.usuarios.deleteMany({ expirado: 1 });
```

---

## 🧠 ¿Cómo funciona?

El transpilador se divide en 3 etapas:

---

### 1️⃣ Lexer (Análisis Léxico)

Convierte la cadena SQL en tokens, por ejemplo:

```
SELECT nombre FROM usuarios
```

→

```
[SELECT, IDENT(nombre), FROM, IDENT(usuarios)]
```

---

### 2️⃣ Parser (Análisis Sintáctico)

Construye el AST (árbol sintáctico):

```json
{
  "type": "SELECT",
  "fields": ["nombre", "edad"],
  "table": "usuarios",
  "where": {
    "field": "edad",
    "op": ">",
    "value": 20
  }
}
```

---

### 3️⃣ Translator (Generación de Código)

Traduce el AST a MongoDB usando equivalencias:

* `>` → `$gt`
* `<` → `$lt`
* `=` → valor directo
* Tabla SQL → colección Mongo
* Campos → proyección

---

## 🧪 Tests

```bash
npm test
```

Incluye casos reales de SQL → MongoDB.

---

## 📌 Limitaciones

* No soporta `SELECT *`
* No soporta expresiones complejas (`AND`, `OR`, paréntesis)
* Parser simple (no usa gramáticas formales)

---

```

```

