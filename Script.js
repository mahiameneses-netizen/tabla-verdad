function agregar(valor){
    document.getElementById("expresion").value += valor;
}

function borrarUno(){
    let exp = document.getElementById("expresion");
    exp.value = exp.value.slice(0,-1);
}

function borrarTodo(){
    document.getElementById("expresion").value = "";
    document.getElementById("resultado").innerHTML = "";
}

function esProposicion(c){
    return ["p","q","r","s"].includes(c);
}

function esOperador(c){
    return ["∧","∨","→","↔"].includes(c);
}

function validar(exp){

    if(exp.length === 0)
        return "Expresión vacía.";

    for(let i=0;i<exp.length;i++){

        if(i>0 && esOperador(exp[i]) && esOperador(exp[i-1])){
            return `Tiene dos o más operadores seguidos en el caracter ${i}. Tal vez le falta una proposición.`;
        }

        if(i>0 && esProposicion(exp[i-1]) && exp[i]==="¬"){
            return `Tiene una proposición en el caracter ${i-1} y justo después una negación. Tal vez le falta un operador antes de la negación.`;
        }

        if(i>0 && exp[i-1]==="¬" && esOperador(exp[i])){
            return `Tiene una negación en el caracter ${i-1} y luego un operador. Parece que omitió una proposición después de la negación.`;
        }

        if((i===0 || i===exp.length-1) && esOperador(exp[i])){
            return "Operador inválido en posición incorrecta o falta ingresar una proposición.";
        }
    }

    return null;
}

function generarTabla(){

    let exp = document.getElementById("expresion").value;
    let error = validar(exp);

    if(error){
        document.getElementById("resultado").innerHTML =
            `<div class="error">Operadores inválidos:<br>${error}</div>`;
        return;
    }

    let variables = [...new Set(exp.match(/[pqrs]/g))];
    if(!variables){
        document.getElementById("resultado").innerHTML =
            `<div class="error">No hay proposiciones válidas.</div>`;
        return;
    }

    variables.sort();
    let filas = Math.pow(2, variables.length);

    let tabla = "<table>";
    tabla += "<tr>";

    variables.forEach(v => {
        tabla += `<th>${v}</th>`;
    });

    tabla += `<th>${exp}</th>`;
    tabla += "</tr>";

    let resultadosFinales = [];

    for(let i=filas-1;i>=0;i--){

        let valores = {};
        tabla += "<tr>";

        for(let j=0;j<variables.length;j++){
            valores[variables[j]] = (i >> (variables.length-j-1)) & 1;
            tabla += `<td>${valores[variables[j]] ? "V" : "F"}</td>`;
        }

        let evaluada = evaluar(exp, valores);
        resultadosFinales.push(evaluada);

        tabla += `<td>${evaluada ? "V" : "F"}</td>`;
        tabla += "</tr>";
    }

    tabla += "</table>";

    let clasificacion = "";
    let todosVerdaderos = resultadosFinales.every(r => r === true);
    let todosFalsos = resultadosFinales.every(r => r === false);

    if(todosVerdaderos){
        clasificacion = "<p style='color:green;font-weight:bold;'>Es una TAUTOLOGÍA</p>";
    }
    else if(todosFalsos){
        clasificacion = "<p style='color:red;font-weight:bold;'>Es una CONTRADICCIÓN</p>";
    }
    else{
        clasificacion = "<p style='color:orange;font-weight:bold;'>Es una CONTINGENCIA</p>";
    }

    document.getElementById("resultado").innerHTML = tabla + clasificacion;
}

function evaluar(exp,valores){

    let expr = exp;

    for(let v in valores){
        expr = expr.replaceAll(v, valores[v]);
    }

    expr = expr
        .replaceAll("¬","!")
        .replaceAll("∧","&&")
        .replaceAll("∨","||")
        .replaceAll("→","<=")
        .replaceAll("↔","==");

    try{
        return eval(expr);
    }catch{
        return false;
    }
}