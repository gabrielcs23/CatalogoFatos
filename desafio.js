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

// Resultado esperado para este exemplo (mas não precisa ser nessa ordem):
/* 
[
  ['gabriel', 'endereço', 'av rio branco, 109', true],
  ['joão', 'endereço', 'rua bob, 88', true],
  ['joão', 'telefone', '91234-5555', true],
  ['gabriel', 'telefone', '98888-1111', true],
  ['gabriel', 'telefone', '56789-1010', true]
];
 */
// -------------------------------------------------------------------------------------------------------------- //


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
// A princípio schema apenas contém informação de cardinalidade, por isso schema[1] foi desconsiderado
function getSchemaAsObjectArray(schema) {
  var objArray = [];
  schema.forEach(
    (entry) => objArray.push(
      {atributo: entry[0], cardinalidade: entry[2]}
    )
  );
  return objArray;
}

// Como a ordem de resposta não importa, os registros serão armazenados no Map mapaEntidades onde cada chave representa uma entidade do catálogo.
// Cada valor de mapaEntidades será um novo mapa (chamado de mapaAtr) onde o par [chave:valor] será dado por [atributo:fato], onde fato é uma tupla.
/* e.g. 
  Map {                                                                       //mapaEntidades
    'gabriel' => Map {                                                        //mapaAtr
      'endereço' => [ ['gabriel', 'endereço', 'av rio branco, 109', true] ]   //fato
    },
    'joão' => Map {                                                           //mapaAtr
      'endereço' => [ ['joão', 'endereço', 'rua bob, 88', true] ]             //fato
      'telefone' => [ 
        ['joão', 'telefone', '234-5678', true],                               //fato
        ['joão', 'telefone', '91234-5555', true]                              //fato
      ]
    }
  }
*/

function getFatosVigentes(facts, schema) {
  facts = getFactsAsObjectsArray(facts);
  schema = getSchemaAsObjectArray(schema);

  if (facts.length > 0 && schema.length > 0) {
    var mapaEntidades = new Map();
    facts.forEach(
      (fact) => {
        if (mapaEntidades.has(fact.entidade)) {
          var atrSchema = schema.find(
            (entry) => entry.atributo === fact.atributo
          );
          if (fact.added) {
            var mapaAtr = mapaEntidades.get(fact.entidade);
            if (mapaAtr.has(fact.atributo) && atrSchema.cardinalidade === 'many') {
              mapaAtr.get(fact.atributo).push(Object.values(fact)); // Quando cardinalidade é N (muitos), basta adicionar o novo valor
            } else { // Do contrário substitui o valor antigo
              mapaAtr.set(fact.atributo, [Object.values(fact)]);
            }
          } else {
            if (atrSchema.cardinalidade === 'one') { // Cardinalidade 1 apenas remove o valor
              mapaEntidades.delete(fact.entidade);
            } else { // Cardinalidade N procura o valor antes de remover
              const fatos = mapaEntidades.get(fact.entidade).get(fact.atributo);
              const idx = fatos.findIndex(
                (fato) => fato[2] === fact.valor
              );
              if (idx === -1) {
                console.error('Valor a ser removido não encontrado no catálogo');
                return;
              }
              fatos.splice(idx, 1);
            }
          }
        } else {
          if (!fact.added) {
            console.error('Valor a ser removido não encontrado no catálogo');
            return;
          }
          var mapaAtr = new Map();
          mapaAtr.set(fact.atributo, [Object.values(fact)]);
          mapaEntidades.set(fact.entidade, mapaAtr);
        }
      }
    );
    // Remonta os fatos como uma matriz mas considerando apenas os vigentes
    var fatosVigentes = [];
    // Neste ponto colocar os dois laços poderia afetar o desempenho caso Facts for muito grande.
    // Entretanto a escolha de usar os métodos de Map nos passos anteriores é mais vantajoso do que realizar buscas diretas em um Array
    mapaEntidades.forEach(
      (mapaAtr, chaveFatos, map) => {        
        mapaAtr.forEach(
          (fatos, chaveAtr, map) => fatosVigentes = fatosVigentes.concat(fatos) // concat para adicionar os valores apenas
        )
      }
    );
    return fatosVigentes;
  }

  return [];
}

getFatosVigentes(facts, schema);
