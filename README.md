🗃️ SQL-to-MongoDB Transpiler

Un transpilador escrito en Node.js que convierte consultas SQL básicas (SELECT, INSERT, UPDATE y DELETE) en consultas equivalentes de MongoDB usando sintaxis JavaScript.

Este proyecto demuestra el pipeline completo de un compilador:

Análisis léxico (lexer)

Análisis sintáctico (parser)

Construcción del AST

Análisis semántico simple

Generación de código MongoDB

Es ideal para un curso de Compiladores, Lenguajes de Programación o Bases de Datos.

📖 Descripción General

Este proyecto permitió construir un transpilador capaz de:

✔️ Leer una consulta SQL
✔️ Convertirla en tokens mediante un lexer
✔️ Parsearla usando una gramática definida manualmente
✔️ Generar un Árbol Sintáctico Abstracto (AST)
✔️ Producir una consulta MongoDB equivalente

De esta forma, un usuario que conoce SQL puede interactuar con bases de datos NoSQL como MongoDB sin aprender otro lenguaje de consultas.

⭐ Características
✔️ Soporta los siguientes comandos SQL:

SELECT

INSERT

UPDATE

DELETE

✔️ Soporta:

WHERE con operadores:
=, !=, >, <, >=, <=

AND / OR

SELECT columna1, columna2

SELECT *

Inserción de múltiples columnas

Update con múltiples asignaciones

Eliminación con condiciones

✔️ Genera código válido de MongoDB:

db.collection.find(query, projection)

db.collection.insertOne(document)

db.collection.updateMany(filter, update)

db.collection.deleteMany(filter)

✔️ Implementado 100% con Node.js (sin librerías externas de parsing)

🧠 Arquitectura del Compilador

El transpiler sigue el pipeline clásico de un compilador:

SQL Query
    │
    ▼
┌────────┐
│ Lexer  │ — reconoce tokens
└────────┘
    │
    ▼
┌────────┐
│ Parser │ — arma el AST según la gramática
└────────┘
    │
    ▼
┌──────────────┐
│ AST Builder  │
└──────────────┘
    │
    ▼
┌─────────────────┐
│ Code Generator  │ — produce MongoDB JS
└─────────────────┘
    │
    ▼
MongoDB Query

📦 Instalación
git clone https://github.com/Jaykovsky/compilers-final-project
cd sql-to-mongo-transpiler
npm install

▶️ Uso

Ejecutar desde la terminal:

node transpiler.js "SELECT nombre FROM usuarios WHERE edad > 20;"


Salida:

db.usuarios.find({"edad":{"$gt":20}}, {"nombre":1});


También puedes ejecutar los tests incluidos:

npm test

🧪 Ejemplos de Transpilación
🔹 SELECT con columnas

SQL:

SELECT nombre, edad FROM usuarios WHERE edad > 20;


MongoDB:

db.usuarios.find({ "edad": { "$gt": 20 } }, { "nombre": 1, "edad": 1 });

🔹 SELECT *

SQL:

SELECT * FROM usuarios WHERE activo = 1;


MongoDB:

db.usuarios.find({ "activo": 1 });

🔹 INSERT
INSERT INTO usuarios (nombre, edad, email) VALUES ('Ana', 28, 'ana@mail.com');


MongoDB:

db.usuarios.insertOne({
  "nombre": "Ana",
  "edad": 28,
  "email": "ana@mail.com"
});

🔹 UPDATE
UPDATE usuarios SET puntos = 100 WHERE id = 5;


MongoDB:

db.usuarios.updateMany({ "id": 5 }, { "$set": { "puntos": 100 }});

🔹 DELETE
DELETE FROM sesiones WHERE expirado = 1;


MongoDB:

db.sesiones.deleteMany({ "expirado": 1 });

📁 Estructura del Código
/project
   ├── lexer.js          → análisis léxico
   ├── parser.js         → gramática y construcción del AST
   ├── ast.js            → definición de nodos del AST
   ├── generator.js      → generación de código MongoDB
   ├── transpiler.js     → CLI y flujo principal
   ├── tests/
   │     └── examples.js → casos de prueba
   └── README.md

⚠️ Limitaciones

Este proyecto implementa una subconjunto de SQL:

No soporta *

No soporta JOIN

No soporta GROUP BY, HAVING, ORDER BY

No soporta subconsultas

No soporta funciones: COUNT(), MAX(), etc.

Asume sintaxis SQL simple y bien formada
