import "./styles.css";

function getValues() {
  var title = document.getElementById("title").value;
  var note = document.getElementById("note").value;

  return [title, note];
}

function Empty() {
  document.getElementById("title").value = "";
  document.getElementById("note").value = "";
}

// CreateNote
function save() {
  document.getElementById("loading").style.display = "block";

  var [title, note] = getValues();

  if (title.trim() === "") {
    document.getElementById("titleError").style.display = "block";
    document.getElementById("titleNotFound").style.display = "none";
    setTimeout(function() {
      document.getElementById("loading").style.display = "none";
    }, 9000); 
    return;
  } else {
    document.getElementById("titleError").style.display = "none";
    document.getElementById("titleNotFound").style.display = "none";
  }

  if (note.trim() === "") {
    document.getElementById("noteError").style.display = "block";
    setTimeout(function() {
      document.getElementById("loading").style.display = "none";
    }, 9000); 
    return;
  } else {
    document.getElementById("noteError").style.display = "none";
  }

  fetch("https://notes-api.dicoding.dev/v2/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      body: note,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to save the note");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      show();
      document.getElementById("loading").style.display = "none";
    })
    .catch((error) => {
      console.error("There was a problem with your fetch operation:", error);
      setTimeout(function() {
        document.getElementById("loading").style.display = "none";
      }, 10000); 
    });

  Empty();
}

// MenampilkanNote
async function show() {
  var notes = document.getElementById("notes");
  notes.innerHTML = "";

  var response = await fetch('https://notes-api.dicoding.dev/v2/notes')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .catch(error => {
          console.error('There was a problem with your fetch operation:', error);
      });

  console.log(response);

  response.data.forEach(function (note) {
      var cardContainer = document.createElement('div');
      cardContainer.classList.add('card-container');
      cardContainer.setAttribute('data-note-id', note.id);

      var cardContent = document.createElement('div');
      cardContent.classList.add('card-content');

      var cardTitle = document.createElement('div');
      cardTitle.classList.add('card-title');
      cardTitle.textContent = note.title;

      var cardText = document.createElement('p');
      cardText.classList.add('card-text');
      cardText.textContent = note.body;

      cardContent.appendChild(cardTitle);
      cardContent.appendChild(cardText);
      cardContainer.appendChild(cardContent);

      notes.appendChild(cardContainer);

      cardContainer.addEventListener('click', function () {
          showModal(note.id);
      });
  });
}

// ModalNote
function showModal(noteId) {
  fetch('https://notes-api.dicoding.dev/v2/notes/' + noteId)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      var modalTitle = document.getElementById('modalTitle');
      var modalBody = document.getElementById('modalBody');

      modalTitle.textContent = data.data.title;
      modalBody.textContent = data.data.body;

      var modal = document.getElementById('myModal');
      modal.style.display = 'block';

      var deleteButton = document.querySelector('.modal-content .delete-btn');
      deleteButton.dataset.noteId = noteId;

      // meriksa, catatannya di arsip apa engga
      if (data.data.archived) {
        var archiveButton = document.querySelector('.modal-content .archive-btn');
        archiveButton.style.display = 'none';

        var unarchiveButton = document.createElement('button');
        unarchiveButton.textContent = 'Unarchive';
        unarchiveButton.classList.add('archive-btn');
        unarchiveButton.addEventListener('click', function() {
          unarchiveNote(noteId);
        });
        modal.querySelector('.modal-content').appendChild(unarchiveButton);
      } else {
        var unarchiveButton = document.querySelector('.modal-content .archive-btn');
        unarchiveButton.style.display = 'none';

        var archiveButton = document.createElement('button');
        archiveButton.textContent = 'Archive';
        archiveButton.classList.add('archive-btn');
        archiveButton.addEventListener('click', function() {
          archiveNote(noteId);
        });
        modal.querySelector('.modal-content').appendChild(archiveButton);
      }
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
}

