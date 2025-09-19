// =================== LÓGICA PRINCIPAL ===================
const main = document.querySelector("main");
const footer = document.querySelector("footer");
let cardapios = [];
await iniciarApp();

// =================== BLOCO DE DADOS ===================
const hojeISO = new Date().toISOString(); // 📌 gera a data atual do computador

// =================== FUNÇÃO DIA DA SEMANA ===================
function diaSemanaPorData(dataCardapio) {
    if (!dataCardapio) return {
        dia: "Data inválida",
        dataSemana: "Data inválida"
    };

    const dias = [
        'Domingo', 'Segunda-feira', 'Terça-feira',
        'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];

    const data = new Date(dataCardapio);
    const posicao = data.getDay();

    return {
        dia: dias[posicao],
        dataSemana: data.toLocaleDateString("pt-BR")
    };
} 
// =================== FUNÇÃO OBTER TURNO ===================
function obterTurno() {
    const agora = new Date();
    const minutoTotal = agora.getHours() * 60 + agora.getMinutes();

    if (minutoTotal <= 570) return "manhã";      // até 9h30
    if (minutoTotal > 570 && minutoTotal <= 720) return "integral"; // até 12h
    if (minutoTotal > 720 && minutoTotal <= 915) return "tarde";    // até 15h15
    return "noturno"; // depois disso
}
// =================== FUNÇÃO CRIAR REFEIÇÃO ===================
function criarRefeicao(refeicao, titulo) {
    const section = document.createElement("section");

    const h3 = document.createElement("h3");
    h3.textContent = titulo;
    section.appendChild(h3);

    const div = document.createElement("div");
    section.appendChild(div);

    const ul = document.createElement("ul");
    div.appendChild(ul);

    const figure = document.createElement("figure");
    div.appendChild(figure);

    // Itens principais da refeição
    for (let i = 0; i < refeicao.itens.length; i++) {
        const li = document.createElement("li");
        li.textContent = refeicao.itens[i];
        ul.appendChild(li);
    }

    // Corrigido: Bebidas (aceita array, string ou ausência)
    if (refeicao.bebida) {
        const li = document.createElement("li");
        if (Array.isArray(refeicao.bebida)) {
            li.textContent = `Bebida: ${refeicao.bebida.join(", ")}`;
        } else {
            li.textContent = `Bebida: ${refeicao.bebida}`;
        }
        ul.appendChild(li);
    }

    // Corrigido: imagens
    if (refeicao.img && Array.isArray(refeicao.img)) {
        for (let i = 0; i < refeicao.img.length; i++) {
            const img = document.createElement("img");
            img.src = refeicao.img[i];
            img.style.padding = "5px";
            figure.appendChild(img);
        }
    }

    return section;
}
// =================== FUNÇÃO EXIBIR REFEIÇÃO ===================
function exibirRefeicao(cardapio) {
    if (!cardapio || !cardapio.refeicao) return;

    const { dia, dataSemana } = diaSemanaPorData(cardapio.data);
    const titulo = `${dia} - ${dataSemana} | Turno: ${cardapio.turno}`;
    main.appendChild(criarRefeicao(cardapio.refeicao, titulo));

    // Exibir lanche do integral junto com o turno da tarde
    if (cardapio.turno === "tarde") {
        const integral = cardapios.find(c => c.turno === "integral" && c.data && c.data.startsWith(cardapio.data.slice(0, 10)));
        if (integral && integral.lanche) {
            const subtitulo = `${dia} - ${dataSemana} | Turno: ${integral.turno}`;
            main.appendChild(criarRefeicao(integral.lanche, subtitulo));
        }
    }
}
// =================== FUNÇÃO CONECTAR CARDÁPIOS ===================
async function conectarCardapios() {
    try {
        const url = './cardapios.json';
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error(`Erro ao carregar cardápio: ${resposta.status}`);
        }

        const dados = await resposta.json();
        console.log("Cardápios carregados:", dados);
        return dados;
    } catch (error) {
        console.error("Erro durante a conexão:", error);
        throw error;
    }
}
// =================== FUNÇÃO INICIAR APP ===================
async function iniciarApp() {
    main.innerHTML = "";
    const h2 = document.createElement("h2");
    main.appendChild(h2);

    try {
        cardapios = await conectarCardapios();
        const turnoAtual = obterTurno();
        const hoje = new Date().toISOString().slice(0, 10);

        const cardapioAtual = cardapios.find(c => c.turno === turnoAtual && c.data && c.data.startsWith(hoje));


        if (cardapioAtual) {
            h2.textContent = "Cardápio do Dia";
            exibirRefeicao(cardapioAtual);
            mostrarFormulario();
        } else {
            h2.textContent = "Cardápio indisponível";
        }
    } catch (error) {
        console.error("Erro durante iniciar app:", error);
    }
}
function mostrarFormulario() {
    const aside = document.querySelector("aside");
    aside.innerHTML = "";
    const h2 = document.createElement("h2");
    h2.textContent = "Pesquisa sobre Cardápio Escolar"
    aside.appendChild(h2)

    const form = document.createElement("form")

    form.appendChild(fieldsetDadosPessoais());
    form.appendChild(fieldsetAnexarArquivo())
    form.appendChild(fieldsetAvaliarRefeicao());
    form.appendChild(fieldsetComentario());
    const enviar = document.createElement("button");
    enviar.textContent = "Enviar Resposta";
    enviar.type = "submit";
    form.appendChild(enviar);

    const limpar = document.createElement("button");
    limpar.textContent = "Limpar Formulário";
    limpar.type = "reset"
    form.appendChild(limpar);

    aside.appendChild(form);

}
function fieldsetDadosPessoais() {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = "Informações Pessoais";
    fieldset.appendChild(legend);

    const labelNome = document.createElement("label");
    labelNome.setAttribute("for", "nome");
    labelNome.textContent = "Nome Completo";
    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.id = "nome";
    inputNome.name = "nome";
    inputNome.placeholder = "Digite seu nome";
    inputNome.required = true;

    fieldset.appendChild(labelNome);
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(inputNome);
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    const labelIdade = document.createElement("label");
    labelIdade.setAttribute("for", "idade");
    labelIdade.textContent = "Idade";
    const inputIdade = document.createElement("input");
    inputIdade.id = "idade";
    inputIdade.name = "idade";
    inputIdade.min = 6;
    inputIdade.max = 20;
    inputIdade.required = true;

    fieldset.appendChild(labelIdade)
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(inputIdade)
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    const labelEmail = document.createElement("label");
    labelEmail.setAttribute("for", "email");
    labelEmail.textContent = "Email(Opcional)";
    const inputEmail = document.createElement("input");
    inputEmail.id = "email";
    inputEmail.type = "email";
    inputEmail.name = "email";
    inputEmail.placeholder = "email@exemplo.com"


    fieldset.appendChild(labelEmail)
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(inputEmail)
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    const labelData = document.createElement("label");
    labelData.setAttribute("for", "data");
    labelData.textContent = "Data da refeição";
    const inputData = document.createElement("input");
    inputData.type = "date";
    inputData.id = "data";
    inputData.name = "data";
    inputData.required = true;

    fieldset.appendChild(labelData)
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(inputData)
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    return fieldset;
}
function fieldsetAvaliarRefeicao() {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = "Informações Pessoais";
    fieldset.appendChild(legend);

    const perguntaParticipacao = document.createElement("p");
    perguntaParticipacao.textContent = "Você participou da refeição?"
    fieldset.appendChild(perguntaParticipacao);

    const inputSim = document.createElement("input");
    inputSim.type = "radio";
    inputSim.id = "sim";
    inputSim.name + "participacao";
    inputSim.value = "sim";
    inputSim.required = true;

    const labelSim = document.createElement("label");
    labelSim.setAttribute("for", "sim");
    labelSim.textContent = "sim";

    fieldset.appendChild(inputSim);
    fieldset.appendChild(labelSim);
    fieldset.appendChild(document.createElement("br"));

    const inputNao = document.createElement("input");
    inputNao.type = "radio";
    inputNao.id = "nao";
    inputNao.name + "participacao";
    inputNao.value = "nao";

    const labelNao = document.createElement("label");
    labelNao.setAttribute("for", "nao");
    labelNao.textContent = "Não";

    fieldset.appendChild(inputNao);
    fieldset.appendChild(labelNao);
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    const perguntaAvaliacao = document.createElement("p");
    perguntaAvaliacao.textContent = "Como estava a refeição?"
    fieldset.appendChild(perguntaAvaliacao);

    const opcoesAvaliacao = [{ id: "saborosa", texto: "Saborosa" },
    { id: "quente", texto: "Estava quente" },
    { id: "pouco-salgada", texto: "Pouco Salgada" },
    { id: "nao-gostei", texto: "Não Gostei" },
    ];

    opcoesAvaliacao.forEach(opcao => {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = opcao.id;
        input.name = "avaliacao";
        input.value = opcao.id;

        const label = document.createElement("label");
        label.setAttribute("for", opcao.id)
        label.textContent = opcao.texto;

        fieldset.appendChild(input);
        fieldset.appendChild(label);
        fieldset.appendChild(document.createElement("br"));
    });
    fieldset.appendChild(document.createElement("br"));

    const labelNota = document.createElement("label");
    labelNota.setAttribute("for", "nota");
    labelNota.textContent = "Dê uma nota de 0 a 10:";
    fieldset.appendChild(labelNota);
    fieldset.appendChild(document.createElement("br"));

    const inputNota = document.createElement("input");
    inputNota.type = "number";
    inputNota.id = "nota";
    inputNota.min = "0";
    inputNota.max = "10";
    inputNota.step = "1";

    fieldset.appendChild(inputNota);
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    const labelHorario = document.createElement("label");
    labelHorario.setAttribute("for", "horario");
    labelHorario.textContent = "Que horas você almoçou";
    fieldset.appendChild(labelHorario);
    fieldset.appendChild(document.createElement("br"));

    const inputHorario = document.createElement("input");
    inputHorario.type = "time";
    inputHorario.id = "horario";
    inputHorario.name = "horario";

    fieldset.appendChild(inputHorario);
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    return fieldset;

}
function fieldsetComentario() {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = "Comentário Livre  ";
    fieldset.appendChild(legend);

    const labelAsssunto = document.createElement("label");
    labelAsssunto.setAttribute("for", "assunto");
    labelAsssunto.textContent = "Deixe sua opinião ou sugestão";
    fieldset.appendChild(labelAsssunto);
    fieldset.appendChild(document.createElement("br"));

    const select = document.createElement("select");
    select.id = "assunto";
    select.name = "assunto";

    const opcoes = [
        { value: '', texto: "--Escolja uma opção--" },
        { value: 'reclamacao', texto: "Reclamação" },
        { value: 'sugestao', texto: "Sugestão" },
        { value: 'elogios', texto: "Elogios" },
        { value: 'outros-assuntos', texto: "Outros Assuntos" },
    ];

    opcoes.forEach(opcao => {
        const option = document.createElement("option");
        option.value = opcao.value;
        option.textContent = opcao.texto;
        select.appendChild(option);
    })
    fieldset.appendChild(select);
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    const textarea = document.createElement("textarea");
    textarea.id = "mensagem";
    textarea.name = "mensagem";
    textarea.rows = 5;
    textarea.cols = 40;
    textarea.placeholder = "Digite aqui...";

    textarea.disabled = true;

    fieldset.appendChild(textarea);
    fieldset.appendChild(document.createElement("br"));
    fieldset.appendChild(document.createElement("br"));

    select.addEventListener("change", () => {
        textarea.disabled = (select.value === '');
    });
    return fieldset;
}
function fieldsetAnexarArquivo() {
    const fieldset = document.createElement('fieldset');

    const legend = document.createElement('legend');
    legend.textContent = 'Anexar Arquivo';
    fieldset.appendChild(legend);

    const labelArquivo = document.createElement('label');
    labelArquivo.setAttribute('for', 'arquivo');
    labelArquivo.textContent = 'Anexe um arquivo (opcional):';
    fieldset.appendChild(labelArquivo);
    fieldset.appendChild(document.createElement('br'));

    const inputArquivo = document.createElement('input');
    inputArquivo.type = 'file';
    inputArquivo.id = 'arquivo';
    inputArquivo.name = 'arquivo';
    inputArquivo.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx'; // Tipos de arquivos aceitos

    fieldset.appendChild(inputArquivo);
    fieldset.appendChild(document.createElement('br'));
    fieldset.appendChild(document.createElement('br'));

    return fieldset;
}
function capturarDadosFormulario(form) {
    const imgbbAPIKey = ""; // Substitua pela sua chave real

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const arquivo = form.arquivo.files[0];
        let imageUrl = "173e5fa4678e7c72ab7fa1d400ebb369";

        if (arquivo) {
            const formData = new FormData();
            formData.append('image', arquivo);

            try {
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    imageUrl = result.data.url;
                    form.querySelector('[name="imagem-url"]').value = imageUrl;
                } else {
                    alert('Erro ao enviar imagem para o ImgBB.');
                    return;
                }
            } catch (error) {
                console.error('Erro no upload da imagem:', error);
                alert('Erro ao conectar com o ImgBB.');
                return;
            }
        }

        const dados = {
            nome: form.nome.value,
            idade: form.idade.value,
            email: form.email.value,
            data: form.data.value,
            participacao: form.participacao.value,
            avaliacao: [...form.querySelectorAll('input[name="avaliacao"]:checked')].map(el => el.value),
            materia: form.materia.value,
            horario: form.horario.value,
            assunto: form.assunto.value,
            mensagem: form.mensagem.value,
            imagem: imageUrl || form['imagem-url'].value
        };

        enviarDadosParaAPI(dados);
    });
}
async function enviarDadosParaAPI(dados) {
    try {
        const resposta = await fetch("https://api-cantina-storage.vercel.app/respostas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        const texto = await resposta.text();
        console.log(" Resposta do servidor:", texto);

        if (resposta.ok) {
            alert(" Resposta enviada com sucesso!");
        } else {
            alert("Resposta enviada com sucesso no JSON FAKE!");
        }
    } catch (erro) {
        console.error(" Erro na requisição:", erro);
        alert(" Falha na conexão com o servidor!");
    }
}

