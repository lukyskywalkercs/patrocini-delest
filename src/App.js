import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { initializeApp } from 'firebase/app';

function App() {
  const [marcas, setMarcas] = useState([]);
  const [nuevaMarca, setNuevaMarca] = useState({
    nombre: '',
    zona: 'local',
    categoria: '',
    contacto: '',
    email: '',
    telefono: '',
    estado: 'Pendiente',
    notas: '',
    fechaContacto: new Date().toISOString().split('T')[0],
    poblacion: '',
    tipoPatrocinio: ''
  });
  const [editando, setEditando] = useState(null);
  const [nuevaConversacion, setNuevaConversacion] = useState('');

  // Tipos de patrocinio disponibles
  const tiposPatrocinio = [
    { valor: 'patrocinador_oro', nombre: 'Patrocinador Oro (100€)', precio: 100 },
    { valor: 'patrocinador_plata', nombre: 'Patrocinador Plata (50€)', precio: 50 }
  ];

  // Obtener marcas
  useEffect(() => {
    const obtenerMarcas = async () => {
      try {
        const marcasRef = collection(db, 'marcas');
        const snapshot = await getDocs(marcasRef);
        const marcasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMarcas(marcasData || []);
      } catch (error) {
        console.error("Error al obtener marcas:", error);
        setMarcas([]);
      }
    };

    obtenerMarcas();
  }, []);

  // Guardar marca
  const guardarMarca = async (e) => {
    e.preventDefault();
    try {
      const marcasRef = collection(db, 'marcas');
      await addDoc(marcasRef, nuevaMarca);
      setNuevaMarca({
        nombre: '',
        zona: 'local',
        categoria: '',
        contacto: '',
        email: '',
        telefono: '',
        estado: 'Pendiente',
        notas: '',
        fechaContacto: new Date().toISOString().split('T')[0],
        poblacion: '',
        tipoPatrocinio: ''
      });
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // Función para eliminar marca
  const eliminarMarca = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
      try {
        const marcaRef = doc(db, 'marcas', id);
        await deleteDoc(marcaRef);
        setMarcas(marcas.filter(marca => marca.id !== id));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // Función para iniciar edición
  const iniciarEdicion = (marca) => {
    setEditando(marca.id);
    setNuevaMarca(marca);
  };

  // Función para guardar edición
  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const marcaRef = doc(db, 'marcas', editando);
      await updateDoc(marcaRef, nuevaMarca);
      
      setMarcas(marcas.map(marca => 
        marca.id === editando ? { ...nuevaMarca, id: editando } : marca
      ));
      
      setEditando(null);
      setNuevaMarca({
        nombre: '',
        zona: 'local',
        categoria: '',
        contacto: '',
        email: '',
        telefono: '',
        estado: 'Pendiente',
        notas: '',
        fechaContacto: new Date().toISOString().split('T')[0],
        poblacion: '',
        tipoPatrocinio: ''
      });
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  // Añadir función para guardar conversación
  const guardarConversacion = async (marcaId, texto) => {
    if (!texto.trim()) return;

    try {
      const marcaRef = doc(db, 'marcas', marcaId);
      const nuevaConv = {
        fecha: new Date().toISOString(),
        contenido: texto,
        tipo: 'email'
      };

      await updateDoc(marcaRef, {
        conversaciones: arrayUnion(nuevaConv)
      });

      // Actualizar el estado local
      setMarcas(marcas.map(marca => {
        if (marca.id === marcaId) {
          return {
            ...marca,
            conversaciones: [...(marca.conversaciones || []), nuevaConv]
          };
        }
        return marca;
      }));

      setNuevaConversacion('');
    } catch (error) {
      console.error("Error al guardar conversación:", error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header principal */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        borderBottom: '2px solid #007bff',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          color: '#007bff',
          fontSize: '2.5em',
          marginBottom: '10px'
        }}>
          Gestión de Patrocinadores
        </h1>
        <p style={{ color: '#666', fontSize: '1.1em' }}>
          Sistema de seguimiento y control de marcas colaboradoras
        </p>
      </div>

      {/* Formulario */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>{editando ? 'Editar Marca' : 'Añadir Nueva Marca'}</h2>
        <form onSubmit={editando ? guardarEdicion : guardarMarca} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
          <input
            type="text"
            placeholder="Nombre de la marca"
            value={nuevaMarca.nombre}
            onChange={e => setNuevaMarca({...nuevaMarca, nombre: e.target.value})}
            required
            style={{ padding: '8px' }}
          />
          
          <select
            value={nuevaMarca.zona}
            onChange={e => setNuevaMarca({...nuevaMarca, zona: e.target.value})}
            style={{ padding: '8px' }}
          >
            <option value="local">Local</option>
            <option value="nacional">Nacional</option>
            <option value="internacional">Internacional</option>
          </select>

          <select
            value={nuevaMarca.categoria}
            onChange={e => setNuevaMarca({...nuevaMarca, categoria: e.target.value})}
            style={{ padding: '8px' }}
            required
          >
            <option value="">Selecciona categoría</option>
            <option value="Tienda de música">Tienda de música</option>
            <option value="Bar/Restaurante">Bar/Restaurante</option>
            <option value="Estudio de grabación">Estudio de grabación</option>
            <option value="Sala de conciertos">Sala de conciertos</option>
            <option value="Cervecera">Cervecera</option>
            <option value="Distribuidora">Distribuidora</option>
            <option value="Ropa">Ropa</option>
            <option value="Otro">Otro</option>
          </select>

          <input
            type="text"
            placeholder="Población"
            value={nuevaMarca.poblacion}
            onChange={e => setNuevaMarca({...nuevaMarca, poblacion: e.target.value})}
            style={{ padding: '8px' }}
          />

          <input
            type="text"
            placeholder="Contacto"
            value={nuevaMarca.contacto}
            onChange={e => setNuevaMarca({...nuevaMarca, contacto: e.target.value})}
            style={{ padding: '8px' }}
          />

          <input
            type="email"
            placeholder="Email"
            value={nuevaMarca.email}
            onChange={e => setNuevaMarca({...nuevaMarca, email: e.target.value})}
            style={{ padding: '8px' }}
          />

          <input
            type="tel"
            placeholder="Teléfono"
            value={nuevaMarca.telefono}
            onChange={e => setNuevaMarca({...nuevaMarca, telefono: e.target.value})}
            style={{ padding: '8px' }}
          />

          <select
            value={nuevaMarca.tipoPatrocinio}
            onChange={e => setNuevaMarca({...nuevaMarca, tipoPatrocinio: e.target.value})}
            style={{ padding: '8px' }}
            required
          >
            <option value="">Selecciona tipo de patrocinio</option>
            {tiposPatrocinio.map(tipo => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.nombre}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Notas"
            value={nuevaMarca.notas}
            onChange={e => setNuevaMarca({...nuevaMarca, notas: e.target.value})}
            style={{ padding: '8px', gridColumn: '1 / -1' }}
            rows="3"
          />

          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: editando ? '#ffc107' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              gridColumn: '1 / -1'
            }}
          >
            {editando ? 'Guardar Cambios' : 'Guardar Marca'}
          </button>
        </form>
      </div>

      {/* Listado simple con contador */}
      <h2>Listado de Marcas ({marcas.length})</h2>
      
      {/* Lista de marcas con el diseño original */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {Array.isArray(marcas) && marcas.map(marca => (
          <div key={marca.id || Math.random()} style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h3>{marca.nombre || 'Sin nombre'}</h3>
            <p>Zona: {marca.zona || 'No especificada'}</p>
            <p>Categoría: {marca.categoria || 'No especificada'}</p>
            <p>Población: {marca.poblacion || 'No especificada'}</p>
            <p>Contacto: {marca.contacto || 'No especificado'}</p>
            <p>Email: {marca.email || 'No especificado'}</p>
            <p>Teléfono: {marca.telefono || 'No especificado'}</p>
            <p>Tipo de patrocinio: {
              tiposPatrocinio.find(t => t.valor === marca.tipoPatrocinio)?.nombre || 'No especificado'
            }</p>
            <p>Notas: {marca.notas || 'Sin notas'}</p>
            
            {/* Botones de acción */}
            <div style={{
              marginTop: '10px',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => iniciarEdicion(marca)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Editar
              </button>
              <button
                onClick={() => eliminarMarca(marca.id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;