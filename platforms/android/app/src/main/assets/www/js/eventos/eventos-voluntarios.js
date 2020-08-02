$(document).ready(async function () {
    defineLanguage();

    $("#check-selecionarTodos").click(function () {
        let listaEmail = [];

        $("input:checkbox").prop("checked", $(this).prop("checked"));

        if ($(this).prop("checked")) {
            $("input:checkbox.checkbox-user").each(function () {
                listaEmail.push($(this).val());
            });

            if (objLanguage[language]) {
                $(".modal-title").html(
                    `<strong>${objLanguage[language]["my-volunteers"]["to"]}</strong> ${listaEmail}`
                );
            } else {
                $(".modal-title").html(
                    `<strong>${objLanguage["en"]["my-volunteers"]["to"]}</strong> ${listaEmail}`
                );
            }

            $("#myModal").modal("show");

            $("form").submit(function (evento) {
                evento.preventDefault();

                $("#myModal").modal("toggle");

                objEmail = {
                    Host: "smtp.gmail.com",
                    Username: "suportehelp.brasil@gmail.com",
                    Password: "91236233",
                    To: listaEmail,
                    From: user.email,
                    Subject: $("#input-assunto").val(),
                    Body: $("#input-mensagem").val(),
                };
                $("#btn-enviar").prepend(addSpinner());
                $("#btn-enviar").attr("disabled", "disabled");
                Email.send(objEmail)
                    .then(() => {
                        if (objLanguage[language]) {
                            Notificacao.sucesso(
                                objLanguage[language]["notifications"]["sent-with-success"]
                            );
                        } else {
                            Notificacao.sucesso(
                                objLanguage["en"]["notifications"]["sent-with-success"]
                            );
                        }

                        removeSpinner();
                        $("#btn-enviar").removeAttr("disabled");
                        $("#myModal").modal("toggle");
                    })
                    .catch((erro) => {
                        trataErros(erro);
                    });
            });
        }
    });

    $("table").on("click", ".btn-enviar-email-user", function () {
        if (objLanguage[language]) {
            $(".modal-title").html(
                "<strong>" +
                objLanguage[language]["my-volunteers"]["to"] +
                "</strong> " +
                $(this).val()
            );
        } else {
            $(".modal-title").html(
                "<strong>" +
                objLanguage["en"]["my-volunteers"]["to"] +
                "</strong> " +
                $(this).val()
            );
        }
        $("#input-para").val($(this).val());
    });

    $("#myModal").on("hidden.bs.modal", function () {
        $("textarea").val("");
        $("#input-assunto").val("");
    });

    $("form").submit(function (evento) {
        evento.preventDefault();

        let objEmail = {
            Host: "smtp.gmail.com",
            Username: "suportehelp.brasil@gmail.com",
            Password: "91236233",
            To: $("#input-para").val(),
            From: usuario.email,
            Subject: $("#input-assunto").val(),
            Body: $("#input-mensagem").val(),
        };
        $("#btn-enviar").prepend(addSpinner());
        $("#btn-enviar").attr("disabled", "disabled");
        Email.send(objEmail)
            .then(() => {
                if (objLanguage[language]) {
                    Notificacao.sucesso(
                        objLanguage[language]["notifications"]["sent-with-success"]
                    );
                } else {
                    Notificacao.sucesso(
                        objLanguage["en"]["notifications"]["sent-with-success"]
                    );
                }

                removeSpinner();

                $("#btn-enviar").removeAttr("disabled");
                $("#myModal").modal("toggle");
            })
            .catch((erro) => {
                console.log(erro);
            });
    });

    const url = location.search.split("=");
    const id = url[1].split("&").shift();
    const categoria = url.pop();

    try {
        await EventoDAO.voluntariosInscritos(categoria, id);
        defineLanguage();
    } catch (erro) {
        console.log(erro);
    }
});
