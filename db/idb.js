function connect(callback){
	var db;
	var store;
	window.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;
	if(!db){
		if(window.indexedDB){
			var request=window.indexedDB.open("ld", 1);
						
			request.onerror=function(event){
				console.log("Error opening DB", event);
			}
			request.onupgradeneeded=function(event){
				console.log("New or Upgrading");
				var dbe=event.target.result;
				if(!dbe.objectStoreNames.contains("libraryusers")) {
					store=dbe.createObjectStore("libraryusers", {autoIncrement:true});
					store.createIndex("card","card", {unique:true});
					store.createIndex("email","email", {unique:true});
					store.createIndex("firstname", "firstname", {unique:false});
					store.createIndex("lastname", "lastname", {unique:false});
				}
				if(!dbe.objectStoreNames.contains("librarybooks")) {
					store=dbe.createObjectStore("librarybooks", {autoIncrement:true});
					store.createIndex("isbn", "isbn", {unique:true});
					store.createIndex("name", "name", {unique:false});
					store.createIndex("author", "author", {unique:false});
					store.createIndex("genre", "genre", {unique:false});
				}
			}
			request.onsuccess=function(event){
				console.log("Success opening DB");
				db=event.target.result;
				callback.call(db);
			}
		}
		else{
			console.log("Your Browser does not support IndexedDB");
		}
	}
}

