"use strict";
// Considere um modelo de informação, onde um registro é representado por uma "tupla".
// Uma tupla (ou lista) nesse contexto é chamado de fato.

// Exemplo de um fato:
// ('joão', 'idade', 18, true)

// Nessa representação, a entidade 'joão' tem o atributo 'idade' com o valor '18'.

// Para indicar a remoção (ou retração) de uma informação, o quarto elemento da tupla pode ser 'false'
// para representar que a entidade não tem mais aquele valor associado aquele atributo.


// Como é comum em um modelo de entidades, os atributos de uma entidade pode ter cardinalidade 1 ou N (muitos).

// Segue um exemplo de fatos no formato de tuplas (E, A, V, added?)
// i.e. [entidade, atributo, valor, booleano indica se fato foi adicionado ou retraido)

var facts = [
  ['gabriel', 'endereço', 'av rio branco, 109', true],
  ['joão', 'endereço', 'rua alice, 10', true],
  ['joão', 'endereço', 'rua bob, 88', true],
  ['joão', 'telefone', '234-5678', true],
  ['joão', 'telefone', '91234-5555', true],
  ['joão', 'telefone', '234-5678', false],
  ['gabriel', 'telefone', '98888-1111', true],
  ['gabriel', 'telefone', '56789-1010', true],
];

// Vamos assumir que essa lista de fatos está ordenada dos mais antigos para os mais recentes.

// Nesse schema,
// o atributo 'telefone' tem cardinalidade 'muitos' (one-to-many), e 'endereço' é 'one-to-one'.
var schema = [
    ['endereço', 'cardinality', 'one'],
    ['telefone', 'cardinality', 'many']
];


// Nesse exemplo, os seguintes registros representam o histórico de endereços que joão já teve:
//  [
//   ['joão', 'endereço', 'rua alice, 10', true]
//   ['joão', 'endereço', 'rua bob, 88', true],
//]
// E o fato considerado vigente é o último.

// O objetivo desse desafio é escrever uma função que retorne quais são os fatos vigentes sobre essas entidades.
// Ou seja, quais são as informações que estão valendo no momento atual.
// A função deve receber `facts` (todos fatos conhecidos) e `schema` como argumentos.

// ------------------------------------------------------------------------------------------------------------------------------------------------------ //


// Pré processamento dos fatos. Aqui a matriz vira um array de objetos para simplificar o acesso aos campos.
function getFactsAsObjectsArray(facts) {
  var objArray = [];
  facts.forEach(
    (fact) => objArray.push(
      {entidade: fact[0], atributo: fact[1], valor: fact[2], added: fact[3]}
    )
  );
  return objArray;
}

// Pré processamento dos fatos. Aqui a matriz vira um array de objetos para simplificar o acesso aos campos.
// A princípio schema apenas contém informação de cardinalidade, por isso schema[1] for desconsiderado
function getSchemaAsObjectArray(schema) {
  var objArray = [];
  schema.forEach(
    (entry) => objArray.push(
      {atributo: entry[0], cardinalidade: entry[2]}
    )
  );
  return objArray;
}

function getFatosVigentes(facts, schema) {
  facts = getFactsAsObjectsArray(facts);
  schema = getSchemaAsObjectArray(schema);

  console.log(facts);
  console.log(schema);
}

getFatosVigentes(facts, schema);
