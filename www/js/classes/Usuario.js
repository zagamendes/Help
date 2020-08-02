class Usuario{
	constructor(){
		this.nome = "";
		this.foto = "";
		this.email = "";
		this.caminho = "";
		this.pais = "";
		this.numero = "";
		this.fotoProvedor = "";
		this.usuarioId = "";
		this.gostos = "";
		this.token = "";

	}
	

}

class UsuarioDAO{
	
	static async salvar(user){

		try{

			const userRef = firebase.database().ref("usuarios/"+user.usuarioId);
			const paisRef = firebase.database().ref(`usuarios-pais/${user.pais}/${user.estado}/${user.cidade}/${user.usuarioId}`);

			await userRef.set(user);
			await paisRef.set(user);
			localStorage.clear();
			
			localStorage.user = JSON.stringify(user);
			if(url!=""){

				const auxUrl = url.split("&");
				const idEvento = auxUrl[0].slice(4);
				const categoria = auxUrl[1].split("=").pop();
				const pais = auxUrl[2].split("=").pop();

				location.replace(`evento.html?id=${idEvento}&categoria=${categoria}&pais=${pais}`);

			}else{

				location.replace("menu.html");

			}
		
		}catch(erro){
			trataErros(erro);
			console.log(erro);
		}
	}

	static async atualizarInteresses(){
		try{

			const ref = firebase.database().ref("usuarios/"+usuario.usuarioId);
			await ref.update(usuario);
			location.replace("menu.html");

		}catch(erro){
			trataErros(erro);
			console.log(erro);
		}
		

		
	}

	


	

	static async atualizarUsuario(){
		

		if($("#input-foto").val()==""){
			
			usuario.nome = $("#input-nome").val();
			usuario.email = $("#input-email").val();
			await firebase.database().ref("usuarios/"+usuario.usuarioId).update(usuario);
			localStorage.user = JSON.stringify(usuario);
			
			objLanguage[language] ? Notificacao.sucesso(objLanguage[language]["notifications"]["updated-with-success"]) : Notificacao.sucesso(objLanguage['en']["notifications"]["updated-with-success"])	

			usuario = getUserFromLS();
			UsuarioDAO.setaDadosNosInputs();
			
			//location.reload()

		}else{
			//PASTA/CAMINHO ONDE VAI SALVAR A FOTO DO USUÁRIO
			const ref = firebase.storage().ref(`usuarios/${usuario.pais}/${usuario.estado}/${usuario.cidade}/${usuario.usuarioId}`);
			
			//ARQUIVO A SER ENVIADO
			let task = ref.put(arquivo[0]);
			task.on("state_changed",
				//PROGRESSO DO UPLOAD
				snapshot=>{
					let porcetagem = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
					$("#barra-progresso").val(porcetagem)
					$("#btn-cancelar").on("click",()=>{
						task.cancel();
						$("#spinner").remove();
						$("#btn-salvar").removeAttr("disabled");
					});
				},
				//ERRO DURANTE UPLOAD
				trataErros,
				//UPLOAD COMPLETO
				async ()=>{
					usuario.nome = $("#input-nome").val();
					usuario.email= $("#input-email").val();
					try{
						usuario.caminho= await task.snapshot.ref.getDownloadURL();
						await firebase.database().ref("usuarios/"+usuario.usuarioId).update(usuario)
						localStorage.user = JSON.stringify(usuario);
						usuario = getUserFromLS();
						$("#input-foto").val("");
						$("#barra-progresso").val(0)
						UsuarioDAO.setaDadosNosInputs();

						objLanguage[language] ? Notificacao.sucesso(objLanguage[language]["notifications"]["updated-with-success"]) : Notificacao.sucesso(objLanguage['en']["notifications"]["updated-with-success"])
								

					}catch(erro){

						trataErros(erro);
						log(erro);
						
					}

				}
			)

								
		}

	}
	static atualizaToken(id,novoToken){

		firebase.database().ref("usuarios/"+id).update({token:novoToken});
	}

	
	static setaDadosNosInputs(){
		$("#input-nome").val(usuario.nome);
		$("#input-email").val(usuario.email);
		$("#input-telefone").val(usuario.numero);
		$(".rounded-circle").attr("src",usuario.caminho);
		$("#img-loading").removeClass("d-block");
		$("#img-loading").css("display","none");
		$("legend").removeAttr("hidden");
		$("form").removeAttr("hidden");
		$("#spinner").remove();
		$("#btn-salvar").removeAttr("disabled");
		
	}
			

}