function newUser(){
	var fName=document.getElementById("fNameField").value;
	var lName=document.getElementById("lNameField").value;
	var address=document.getElementById("addressField").value;
	var email=document.getElementById("emailField").value;
	var libraryCard=document.getElementById("cardField").value;
	if(fName&&lName&&address&&email&&libraryCard){
		console.log(fName+" "+lName+", "+address+", "+email+", "+libraryCard);
		connect(function(){
			if(this){
				var user={firstname:fName, lastname:lName, address:address, email:email, card:libraryCard}
				var transaction=this.transaction(["libraryusers"],"readwrite");
				var objstore=transaction.objectStore("libraryusers");
				var query=objstore.add(user);
				transaction.oncomplete=function(){
					console.log("User saved");
					document.getElementById("fNameField").value="";
					document.getElementById("lNameField").value="";
					document.getElementById("addressField").value="";
					document.getElementById("emailField").value="";
					document.getElementById("cardField").value="";
					document.getElementById("newUserStatus").innerHTML="<b>Saved</b>";
				}
				query.onerror=function(err){
					console.log("Error", err.target.error.name);
				}
				query.onsuccess=function(){
					console.log("Saving user");
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Some fields are missing");
		document.getElementById("newUserStatus").innerHTML="<b>Some fields are missing</b>";
	}
}
function newBook(){
	var name=document.getElementById("nameField").value;
	var author=document.getElementById("authorField").value;
	var genre=document.getElementById("genreField").value;
	var isbn=document.getElementById("isbnField").value;
	if(name&&author&&genre&&isbn){
		console.log(name+" "+author+", "+genre+", "+isbn);
		connect(function(){
			if(this){
				var book={name:name, author:author, genre:genre, isbn:isbn}
				var transaction=this.transaction(["librarybooks"],"readwrite");
				var objstore=transaction.objectStore("librarybooks");
				var query=objstore.add(book);
				transaction.oncomplete=function(){
					console.log("Book saved");
					document.getElementById("nameField").value="";
					document.getElementById("authorField").value="";
					document.getElementById("genreField").value="";
					document.getElementById("isbnField").value="";
					document.getElementById("newBookStatus").innerHTML="<b>Saved</b>";
				}
				query.onerror=function(err){
					console.log("Error", err.target.error.name);
				}
				query.onsuccess=function(){
					console.log("Saving book");
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}
	else{
		console.log("Some fields are missing");
		document.getElementById("newBookStatus").innerHTML="<b>Some fields are missing</b>";
	}
}
function getUserList(){
	connect(function(){
		if(this){
			var result="";
			var count=0;
			var transaction=this.transaction(["libraryusers"],"readonly");
			var query=transaction.objectStore("libraryusers").openCursor();
			transaction.oncomplete=function(){
				console.log("User list done!");
				document.getElementById("userList").innerHTML=result;
			}
			query.onsuccess=function(res){
				var cursor=res.target.result;
				if(cursor){
					count++;
					console.log(cursor.value);
					result+=count+". <a href='user.html?key="+cursor.key+"'>"+cursor.value.firstname+" "+cursor.value.lastname+"</a><br />";
					cursor.continue();
				}
			}
		} else{
			console.log("DB didn't load");
		}
	});
}
function getBookList(){
	connect(function(){
		if(this){
			var result="";
			var count=0;
			var transaction=this.transaction(["librarybooks"],"readonly");
			var query=transaction.objectStore("librarybooks").openCursor();
			transaction.oncomplete=function(){
				console.log("Book list done!");
				document.getElementById("bookList").innerHTML=result;
			}
			query.onsuccess=function(res){
				var cursor=res.target.result;
				if(cursor){
					count++;
					console.log(cursor.value);
					result+=count+". <a href='book.html?key="+cursor.key+"'>"+cursor.value.name+"</a><br />";
					cursor.continue();
				}
			}
		} else{
			console.log("DB didn't load");
		}
	});
}
function getUserByCardId(){
	var search=document.getElementById("idSearchValue").value;
	if(search){
		var results="";
		console.log("Search: "+search);
		connect(function(){
			if(this){
				var transaction=this.transaction(["libraryusers"],"readonly");
				var objstore=transaction.objectStore("libraryusers");
				var index=objstore.index("card");
				var range;
				var cursor;
				range=IDBKeyRange.only(search);
				transaction.oncomplete=function(){
					console.log("Result: "+results);
					document.getElementById("searchResult").innerHTML=results;
				}
				index.openCursor(range).onsuccess=function(res) {
					cursor=res.target.result;
					if(cursor){
						console.log("Cursor: "+cursor);
						results+="<h3>Searched: "+cursor.key+"</h3><p>";
						for(var field in cursor.value) {
							results+=field+": "+cursor.value[field]+"<br/>";
						}
						results+="</p>";
						cursor.continue();
					}
				}
				if(!results){
					document.getElementById("searchResult").innerHTML="0 Hits";
				}
			}else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Empty search");
		document.getElementById("searchResult").innerHTML="Empty search";
	}
}
function getUserByName(){
	var search=document.getElementById("nameSearchValue").value;
	if(search){
		var results="";
		console.log("Search: "+search);
		search=search.split(" ");
		connect(function(){
			if(this){
				var transaction=this.transaction(["libraryusers"],"readonly");
				var objstore=transaction.objectStore("libraryusers");
				var indexF=objstore.index("firstname");
				var indexL=objstore.index("lastname");
				var range;
				var cursor;
				transaction.oncomplete=function(){
					console.log(results);
					document.getElementById("searchResult").innerHTML=results;
				}
				for(var i=0;i<search.length;i++){
					range=IDBKeyRange.only(search[i]);
					indexF.openCursor(range).onsuccess=function(res) {
						cursor=res.target.result;
						if(cursor){
							console.log("Cursor: "+cursor);
							results+="<h3>Searched: "+cursor.key+"</h3><p>";
							for(var field in cursor.value) {
								results+=field+": "+cursor.value[field]+"<br/>";
							}
							results+="</p>";
							cursor.continue();
						}
					}
					indexL.openCursor(range).onsuccess=function(res) {
						cursor=res.target.result;
						if(cursor){
							console.log("Cursor: "+cursor);
							results+="<h3>Searched: "+cursor.key+"</h3><p>";
							console.log(results);
							for(var field in cursor.value) {
								results+=field+": "+cursor.value[field]+"<br/>";
							}
							results+="</p>";
							cursor.continue();
						}
					}
				}
				if(!results){
					document.getElementById("searchResult").innerHTML="0 Hits";
				}
			}else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Empty search");
		document.getElementById("searchResult").innerHTML="Empty search";
	}
}
function getBookByIsbn(){
	var search=document.getElementById("isbnSearchValue").value;
	if(search){
		var results="";
		console.log("Search: "+search);
		connect(function(){
			if(this){
				var transaction=this.transaction(["librarybooks"],"readonly");
				var objstore=transaction.objectStore("librarybooks");
				var index=objstore.index("isbn");
				var range;
				var cursor;
				range=IDBKeyRange.only(search);
				transaction.oncomplete=function(){
					console.log("Result: "+results);
					if(!results||results=="</p>"){//need to test and add to the rest!!
						document.getElementById("searchResult").innerHTML="0 Hits";
					}else{
						document.getElementById("searchResult").innerHTML=results;
					}
				}
				index.openCursor(range).onsuccess=function(res) {
					cursor=res.target.result;
					if(cursor){
						console.log("Cursor: "+cursor);
						results+="<h3>Searched: "+cursor.key+"</h3><p>";
						for(var field in cursor.value) {
							results+=field+": "+cursor.value[field]+"<br/>";
						}
						results+="</p>";
						cursor.continue();
					}
				}
			}else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Empty search");
		document.getElementById("searchResult").innerHTML="Empty search";
	}
}
function getBookByName(){
	var search=document.getElementById("nameSearchValue").value;
	if(search){
		var results="";
		console.log("Search: "+search);
		connect(function(){
			if(this){
				var transaction=this.transaction(["librarybooks"],"readonly");
				var objstore=transaction.objectStore("librarybooks");
				var index=objstore.index("name");
				var range;
				var cursor;
				range=IDBKeyRange.only(search);
				transaction.oncomplete=function(){
					console.log(results);
					document.getElementById("searchResult").innerHTML=results;
				}
				index.openCursor(range).onsuccess=function(res) {
					cursor=res.target.result;
					if(cursor){
						console.log("Cursor: "+cursor);
						results+="<h3>Searched: "+cursor.key+"</h3><p>";
						for(var field in cursor.value) {
							results+=field+": "+cursor.value[field]+"<br/>";
						}
						results+="</p>";
						cursor.continue();
					}
				}
				if(!results){
					document.getElementById("searchResult").innerHTML="0 Hits";
				}
			}else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Empty search");
		document.getElementById("searchResult").innerHTML="Empty search";
	}
}
function getUserById(){
	var id=window.location.search;
	if(id){
		id=id.split("=").pop();
		console.log("id: "+id);
		connect(function(){
			if(this){
				var transaction=this.transaction(["libraryusers"],"readonly");
				var objstore=transaction.objectStore("libraryusers");
				var query=objstore.get(Number(id));
				var result="";
				var result2=[];
				transaction.oncomplete=function(){
					console.dir(result);
					if(result){
						var returnValue="Firstname: <input type='text' id='editFname' value='"+result.firstname+"' /><br />Lastname: <input type='text' id='editLname' value='"+result.lastname+"' /><br/>Address: <input type='text' id='editAddress' value='"+result.address+"' /><br />Email: <input type='text' id='editEmail' value='"+result.email+"' /><br />Card ID: <input type='text' id='cardId' value='"+result.card+"' disabled /><br /><br /><input type='button' value='Edit' onclick='modifyUserById("+id+")' /><input type='button' value='Delete' onclick='removeUserById("+id+")' /><br /><br /><div id='userEditStatus'></div>";
						document.getElementById("userData").innerHTML=returnValue;
						if(result.books){
							console.log("User has borrowed books");
							connect(function(){
								if(this){
									transaction=this.transaction(["librarybooks"],"readonly");
									objstore=transaction.objectStore("librarybooks");
									transaction.oncomplete=function(){
										var returnValue2="";
										for(var i=0;i<result2.length;i++){
											console.dir(result2[i]);
											returnValue2+="<input type='checkbox' name='borrowedBooks' value='"+result.books[i]+"' /> "+result2[i].name+"<br />";
										}
										if(returnValue2){
											document.getElementById("userBorrowedBooks").innerHTML="Borrowed books:<br>"+returnValue2+"<br /><input type='button' value='Return book(s)' onclick='returnBooks("+id+")' />";
										}
									}
									for(var i=0;i<result.books.length;i++){
										query=objstore.get(Number(result.books[i]));
										query.onerror=function(err){
											console.log("Error", err.target.error.name);
										}
										query.onsuccess=function(res){
											result2.push(res.target.result);
										}
									}
								}
							});
						}
					}else{
						document.getElementById("userData").innerHTML="0 Hits";
					}
				}
				query.onsuccess=function(res){
					result=res.target.result;
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("No user found");
		document.getElementById("userData").innerHTML="No user found";
	}
}
function getBookById(){
	var id=window.location.search;
	if(id){
		id=id.split("=").pop();
		console.log("id: "+id);
		connect(function(){
			if(this){
				var transaction=this.transaction(["librarybooks"],"readonly");
				var objstore=transaction.objectStore("librarybooks");
				var query=objstore.get(Number(id));
				var result="";
				transaction.oncomplete=function(){
					console.dir(result);
					if(result){
						var returnValue="Name: <input type='text' id='editName' value='"+result.name+"' /><br/>Author: <input type='text' id='editAuthor' value='"+result.author+"' /><br />Genre: <input type='text' id='editGenre' value='"+result.genre+"' /><br />ISBN: <input type='text' id='isbn' value='"+result.isbn+"' disabled /><br /><br /><input type='button' value='Edit' onclick='modifyBookById("+id+")' /><input type='button' value='Delete' onclick='removeBookById("+id+")' /><br /><br /><div id='bookEditStatus'></div>";
						document.getElementById("bookData").innerHTML=returnValue;
					}else{
						document.getElementById("bookData").innerHTML="0 Hits";
					}
				}
				query.onsuccess=function(res){
					result=res.target.result;
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}else{
		console.log("Empty search");
		document.getElementById("BookData").innerHTML="No such book";
	}
}
function removeUserById(id){
	if(id){
		console.log("ID: "+id);
		connect(function(){
			if(this){
				var transaction=this.transaction(["libraryusers"],"readwrite");
				var objstore=transaction.objectStore("libraryusers");
				var query=objstore.delete(Number(id));
				transaction.oncomplete=function(){
					console.log("User deleted");
					window.location.replace("listUsers.html");
				}
				query.onerror=function(err){
					console.log("Error", err.target.error.name);
				}
				query.onsuccess=function(){
					console.log("Deleting user");
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}
}
function removeBookById(id){
	if(id){
		console.log("ID: "+id);
		connect(function(){
			if(this){
				var transaction=this.transaction(["librarybooks"],"readwrite");
				var objstore=transaction.objectStore("librarybooks");
				var query=objstore.delete(Number(id));
				transaction.oncomplete=function(){
					console.log("Book deleted");
					window.location.replace("listBooks.html");
				}
				query.onerror=function(err){
					console.log("Error", err.target.error.name);
				}
				query.onsuccess=function(){
					console.log("Deleting Book");
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}
}
function modifyUserById(id){
	var fName=document.getElementById("editFname").value;
	var lName=document.getElementById("editLname").value;
	var address=document.getElementById("editAddress").value;
	var email=document.getElementById("editEmail").value;
	var card=document.getElementById("cardId").value;
	
	if(fName&&lName&&address&&email&&card&&id){
		var user={firstname:fName, lastname:lName, address:address, email:email, card:card}
		console.log("User & id:");
		console.dir(user);
		console.log(id);
		connect(function(){
			if(this){
				var transaction=this.transaction(["libraryusers"],"readwrite");
				var objstore=transaction.objectStore("libraryusers");
				var query=objstore.put(user, id);
				transaction.oncomplete=function(){
					console.log("User modified");
					document.getElementById("userEditStatus").innerHTML="<b>User modified</b>";
				}
				query.onerror=function(err){
					console.log("Error", err.target.error.name);
					document.getElementById("userEditStatus").innerHTML="<b>There was an error...</b>";
				}
				query.onsuccess=function(){
					console.log("Modifying user");
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}
	else{
		console.log("Edit data missing");
		document.getElementById("userEditStatus").innerHTML="<b>Edit data missing</b>";
	}
}
function modifyBookById(id){
	var name=document.getElementById("editName").value;
	var author=document.getElementById("editAuthor").value;
	var genre=document.getElementById("editGenre").value;
	var isbn=document.getElementById("isbn").value;
	
	if(name&&author&&genre&&isbn&&id){
		var book={name:name, author:author, genre:genre, isbn:isbn}
		console.log("Book & id:");
		console.dir(book);
		console.log(id);
		connect(function(){
			if(this){
				var transaction=this.transaction(["librarybooks"],"readwrite");
				var objstore=transaction.objectStore("librarybooks");
				var query=objstore.put(book, id);
				transaction.oncomplete=function(){
					console.log("Book modified");
					document.getElementById("bookEditStatus").innerHTML="<b>Book modified</b>";
				}
				query.onerror=function(err){
					console.log("Error", err.target.error.name);
					document.getElementById("bookEditStatus").innerHTML="<b>There was an error...</b>";
				}
				query.onsuccess=function(){
					console.log("Modifying Book");
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}
	else{
		console.log("Edit data missing");
		document.getElementById("bookEditStatus").innerHTML="<b>Edit data missing</b>";
	}
}
function getUsersAndBooks(){
	connect(function(){
		if(this){
			var result1="";
			var result2="";
			var transaction1=this.transaction(["libraryusers"],"readonly");
			var transaction2=this.transaction(["librarybooks"],"readonly");
			var query1=transaction1.objectStore("libraryusers").openCursor();
			var query2=transaction2.objectStore("librarybooks").openCursor();
			transaction1.oncomplete=function(){
				console.log("User list done!");
				document.getElementById("userBookList1").innerHTML=result1;
			}
			query1.onsuccess=function(res){
				var cursor1=res.target.result;
				if(cursor1){
					console.log(cursor1.value);
					result1+="<input type='radio' name='user' value='"+cursor1.key+"' />"+cursor1.value.firstname+" "+cursor1.value.lastname+"<br />";
					cursor1.continue();
				}
			}
			transaction2.oncomplete=function(){
				console.log("Book list done!");
				document.getElementById("userBookList2").innerHTML=result2;
			}
			query2.onsuccess=function(res){
				var cursor2=res.target.result;
				if(cursor2){
					console.log(cursor2.value);
					result2+="<input type='checkbox' name='books' value='"+cursor2.key+"' />"+cursor2.value.name+"<br />";
					cursor2.continue();
				}
			}
		} else{
			console.log("DB didn't load");
		}
	});
}
function borrowBooks(){
	var radiobuttons=document.getElementsByName('user');
	var checkboxes=document.getElementsByName('books');
	if(radiobuttons&&checkboxes){
		//http://stackoverflow.com/a/9618826
		var radioValue="";
		for (var i=0; i<radiobuttons.length; i++){
			if (radiobuttons[i].checked){
				radioValue=radiobuttons[i].value;
				break;
			}
		}

		//http://stackoverflow.com/a/8563293
		var checkboxesChecked=[];
		for (var i=0; i<checkboxes.length; i++) {
			if (checkboxes[i].checked) {
				checkboxesChecked.push(checkboxes[i].value);
			}
		}
		
		if(radioValue){
			console.log(radioValue);
		}else{
			console.log("No user selected");
		}
		if(checkboxesChecked[0]!=null){
			console.log(checkboxesChecked);
		}else{
			console.log("No books checked");
		}
		if(radioValue&&checkboxesChecked[0]!=null){
			connect(function(){
				if(this){
					var transaction=this.transaction(["libraryusers"],"readonly");
					var objstore=transaction.objectStore("libraryusers");
					var query=objstore.get(Number(radioValue));
					var result="";
					var user="";
					transaction.oncomplete=function(){
						connect(function(){
							if(this){
								transaction=this.transaction(["libraryusers"],"readwrite");
								objstore=transaction.objectStore("libraryusers");
								query=objstore.put(user, Number(radioValue));
								transaction.oncomplete=function(){
									console.log("Books loaned");
									document.getElementById("borrowStatus").innerHTML="Books loaned";
								}
								query.onerror=function(err){
									console.log("Error", err.target.error.name);
								}
								query.onsuccess=function(){
									console.log("Adding books to user");
								}
							}
						});
					}
					query.onerror=function(err){
						console.log("Error", err.target.error.name);
					}
					query.onsuccess=function(res){
						result=res.target.result;
						user={firstname:result.firstname, lastname:result.lastname, address:result.address, email:result.email, card:result.card, books:checkboxesChecked}
					}
				} else{
					console.log("DB didn't load");
				}
			});
		}
	}
}
function returnBooks(id){
	var checkboxes=document.getElementsByName('borrowedBooks');
	var checkboxesNotChecked=[];
	var countChecked=0;//if zero, no database action necessary.
	for (var i=0; i<checkboxes.length; i++) {
		if (!checkboxes[i].checked) {
			checkboxesNotChecked.push(checkboxes[i].value);
		}
		else{
			countChecked++;
		}
	}
	console.dir(checkboxesNotChecked);
	console.log("count: "+countChecked);
	
	if(countChecked>0){
		connect(function(){
			if(this){
				var transaction=this.transaction(["libraryusers"],"readonly");
				var objstore=transaction.objectStore("libraryusers");
				var query=objstore.get(Number(id));
				var result="";
				var user="";
				transaction.oncomplete=function(){
					connect(function(){
						if(this){
							transaction=this.transaction(["libraryusers"],"readwrite");
							objstore=transaction.objectStore("libraryusers");
							query=objstore.put(user, Number(id));
							transaction.oncomplete=function(){
								console.log("Book(s) returned");
								location.reload();
							}
							query.onerror=function(err){
								console.log("Error", err.target.error.name);
							}
							query.onsuccess=function(){
								console.log("Returning books");
							}
						}
					});
				}
				query.onerror=function(err){
					console.log("Error", err.target.error.name);
				}
				query.onsuccess=function(res){
					result=res.target.result;
					user={firstname:result.firstname, lastname:result.lastname, address:result.address, email:result.email, card:result.card, books:checkboxesNotChecked}
				}
			} else{
				console.log("DB didn't load");
			}
		});
	}
}

//Observations:
// -replace whole record on update (with put).
// -remove data from a record=replace whole record without the desired key/value.
// no equivalent for (SQL) LIKE, when searching data.