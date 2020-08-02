$(document).ready(function () {

    defineLanguage();

    $(".form-check").attr("hidden", "hidden");
    $("button").addClass("animated fadeIn delay-3s");

    usuario.gostos.forEach(gosto => {
        $(".form-check-input[value=" + gosto + "]").prop("checked", true);
    });
    //COLOCANDO O NOME DO USUÁRIO NA DIV DE SAUDAÇÕES E ESCODENDO A IMAGEM DE LOADING
    $("#img-loading").attr("hidden", "hidden");
    $("legend").removeAttr("hidden");
    var qtdIcones = numeroDeIcones();

    animacaoIcones(qtdIcones);

    $("#selecionarTodos").click(function () { $("input:checkbox").prop("checked", $(this).prop("checked")) });
    $("input:checkbox[name='gostos[]']").click(() => {
        if ($("#selecionarTodos").prop("checked")) {
            $("#selecionarTodos").prop("checked", false);
        }
    })

    $("#btn-sair").on("click", () => {
        location.replace("menu");
    });

    $("#btn-salvar").on("click", () => {
        $("#img-loading").removeAttr("hidden");

        atualizarMeusInteresses();
    });



});