document.querySelector('.modal-content .delete-btn').addEventListener('click', function() {
  const noteId = this.dataset.noteId; 
  deleteNote(noteId); 
});

// DeleteNote
async function deleteNote(noteId) {
  try {
    const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${noteId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (response.ok) {
      console.log(data.message); 
      window.location.reload();
    } else {
      console.error('Failed to delete note:', data.error);
    }
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

document.querySelector('.modal-content .archive-btn').addEventListener('click', function() {
  const noteId = getCurrentNoteId(); 
  archiveNote(noteId); 
});

// ArchiveNote
async function archiveNote(noteId) {
  try {
    const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${noteId}/archive`, {
      method: 'POST'
    });
    const data = await response.json();
    if (response.ok) {
      console.log(data.message); 
      window.location.reload();
    } else {
      console.error('Failed to archive note:', data.error);
    }
  } catch (error) {
    console.error('Error archiving note:', error);
  }
}

// UnArchiveNote
async function unarchiveNote(noteId) {
  try {
    const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${noteId}/unarchive`, {
      method: 'POST'
    });
    const data = await response.json();
    if (response.ok) {
      console.log(data.message); 
      window.location.reload();
    } else {
      console.error('Failed to unarchive note:', data.error);
    }
  } catch (error) {
    console.error('Error unarchiving note:', error);
  }
}

async function showArchivedNotes() {
  var hiddenNotesContainer = document.getElementById("hidden-notes");
  hiddenNotesContainer.innerHTML = "";

  var response = await fetch("https://notes-api.dicoding.dev/v2/notes/archived")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("There was a problem with your fetch operation:", error);
    });

  console.log(response);

  response.data.forEach(function (note) {
    // Cek apakah catatan dengan ID yang sama sudah ada di dalam hiddenNotesContainer
    if (!document.querySelector(`#hidden-notes [data-note-id="${note.id}"]`)) {
      var cardContainer = document.createElement('div');
      cardContainer.classList.add('card-container');
      cardContainer.setAttribute('data-note-id', note.id);

      var cardContent = document.createElement('div');
      cardContent.classList.add('card-content');

      var cardTitle = document.createElement('div');
      cardTitle.classList.add('card-title');
      cardTitle.textContent = note.title;

      var cardText = document.createElement('p');
      cardText.classList.add('card-text');
      cardText.textContent = note.body;

      cardContent.appendChild(cardTitle);
      cardContent.appendChild(cardText);
      cardContainer.appendChild(cardContent);

      hiddenNotesContainer.appendChild(cardContainer); // Menggunakan hiddenNotesContainer

      cardContainer.addEventListener('click', function () {
        showModal(note.id);
      });
    }
  });
}

// button untuk menjalankan ShowArchiveNotes
document.getElementById("toggleArchiveButton").addEventListener("click", function () {
  showArchivedNotes();
});

function getCurrentNoteId() {
  const modal = document.getElementById('myModal');
  return modal.dataset.noteId;
}

// Menampilkan Notes yang di di arsip
// async function showHidden() {
//   var hiddenNotesContainer = document.getElementById("hidden-notes");
//   hiddenNotesContainer.innerHTML = "";

//   var response = await fetch("https://notes-api.dicoding.dev/v2/notes/archived")
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json();
//     })
//     .catch((error) => {
//       console.error("There was a problem with your fetch operation:", error);
//     });

//   console.log(response);

//   response.data.forEach(function (note) {
//     // Cek apakah catatan dengan ID yang sama sudah ada di dalam hiddenNotesContainer
//     if (!document.querySelector(`#hidden-notes [data-note-id="${note.id}"]`)) {
//       var cardContainer = document.createElement('div');
//       cardContainer.classList.add('card-container');
//       cardContainer.setAttribute('data-note-id', note.id);

//       var cardContent = document.createElement('div');
//       cardContent.classList.add('card-content');

