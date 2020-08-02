$(document).ready(async function () {
	EventoDAO.childRemovedEvents();

	defineLanguage();

	try {
		const eventos = await EventoDAO.listarAdmin(usuario);

		let card = "";

		eventos.forEach((evento) => {

			let auxData = evento.data.split("-");

			if (auxData[1].length == 1) {

				auxData[1] = "0" + auxData[1];

			}

			card += `<div id="${evento.id}" class="col-sm-12 col-md-6 col-lg-6 col-xl-4">
						<!-- Card -->
						<div class="card">

							<!-- Card image -->
							<img class="card-img-top" src="${evento.caminho}" alt="Card image cap">

							<!-- Card content -->
							<div class="card-body">

								<!-- Title -->
								<h4 class="card-title">${evento.titulo}</h4>
								<!-- Text -->
								<p class="card-text">
									${evento.descricao.substr(0, 140)}...
									<p><span class="fas fa-clock"></span> ${evento.horario}</p>
									<p><span class="fas fa-calendar"></span> ${new Date(auxData[0], auxData[1], auxData[2]).toLocaleDateString()}</p>
									<p><span class="fas fa-building"></span> ${evento.rua}</p>
									<p><span class="fas fa-map-marker-alt"></span> ${evento.cidade}-${evento.estado}</p>
								</p>
								<!-- Button -->
								<div class='row'>

									<div class=col-sm-4>

										<a href="voluntarios?id=${evento.id}&categoria=${evento.categoria}" 
											class="btn btn-info btn-block text-uppercase font-weight-bold">
											<span class='fas fa-users' data-evento=${evento.id}></span>
										</a>

									</div>

									<div class=col-sm-4>

										<a href="novo?id=${evento.id}&categoria=${evento.categoria}&pais=${evento.pais}" 
											class="btn btn-primary btn-block text-uppercase font-weight-bold">
											<span class='fas fa-edit'></span>
										</a>

									</div>

									<div class=col-sm-4>
										
										<button class="btn btn-danger btn-block excluir text-uppercase font-weight-bold"  
												data-cidade=${evento.cidade} data-estado=${evento.estado} data-dono='${evento.idDono}' 
												data-pais='${evento.pais}' data-categoria='${evento.categoria}' value='${evento.id}'>

											<span class='translate' data-page='my-events-page' data-key='delete'><span class='fas fa-trash'></span>

										</button>
									</div>

								</div> <!-- FECHA ROW -->

							</div> <!-- FECHA CARD-BODY -->

						</div> <!-- FECHA CARD -->
					</div>`;//FECHA DIV COLS

			rootRef
				.child(
					`pessoas-inscritas-no-meu-evento/${usuario.pais}/${evento.idDono}/${evento.categoria}/${evento.id}`
				)
				.on("value", (snapshot) => {
					$(`span[data-evento='${evento.id}']`).text(
						" " + snapshot.numChildren()
					);
				});
		});

		escondeLoading();

		$(".row").append(card);
		defineLanguage();

		$(".excluir").click(async function () {
			
			const evento = {
				id: $(this).val(),
				cidade: $(this).data("cidade"),
				pais: $(this).data("pais"),
				categoria: $(this).data("categoria"),
				idDono: $(this).data("dono"),
				estado: $(this).data("estado"),
			};

			if (objLanguage[language]) {
				if (confirm(objLanguage[language]["notifications"]["do-you-want-remove"])) {

					await EventoDAO.excluir(evento);

				}
			} else {
				if (confirm(objLanguage['en']["notifications"]["do-you-want-remove"])) {

					await EventoDAO.excluir(evento);

				}
			}

		});
	} catch (erro) {
		trataErros(erro);
	}
});
