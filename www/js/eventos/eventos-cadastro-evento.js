var eventoAntigo = {};
isLogged();
$(document).ready(async function () {

    let listaTags="";
    const url = location.search;

    //BOTÃO VOLTAR
    $("#btn-voltar").click(function (e) { 
        e.preventDefault();
        url != "" ? location.replace("listagem.html") : location.replace("menu.html");
    });
    
    //TAGS DE RECOMENDAÇÃO TRAZIDAS DO BANCO
    let tagsDB = await rootRef.child(`tags/${usuario.pais}`).once("value");

    //CONFERINDO SE O USUARIO ESTÁ ALTERANDO UM EVENTO OU CRIANDO UM NOVO
    url != "" ? EventoDAO.listaPorId(true) : $("div.container").removeAttr("hidden");
    
    escondeLoading();


    //TAGSDB É UM OBJETO DE OBJETOS QUE CONTÉM UM ARRAY
    //JUNTA TODOS OS OBJETOS QUE CONTÉM UM ARRAY EM UM ÚNICO ARRAY
    tagsDB.forEach(tag=>{
        
        listaTags += tag.val().toString();
        listaTags += ","
    });


    //DEFININDO O IDIOMA DA TELA
    await defineLanguage();


    //ADICIONA MASCARA NO CEP SE VERDADE
    if (language == "pt") {

        $("#input-cep").mask("00.000-000");

    }

    //SE LISTA TAGS FOR MAIOR QUE ZERO, SISTEMA DA SUPORTE AO PAÍS DO USUÁRIO, PERMITINDO CADASTRO, SE NÃO, MOSTRA MENSAGEM DE DIZENDO QUE NÃO PODE CADASTRAR
    if (listaTags.length>0) {

        $("#input-tags").tagsInput({

            autocomplete: {
                source: listaTags.split(",")
            },
            limit: 5,
            placeholder:objLanguage[language]["register-event-page"]["tags-placeholder"]

        });//FECHA A LISTA DE TAGS

    } else {

        $("input").attr("readonly", true);
        $("button").attr("disabled", true);
        $("textarea").attr("readonly", true);

        Notificacao.alerta(objLanguage['en']["notifications"]["no-country-support"]);

    }

    $("#input-descricao").focus(function (e) { 
        e.preventDefault();
        defineCategoria($("#input-tags").val(),tagsDB);
    });


    //DEFININDO O ENDEREÇO A PARTIR DO VIACEP
    $("#input-cep").focusout(function () {
        let cep = $(this).cleanVal();
        fetch("https://viacep.com.br/ws/" + cep + "/json/")
            .then(response => response.json())
            .then(dados => {
                $("#input-rua").val(dados.logradouro);
                $("#input-bairro").val(dados.bairro);
                $("#input-cidade").val(dados.localidade + "-" + dados.uf);

            });

    });//FECHA EVENTO DO FOCUS OUT DO CEP


    $("#input-tags_tag").one("focus", () =>$('.toast').toast('show'));

    $("#input-tags_tag").addClass("form-control");

    ///EVENTO DE FOTO SELECIONADA
    $("#input-foto").change(function () {

        arquivo = $(this).prop("files");
        if (!arquivo[0].type.match(/image/gi)) {

            objLanguage[language] ? Notificacao.alerta(objLanguage[language]["notifications"]["only-images"]) : Notificacao.alerta(objLanguage['en']["notifications"]["only-images"]);


            $("#btn-cadastrar-evento").attr("disabled", true);

        } else {

            $("#btn-cadastrar-evento").attr("disabled", false);

        }

    });//FECHA EVENTO DO INPUT FILE  

    //EVENTO DE SALVAR VOLUNTÁRIO
    $("form").submit(async (e) => {
        e.preventDefault();
        try {

            //CASO O USUÁRIO NÃO TENHA BEFINIDO NENHUMA TAG
            if($("#input-tags").val().length==0){
                Notificacao.alerta("Adicione pelo menos uma tag/palavra chave no seu voluntário");
                return false;
            }
            //CASO TENHA TENTADO ADICONAR UM EVENTO SEM FOTO
            if ($("#input-foto").data("foto") == null && $("#input-foto").val() == "") {
                Notificacao.alerta("Por favor selecione uma foto para o evento!");
                return false;
            } else {

                const evento = new Evento();

                evento.id = $("#input-id").val();

                evento.titulo = $("#input-titulo").val();

                evento.descricao = $("#input-descricao").val();

                evento.horario = $("#input-horario").val();

                evento.data = $("#input-data").val();

                evento.tags = $("#input-tags").val();

                evento.cep = $("#input-cep").val();

                evento.rua = $("#input-rua").val();

                evento.numero = $("#input-numero").val();

                evento.cidade = $("#input-cidade").val().split("-").shift();

                evento.estado = $("#input-cidade").val().split("-").pop();

                evento.caminho = $("#input-caminho").val();

                evento.pais = usuario.pais;

                evento.idDono = usuario.usuarioId;

                evento.categoria = defineCategoria(evento.tags,tagsDB);

                evento.dataTimeStamp = new Date(evento.data).getTime();

                //SE ID FOR DIFERENTE DE VÁZIO, ESTAR ATUALIZANDO EVENTO
                if (evento.id != "") {

                    //SE FOTO ESTAR VAZIA, NÃO ALTEROU FOTO
                    if ($("#input-foto").val() == "") {

                        desativaBotoes();
                        $("#btn-cadastrar-evento").prepend(addSpinner());
                        await EventoDAO.atualizar(evento);
                        removeSpinner();

                    } else {

                        //ALTEROU EVENTO E FOTO
                        desativaBotoes();
                        EventoDAO.atualizar(evento, arquivo);

                    }

                } else {

                    desativaBotoes();
                    $("#btn-cadastrar-evento").prepend(addSpinner());
                    await EventoDAO.salvar(evento, arquivo);

                }


            }
        } catch (erro) {
            trataErros(erro);
        }


    });//FECHAR EVENTO DO FORM


}); //FECHA DOCUMENT.READY