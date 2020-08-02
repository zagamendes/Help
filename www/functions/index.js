const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require("node-fetch");
const express = require("express");
const app = express();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
admin.initializeApp();

const adminRef = admin.database().ref();

/*
let arrayTokens=[];

exports.eventoAdicionado = functions.database.ref("eventos/{pais}/{categoria}/{id}").onCreate(async (snapshot,context)=>{
	
	await adminRef.child("usuarios").once("value",usuarios=>{
		usuarios.forEach(usuario=>validaInteresse(usuario,"games"));
	});

	arrayTokens.forEach(token=>{

		fetch("https://fcm.googleapis.com/fcm/send",{
	      method:"POST",
	          headers:{
	             Authorization:"Key=AIzaSyDbpGOIcBMIqYWng1VPMRhMzWr2hA4zw8I",
	             "Content-Type": "application/json"

	          },

	          body:JSON.stringify({
	          	
	            
	          
	            to: token,
	              notification: {
	              title: "Novo evento do seu interesse",
	              body: snapshot._data.titulo,
	              icon: "https://firebasestorage.googleapis.com/v0/b/apptcc-6f556.appspot.com/o/eventos%2Fgames.png?alt=media&token=c8e03a2a-6856-424c-9d8d-7662dabc489e",
	              click_action: "https://youtube.com"
	            }
	          })
	    });

	});

	return new Promise((resolve,reject)=>resolve("finalizado"));
	
    
    

});
function validaInteresse(usuario,interesse){
	for(let i=0;i<usuario.val().gostos.length;i++){

		if(gosto===interesse){
			arrayTokens.push(usuario.val().token);
			break;
		}
	}
	
	
}

async function atualizaTodosEventos(evento,eventoAntigo){

	//SE MUDOU A CIDADE E CATEGORIA DO EVENTO
		if(eventoAntigo.cidade!=evento.cidade && eventoAntigo.categoria!=evento.categoria){

			const refNoAntigo = adminRef.child(`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${eventoAntigo.categoria}/${evento.id}`);
			const noAntigo = await refNoAntigo.once("value");
			const auxUsers = await adminRef.child(`eventos-que-estou-inscrito/${evento.pais}`).once("value");


			auxUsers.forEach(auxUser=>{

				auxUser.forEach(categoria=>{

					if(eventoAntigo.categoria==categoria.key){

						categoria.forEach(async auxEvento=>{
								
							if(evento.id==auxEvento.key){
								await adminRef.child(`eventos-que-estou-inscrito/${evento.pais}/${auxUser.key}/${evento.categoria}/${evento.id}`).update(evento);
							}
						})
					}
				})
			})

			await adminRef.child(`eventos/${evento.pais}/${eventoAntigo.cidade}/${eventoAntigo.categoria}/${evento.id}`).remove();
			

			await adminRef.child(`eventos/${evento.pais}/${evento.cidade}/${evento.categoria}/${evento.id}`).update(evento);
			await adminRef.child(`meus-eventos/${evento.pais}/${evento.cidade}/${evento.idDono}/${evento.categoria}/${evento.id}`).update(evento);
			await adminRef.child(`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}`).update(noAntigo.val());
			

		//SE MUDOU SÓ A CIDADE
		}else if(eventoAntigo.cidade!=evento.cidade && eventoAntigo.categoria==evento.categoria){

			const auxUsers = await adminRef.child(`eventos-que-estou-inscrito/${evento.pais}`).once("value");

			auxUsers.forEach(auxUser=>{
				auxUser.forEach(categoria=>{
					if(evento.categoria==categoria.key){
						categoria.forEach(async auxEvento=>{
							auxEvento = auxEvento.val();
							if(evento.id==auxEvento.id){
								await adminRef.child(`eventos-que-estou-inscrito/${auxEvento.pais}/${auxUser.key}/${auxEvento.categoria}/${auxEvento.id}`).update(evento);
							}
						})
					}
				})
			})

			await adminRef.child(`eventos/${evento.pais}/${eventoAntigo.cidade}/${evento.categoria}/${evento.id}`).remove();

			await adminRef.child(`meus-eventos/${evento.pais}/${evento.cidade}/${usuario.usuarioId}/${evento.categoria}/${evento.id}`).update(evento);
			

		//SE MUDOU SÓ A CATEGORIA
		}else if(eventoAntigo.cidade==evento.cidade&&eventoAntigo.categoria!=evento.categoria){
			
			
			const noAntigo = await adminRef.child(`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${eventoAntigo.categoria}/${evento.id}`).once("value");
			
			const auxUsers = await adminRef.child(`eventos-que-estou-inscrito/${evento.pais}`).once("value");

			auxUsers.forEach(auxUser=>{
				
				auxUser.forEach(categoria=>{
				
					if(eventoAntigo.categoria==categoria.key){
				
						categoria.forEach(async auxEvento=>{

							auxEvento = auxEvento.val();
							if(evento.id==auxEvento.id){
									
								const auxNoAntigo = await adminRef.child(`eventos-que-estou-inscrito/${evento.pais}/${auxUser.key}/${eventoAntigo.categoria}/${evento.id}`).once("value");
									
								adminRef.child(`eventos-que-estou-inscrito/${evento.pais}/${auxUser.key}/${evento.categoria}/${evento.id}/`).update(auxNoAntigo.val());
									
							}

						})
					}
				})
			})

			
			await adminRef.child(`eventos/${evento.pais}/${evento.cidade}/${eventoAntigo.categoria}/${evento.id}`).remove()
			
			await adminRef.child(`eventos/${evento.pais}/${evento.cidade}/${evento.categoria}/${evento.id}`).update(evento);
			
			await adminRef.child(`meus-eventos/${evento.pais}/${evento.cidade}/${evento.idDono}/${evento.categoria}/${evento.id}`).update(evento);
			
			await adminRef.child(`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}`).update(noAntigo.val());

				
			

		}else{

			const auxUsers = await adminRef.child(`eventos-que-estou-inscrito/${evento.pais}`).once("value");

			await adminRef.child(`meus-eventos/${evento.pais}/${evento.cidade}/${evento.idDono}/${evento.categoria}/${evento.id}`).update(evento);
				
			
			auxUsers.forEach(auxUser=>{
			
				auxUser.forEach(categoria=>{
			
					if(evento.categoria==categoria.key){
			
						categoria.forEach(async auxEvento=>{
			
							auxEvento= auxEvento.val();
			
							if(evento.id==auxEvento.id){
			
								log(auxUser.key)
			
								await adminRef.child(`eventos-que-estou-inscrito/${auxEvento.pais}/${auxUser.key}/${auxEvento.categoria}/${auxEvento.id}`).update(evento);
			
							}
			
						})
			
					}
			
				})
			
			})

		}

}*/

