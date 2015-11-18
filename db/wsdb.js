function connect(callback){
	if(window.openDatabase){
		var db=openDatabase('ld', '1.0', 'Library Demo', 2 * 1024 * 1024);
		console.log("Opened database");
		db.transaction(function (tx) {  
		   tx.executeSql('CREATE TABLE IF NOT EXISTS users (userid integer not null primary key autoincrement, firstname text not null, lastname text not null, address text not null, email text not null, card text not null unique)');
		   tx.executeSql('CREATE TABLE IF NOT EXISTS books (bookid integer not null primary key autoincrement, name text not null, author text not null, genre text not null, isbn text not null unique)');
		   tx.executeSql('CREATE TABLE IF NOT EXISTS userBooks (ubid integer not null primary key autoincrement, user integer not null, book integer not null, foreign key (user) references users (userid), foreign key (book) references books (bookid))');
		   callback.call(db);
		});
	}else{
		console.log("Web SQL Database not supported");
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
				this.transaction(function (tx){
					tx.executeSql(('INSERT INTO users (firstname, lastname, address, email, card) VALUES (?,?,?,?,?)'),
					[fName, lName, address, email, libraryCard],
					function(tx, result){
						if(result){
							console.log(result);
							document.getElementById("fNameField").value="";
							document.getElementById("lNameField").value="";
							document.getElementById("addressField").value="";
							document.getElementById("emailField").value="";
							document.getElementById("cardField").value="";
							document.getElementById("newUserStatus").innerHTML="<b>Saved</b>";
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
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
				this.transaction(function (tx){
					tx.executeSql(('INSERT INTO books (name, author, genre, isbn) VALUES (?,?,?,?)'),
					[name, author, genre, isbn],
					function(tx, result){
						if(result){
							console.log(result);
							document.getElementById("nameField").value="";
							document.getElementById("authorField").value="";
							document.getElementById("genreField").value="";
							document.getElementById("isbnField").value="";
							document.getElementById("newBookStatus").innerHTML="<b>Saved</b>";
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
			}
		});
	}else{
		console.log("Some fields are missing");
		document.getElementById("newBookStatus").innerHTML="<b>Some fields are missing</b>";
	}
}
function getUserList(){
	connect(function(){
		if(this){
			var results="";
			this.transaction(function (tx){
				tx.executeSql('SELECT userid, firstname, lastname from users', [],
				function(tx, result){
					if(result){
						console.log(result);
						for(var i=0;i<result.rows.length;i++){
							results+=(i+1)+". <a href='user.html?key="+result.rows.item(i).userid+"'>"+result.rows.item(i).firstname+" "+result.rows.item(i).lastname+"</a><br />";
						}
						console.log("User list done!");
						document.getElementById("userList").innerHTML=results;
					}
				},
				function(err){
					console.log("Database error: "+err);
				});
			});
		}
	});
}
function getBookList(){
	connect(function(){
		if(this){
			var results="";
			this.transaction(function (tx){
				tx.executeSql('SELECT bookid, name from books', [],
				function(tx, result){
					if(result){
						console.log(result);
						for(var i=0;i<result.rows.length;i++){
							results+=(i+1)+". <a href='book.html?key="+result.rows.item(i).bookid+"'>"+result.rows.item(i).name+"</a><br />";
						}
						console.log("Book list done!");
						document.getElementById("bookList").innerHTML=results;
					}
				},
				function(err){
					console.log("Database error: "+err);
				});
			});
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
				this.transaction(function (tx){
					tx.executeSql('SELECT firstname, lastname, address, email, card FROM users WHERE card=?', [search],
					function(tx, result){
						if(result){
							console.log(result);
							for(var i=0;i<result.rows.length;i++){
								results+="<h3>Search: "+search+"</h3>Firstname:"+result.rows.item(i).firstname+"<br />Lastname:"+result.rows.item(i).lastname+"<br />Address:"+result.rows.item(i).address+"<br />Email:"+result.rows.item(i).email+"<br />Card:"+result.rows.item(i).card;
							}
							if(results){
								document.getElementById("searchResult").innerHTML=results;
							}else{
								document.getElementById("searchResult").innerHTML="0 Hits";
							}
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
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
				this.transaction(function (tx){
					tx.executeSql('SELECT firstname, lastname, address, email, card from users WHERE firstname LIKE ? OR firstname LIKE ? OR lastname LIKE ? OR lastname LIKE ?', [("%"+search[0]+"%"),("%"+search[1]+"%"),("%"+search[0]+"%"),("%"+search[1]+"%")]/*Searching with "like" needs "%" to act as wildcards (on this case to both directions beginning and end). Hardcoded for now, a loop would be better to check all names, not only two*/,
					function(tx, result){
						if(result){
							console.log(result);
							for(var i=0;i<result.rows.length;i++){
								results+="<h3>Search: "+search+"</h3>Firstname:"+result.rows.item(i).firstname+"<br />Lastname:"+result.rows.item(i).lastname+"<br />Address:"+result.rows.item(i).address+"<br />Email:"+result.rows.item(i).email+"<br />Card:"+result.rows.item(i).card;
							}
							if(results){
								document.getElementById("searchResult").innerHTML=results;
							}else{
								document.getElementById("searchResult").innerHTML="0 Hits";
							}
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
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
				this.transaction(function (tx){
					tx.executeSql('SELECT name, author, genre, isbn FROM books WHERE isbn=?', [search],
					function(tx, result){
						if(result){
							console.log(result);
							for(var i=0;i<result.rows.length;i++){
								results+="<h3>Search: "+search+"</h3><p>Name:"+result.rows.item(i).name+"<br />Author:"+result.rows.item(i).author+"<br />Genre:"+result.rows.item(i).genre+"<br />ISBN:"+result.rows.item(i).isbn;
							}
							if(results){
								results+="</p>";
								document.getElementById("searchResult").innerHTML=results;
							}else{
								document.getElementById("searchResult").innerHTML="0 Hits";
							}
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
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
				this.transaction(function (tx){
					tx.executeSql('SELECT name, author, genre, isbn FROM books WHERE name LIKE ?', [("%"+search+"%")],
					function(tx, result){
						if(result){
							console.log(result);
							for(var i=0;i<result.rows.length;i++){
								results+="<h3>Search: "+search+"</h3><p>Name:"+result.rows.item(i).name+"<br />Author:"+result.rows.item(i).author+"<br />Genre:"+result.rows.item(i).genre+"<br />ISBN:"+result.rows.item(i).isbn;
							}
							if(results){
								results+="</p>";
								document.getElementById("searchResult").innerHTML=results;
							}else{
								document.getElementById("searchResult").innerHTML="0 Hits";
							}
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
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
				this.transaction(function (tx){
					//tx.executeSql('SELECT DISTINCT firstname, lastname, address, email, card, bookid, name FROM users JOIN userBooks ON users.userid=userBooks.user JOIN books ON userBooks.book=books.bookid WHERE users.userid=?', [id], //if no books borrowed, will not load profile.
					tx.executeSql('SELECT DISTINCT firstname, lastname, address, email, card FROM users WHERE userid=?', [id],
					function(tx, result){
						if(result){
							console.log(result);
							var returnValue="Firstname: <input type='text' id='editFname' value='"+result.rows.item(0).firstname+"' /><br/>Lastname: <input type='text' id='editLname' value='"+result.rows.item(0).lastname+"' /><br />Address: <input type='text' id='editAddress' value='"+result.rows.item(0).address+"' /><br />Email: <input type='text' id='editEmail' value='"+result.rows.item(0).email+"' /><br />Card ID: <input type='text' id='cardId' value='"+result.rows.item(0).card+"' disabled /><br /><br /><input type='button' value='Edit' onclick='modifyUserById("+id+")' /><input type='button' value='Delete' onclick='removeUserById("+id+")' /><br /><br /><div id='userEditStatus'></div>";
							document.getElementById("userData").innerHTML=returnValue;
						}else{
							console.log("No user found");
							document.getElementById("userData").innerHTML="No user found";
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
					tx.executeSql('SELECT DISTINCT bookid, name FROM userBooks JOIN books ON userBooks.book=books.bookid WHERE user=?', [id],
					function(tx, result){
						if(result){
							console.log('Round 2')
							console.log(result);
							if(result.rows.length>0){
								var returnValue2="";
								for(i=0;i<result.rows.length;i++){
									returnValue2+="<input type='checkbox' name='borrowedBooks' value='"+result.rows.item(i).bookid+"' /> "+result.rows.item(i).name+"<br />";
								}
								document.getElementById("userBorrowedBooks").innerHTML="Borrowed books:<br />"+returnValue2+"<br /><input type='button' value='Return book(s)' onclick='returnBooks("+id+")' />";
							}
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
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
				this.transaction(function (tx){
					tx.executeSql('SELECT name, author, genre, isbn FROM books WHERE bookid=?', [id],
					function(tx, result){
						if(result){
							console.log(result);
							var returnValue="Name: <input type='text' id='editName' value='"+result.rows.item(0).name+"' /><br/>Author: <input type='text' id='editAuthor' value='"+result.rows.item(0).author+"' /><br />Genre: <input type='text' id='editGenre' value='"+result.rows.item(0).genre+"' /><br />ISBN: <input type='text' id='isbn' value='"+result.rows.item(0).isbn+"' disabled /><br /><br /><input type='button' value='Edit' onclick='modifyBookById("+id+")' /><input type='button' value='Delete' onclick='removeBookById("+id+")' /><br /><br /><div id='bookEditStatus'></div>";
							document.getElementById("bookData").innerHTML=returnValue;
						}else{
							console.log("No book found");
							document.getElementById("bookData").innerHTML="No book found";
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
			}
		});
	}else{
		console.log("No book found");
		document.getElementById("bookData").innerHTML="No book found";
	}
}
function removeUserById(id){
	if(id){
		console.log("ID: "+id);
		connect(function(){
			if(this){
				this.transaction(function (tx){
					tx.executeSql('DELETE FROM users WHERE userid=?', [id],
					function(tx, result){
						if(result){
							console.log(result);
							window.location.replace("listUsers.html");
						}else{
							console.log("User not found");
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
			}
		});
	}
}
function removeBookById(id){
	if(id){
		console.log("ID: "+id);
		connect(function(){
			if(this){
				this.transaction(function (tx){
					tx.executeSql('DELETE FROM books WHERE bookid=?', [id],
					function(tx, result){
						if(result){
							console.log(result);
							window.location.replace("listBooks.html");
						}else{
							console.log("Book not found");
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
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
		connect(function(){
			if(this){
				this.transaction(function (tx){
					tx.executeSql('UPDATE users SET firstname=?, lastname=?, address=?, email=? WHERE userid=?', [fName, lName, address, email, id],
					function(tx, result){
						if(result){
							console.log(result);
							console.log("User modified");
							document.getElementById("userEditStatus").innerHTML="<b>User modified</b>";
						}else{
							console.log("Update failed");
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
			}
		});
	}else{
		console.log("Edit data missing");
		document.getElementById("userEditStatus").innerHTML="<b>Edit data missing. All fields aren't filled</b>";
	}
}
function modifyBookById(id){
	var name=document.getElementById("editName").value;
	var author=document.getElementById("editAuthor").value;
	var genre=document.getElementById("editGenre").value;
	var isbn=document.getElementById("isbn").value;
	
	if(name&&author&&genre&&isbn&&id){
		connect(function(){
			if(this){
				this.transaction(function (tx){
					tx.executeSql('UPDATE books SET name=?, author=?, genre=? WHERE bookid=?', [name, author, genre, id],
					function(tx, result){
						if(result){
							console.log(result);
							console.log("Book modified");
							document.getElementById("bookEditStatus").innerHTML="<b>Book modified</b>";
						}else{
							console.log("Update failed");
						}
					},
					function(err){
						console.log("Database error: "+err);
					});
				});
			}
		});
	}else{
		console.log("Edit data missing");
		document.getElementById("bookEditStatus").innerHTML="<b>Edit data missing. All fields aren't filled</b>";
	}
}
function getUsersAndBooks(){
	connect(function(){
		if(this){
			var results1="";
			var results2="";
			this.transaction(function (tx){
				tx.executeSql('SELECT userid, firstname, lastname from users', [],
				function(tx, result){
					if(result){
						console.log(result);
						for(var i=0;i<result.rows.length;i++){
							results1+="<input type='radio' name='user' value='"+result.rows.item(i).userid+"' />"+result.rows.item(i).firstname+" "+result.rows.item(i).lastname+"<br />";
						}
						console.log("User list done!");
						document.getElementById("userBookList1").innerHTML=results1;
					}
				},
				function(err){
					console.log("Database error: "+err);
				});
				tx.executeSql('SELECT bookid, name from books', [],
				function(tx, result){
					if(result){
						console.log(result);
						for(var i=0;i<result.rows.length;i++){
							results2+="<input type='checkbox' name='books' value='"+result.rows.item(i).bookid+"' />"+result.rows.item(i).name+"<br />";
						}
						console.log("Book list done!");
						document.getElementById("userBookList2").innerHTML=results2;
					}
				},
				function(err){
					console.log("Database error: "+err);
				});
			});
		}
	});
}
function borrowBooks(){
	var radiobuttons=document.getElementsByName('user');
	var checkboxes=document.getElementsByName('books');
	var queryValues="(?,?)";
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
				checkboxesChecked.push(radioValue);
				checkboxesChecked.push(checkboxes[i].value);
				if(checkboxesChecked.length>2){//If over one user and book
					queryValues+=", (?,?)";
				}
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
			connect(function(){//Check for duplicates?! Or SELECT DISTINCT...
				if(this){
					console.log(queryValues);
					console.dir(checkboxesChecked);
					this.transaction(function (tx){
						var query="INSERT INTO userBooks (user, book) VALUES "+queryValues;
						console.log("query: "+query);
						tx.executeSql(query, checkboxesChecked,
						function(tx, result){
							if(result){
								console.log("Books loaned");
								console.log(result);
								document.getElementById("borrowStatus").innerHTML="Books loaned";
							}
						},
						function(err){
							console.log("Database error: "+err);
						});
					});
				}
			});
		}
	}
}
function returnBooks(id){
	var checkboxes=document.getElementsByName('borrowedBooks');
	var checkboxesChecked=[];
	for (var i=0; i<checkboxes.length; i++) {
		if (checkboxes[i].checked) {
			checkboxesChecked.push(checkboxes[i].value);
		}
	}
	console.dir(checkboxesChecked);
	if(checkboxesChecked[0]!=null){
		connect(function(){
			if(this){
				this.transaction(function (tx){
					for(var i=0;i<checkboxesChecked.length;i++){
						tx.executeSql('DELETE FROM userBooks WHERE user=? AND book=?', [id,checkboxesChecked[i]],
						function(tx, result){
							console.log(result);
							location.reload();
						},
						function(err){
							console.log("Database error: "+err);
						});
					}
				});
			}
		});
	}
}