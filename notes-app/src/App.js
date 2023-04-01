import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';


function Note({ note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [description, setDescription] = useState(note.description);

  const handleUpdate = () => {
    onUpdate(note.id, { title, description });
    setIsEditing(false);
  };

  return (
    <div style={{ 
      margin: '1rem 0', 
      padding: '1rem', 
      border: '1px solid gray',
      backgroundColor: '#f7f7f7',
      borderRadius: '10px',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.2)'
    }}>
      {isEditing ? (
        <div>
          <div>
            <label htmlFor="title" style={{ color: '#444', fontWeight: 'bold' }}>Title:</label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ 
                width: '95%',
                padding: '0.5rem',
                border: '2px solid #ccc',
                borderRadius: '5px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div>
            <label htmlFor="description" style={{ color: '#444', fontWeight: 'bold' }}>Description:</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ 
                width: '95%',
                minHeight: '100px',
                padding: '0.5rem',
                border: '2px solid #ccc',
                borderRadius: '5px',
                fontSize: '1rem'
              }}
            />
          </div>
          <button 
            onClick={handleUpdate}
            style={{ 
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '5px',
              margin: '0.5rem 0.5rem 0.5rem 0',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >Save</button>
          <button 
            onClick={() => setIsEditing(false)}
            style={{ 
              backgroundColor: '#f44336',
              color: 'white',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '5px',
              margin: '0.5rem 0 0.5rem 0.5rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >Cancel</button>
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#444', fontWeight: 'bold' }}>ID: {note.id}</h3>
          <h3 style={{ color: '#444', fontWeight: 'bold' }}>Title: {note.title}</h3>
          <h4 style={{ color: '#444' }}>Description: {note.description}</h4>
          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              backgroundColor: '#008CBA',
              color: 'white',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '5px',
              margin: '0.5rem 0.5rem 0.5rem 0',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >Edit</button>
          <button 
            onClick={() => onDelete(note.id)}
            style={{ 
              backgroundColor: '#f44336',
              color: 'white',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '5px',
              margin: '0.5rem 0 0.5rem 0.5rem',
              fontSize:'1rem',
              cursor: 'pointer'
              }}>Delete</button>
        </div>
      )}
    </div>
  );
}


function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState([]);
  const url = "https://notes-worker.jangidp318.workers.dev"

  const fetchNotes = async () => {
    await fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch resource")
        }
        return res.json()
      })
      .then(data => {
        setNotes(data)
        console.log(data)
      })
      .catch(error => {
        console.error(error)
      })
  }
  useEffect(() => {
    fetchNotes()
  }, [])

  const addNote = async () => {
    const key = uuidv4()
    setNotes([...notes, {id: key, title, description}])
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ "action": { "type": "ADD", "key": key, "value": { "title": title, "description": description } } })
    })
    if (!response.ok) {
      throw new Error(`Failed to add note: ${response.status} ${response.statusText}`);
    }
  };

  const deleteNote = async (id) => {
    setNotes(notes.filter((note) => note.id !== id));
    console.log(id)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ "action": { "type": "DELETE", "key": id } })
    })
    if (!response.ok) {
      throw new Error(`Failed to add note: ${response.status} ${response.statusText}`);
    }
  };

  const updateNote = async (id, updates) => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return { ...note, ...updates };
        } else {
          return note;
        }
      })
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ "action": { "type": "EDIT", "key": id , "value": { "title": updates.title, "description": updates.description }}})
    })
    if (!response.ok) {
      throw new Error(`Failed to add note: ${response.status} ${response.statusText}`);
    }
    await fetchNotes()
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: 'auto', 
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#f2f2f2',
      borderRadius: '10px',
      boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
    }}>
      <h1 style={{ 
        textAlign: 'center',
        color: '#2c3e50',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontWeight: 'bold',
        fontSize: '2.5rem',
        margin: '0',
        marginBottom: '2rem',
      }}>Notes App</h1>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title" style={{ 
            color: '#2c3e50',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            marginBottom: '0.5rem',
          }}>Title:</label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            style={{ 
              marginLeft: '0.5rem',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#e6e6e6',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="description" style={{ 
            color: '#2c3e50',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            marginBottom: '0.5rem',
          }}>Description:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            style={{ 
              marginLeft: '0.5rem',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#e6e6e6',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      </div>
      <button onClick={() => { addNote() }} style={{ 
        backgroundColor: '#3498db',
        color: '#fff',
        padding: '0.8rem 1.5rem',
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '2rem',
        cursor: 'pointer',
        boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease-in-out',
      }}>Add Note</button>
      {notes.length > 0 ?
        <div>
          {notes.map(note =>
            <Note
              key={note.id}
              note={note}
              onDelete={deleteNote}
              onUpdate={updateNote}
            />
          )}
        </div> :
        <p style={{ 
          color: '#2c3e50',
          fontWeight:'bold'}}>Please add notes</p>
      }
    </div>
  );
}

export default App;