/*function eventoWasUpdated(evento,eventoAntigo){
	if( evento.caminho===eventoAntigo.caminho && evento.categoria===eventoAntigo.categoria && evento.cep===eventoAntigo.cep && evento.cidade===eventoAntigo.cidade
	 	&& evento.dataTimestamp===eventoAntigo.dataTimestamp	&& evento.descricao===eventoAntigo.descricao && evento.estado===eventoAntigo.estado && evento.horario===eventoAntigo.horario
	 	&& evento.numero===eventoAntigo.numero && evento.rua===eventoAntigo.rua && evento.tags.toString()===eventoAntigo.tags.toString() && evento.titulo===eventoAntigo.titulo){
		
		return false;

	}else{
		return true;
	}
}



exports.eventoAlterado = functions.database.ref(`eventos/{pais}/{categoria}/{id}`).onUpdate(async (change,contexto)=>{
	try{
		const eventoAntigo = change.before.val();
		const evento = change.after.val();

		if(eventoWasUpdated(evento,eventoAntigo)){

			const auxUsers = await adminRef.child(`eventos-que-estou-inscrito/${evento.pais}`).once("value");

			await adminRef.child(`meus-eventos/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}`).update(evento);
				
			
			auxUsers.forEach(auxUser=>{
			
				auxUser.forEach(categoria=>{
			
					if(evento.categoria===categoria.key){
			
						categoria.forEach(async auxEvento=>{
			
							auxEvento= auxEvento.val();
							console.log(evento.id,auxEvento.id)
							if(evento.id===auxEvento.id){
			
								await adminRef.child(`eventos-que-estou-inscrito/${evento.pais}/${auxUser.key}/${evento.categoria}/${evento.id}`).update(evento);
			
							}
			
						})
			
					}
			
				})
			
			})
		}else{
			return new Promise((resolve,reject)=>resolve("Nada Alterado"));
		}
	}catch(erro){
		return new Promise((resolve,reject)=>reject(erro));
	}
		
	

})



exports.eventoDeletado = functions.database.ref("eventos/{pais}/{categoria}/{id}").onDelete(async (evento,context)=>{
	try{

		console.log("evento",evento);
		console.log("contexto",context);

		await adminRef.child(`pessoas-inscritas-no-meu-evento/${evento._data.pais}/${evento._data.idDono}/${evento._data.categoria}/${evento._data.id}`).remove()
		await adminRef.child(`meus-eventos/${evento._data.pais}/${evento._data.idDono}/${evento._data.categoria}/${evento._data.id}`).remove();
		const auxUsers = await adminRef.child(`eventos-que-estou-inscrito/${evento._data.pais}`).once("value");
		auxUsers.forEach(auxUser=>{
			auxUser.forEach(categoria=>{
				if(evento._data.categoria===categoria.key){
					categoria.forEach(async auxEvento=>{
						auxEvento = auxEvento.val();
						if(evento._data.id===auxEvento.id){
							await adminRef.child(`eventos-que-estou-inscrito/${auxEvento.pais}/${auxUser.key}/${evento._data.categoria}/${evento._data.id}`).remove();

						}
					})
				}
			})
		})
		 await storage.bucket("apptcc-6f556.appspot.com")
		 .file(`eventos/${evento._data.pais}/${evento._data.estado}/${evento._data.cidade}/${evento._data.idDono}/${evento._data.id}`)
        .delete();
        console.log("foto deletada",evento._data.id);
	}catch(erro){
		return new Promise((resolve,reject)=>reject(erro));
	}

})

exports.usuarioAlterado = functions.database.ref(`usuarios/{id}`).onUpdate(async (change,context)=>{
	try{
		const userAntigo = change.before.val();
		const userNovo = change.after.val();
		const refEventosInscritos = await adminRef.child(`pessoas-inscritas-no-meu-evento/${userNovo.pais}`).once("value");
		if(userWasUpdated(userNovo,userAntigo)){
			
			refEventosInscritos.forEach(idDono=>{
				idDono.forEach(categoria=>{
					categoria.forEach(evento=>{
						evento.forEach(async usuario=>{
							if(userNovo.usuarioId===usuario.key){
								await adminRef.child(`pessoas-inscritas-no-meu-evento/${userNovo.pais}/${idDono.key}/${categoria.key}/${evento.key}/${userNovo.usuarioId}`).update(userNovo);
							}
						})
					})
				})
			})

			await adminRef.child(`usuarios-pais/${userNovo.pais}/${userNovo.estado}/${userNovo.cidade}/${userNovo.usuarioId}`).update(userNovo);
		}
	}catch(erro){
		return new Promise((resolve,reject)=>reject(erro));
	}


});

function userWasUpdated(user,userAntigo){
	if(user.caminho===userAntigo.caminho && user.email===userAntigo.email && user.gostos.toString()===userAntigo.gostos.toString()
		&& user.nome===userAntigo.nome && user.cidade===userAntigo.cidade && user.estado===userAntigo.estado){
		return false;
	}else{
		return true;
	}
}*/


function getEvento(pais, categoria, id) {
	return adminRef.child(`eventos/${pais}/${categoria}/${id}`).once("value")
		.then(evento => evento.val());
}

app.get("/evento", (req, res) => {



	getEvento(req.query.pais, req.query.categoria, req.query.id)
		.then(evento => {
			return res.render("index.ejs", { evento })
		})
		.catch(error => {
			console.log(error);
			res.send(error);
		})

})

exports.app = functions.https.onRequest(app)