//       var cardTitle = document.createElement('div');
//       cardTitle.classList.add('card-title');
//       cardTitle.textContent = note.title;

//       var cardText = document.createElement('p');
//       cardText.classList.add('card-text');
//       cardText.textContent = note.body;

//       cardContent.appendChild(cardTitle);
//       cardContent.appendChild(cardText);
//       cardContainer.appendChild(cardContent);

//       hiddenNotesContainer.appendChild(cardContainer); 
//       cardContainer.addEventListener('click', function () {
//         showModal(note.id);
//       });
//     }
//   });
// }

function removeHiddenNotes() {
  var hiddenNotesContainer = document.getElementById("hidden-notes");
  hiddenNotesContainer.innerHTML = "";
}

function showAll() {
  show();
}


// function styleMethod() {
//   var note = document.getElementById("note");
//   var selectedText = note.value.substring(
//     note.selectionStart,
//     note.selectionEnd
//   );
//   var before = note.value.substring(0, note.selectionStart);
//   var after = note.value.substring(note.selectionEnd, note.value.length);

//   return [selectedText, before, after];
// }

customElements.define(
  "app-name",
  class extends HTMLElement {
    constructor() {
      super();
      const shadowRoot = this.attachShadow({ mode: "open" });
      const h1 = document.createElement("h1");
      h1.setAttribute("class", "app-name");
      h1.textContent = "My Application Notes";
      shadowRoot.appendChild(h1);

      const style = document.createElement("style");
      style.textContent = `h1{
            color: #673F69
        }`;
      shadowRoot.appendChild(style);
    }
  }
);

customElements.define(
  "app-footer",
  class extends HTMLElement {
    constructor() {
      super();
      const shadowRoot = this.attachShadow({ mode: "open" });
      const footer = document.createElement("footer");
      const p = document.createElement("p");
      p.textContent = "© 2024 Hilman";
      footer.appendChild(p);
      shadowRoot.appendChild(footer);

      const style = document.createElement("style");
      style.textContent = `
            footer {
                position: absoulute;
                bottom: 0;
                width: 100%;
                background-color: #FFAF45;
                color: white;
                text-align: center;
                font-size: 1rem;
                padding: 0.1rem;
                box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
                z-index: 999;
            }
        `;
      shadowRoot.appendChild(style);
    }
  }
);

customElements.define(
  "app-button-container",
  class extends HTMLElement {
    constructor() {
      super();
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `
                    <style>
                        .btn-container {
                          text-align: center;
                            gap: 0.5rem;
                        }

                        .btn-container>* {
                            margin: 0;
                        }

                        .btn-style {
                            color: #ffffff;
                            font-weight: bold;
                            padding: 0.75rem 1rem;
                            border-radius: 0.25rem;
                            border: none;
                            width: 100%;
                        }

                        .btn-style:hover {
                            cursor: pointer;
                        }

                        .blue {
                            background-color: #3b82f6;.. 
                        }

                    </style>
                    <div class="btn-container">
                        <button class="btn-style blue" id="saveButton">Save</button>
                    </div>
                `;
      shadowRoot.getElementById("saveButton").addEventListener("click", save);
    }
  }
);

function index() {
  var toggleArchiveButton = document.getElementById("toggleArchiveButton");
  var showArchived = false;
  var archivedNotesVisible = false;

  toggleArchiveButton.addEventListener("click", async function () {
    showArchived = !showArchived;
    if (showArchived) {
      await showArchivedNotes();
      archivedNotesVisible = true;
    } else {
      if (archivedNotesVisible) {
        removeHiddenNotes();
        archivedNotesVisible = false;
      }
    }
    toggleArchiveButton.textContent = showArchived
      ? "Hide Archived Notes"
      : "Show Archived Notes";
  });

  document.addEventListener("DOMContentLoaded", function () {
    showAll();
  });
}




index();
