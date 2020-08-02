let dados;
$(document).ready(async function () {
  dados = ["voluntários", "Eventos"];

  defineLanguage();
  let vet = [
    firebase.database().ref("qtdUsers").once("value"),
    firebase.database().ref("qtdEventos").once("value"),
  ];
  const qtdIcones = numeroDeIcones2();
  animacaoIcones2(qtdIcones);

  let resolve = await Promise.all(vet);
  $("#img-loading").removeClass("d-block");
  $("#img-loading").css("display", "none");

  $(".info-qtd").each(function (i) {
    $(this).counter({
      countFrom: 0,
      duration: 2500,
      countTo: resolve[i].val().total,
      numberFormatter: function (numero) {
        return "+ de " + parseInt(numero) + " " + dados[i];
      },
    });
  });
});
