import { useState, useEffect } from 'react'
import './App.css'

export interface Disciplina {
  Codigo: string;
  Nome: string;
  Teorica: string;
  Pratica: string;
  Extensao: string;
  Requisitos: string[];
}

export type PeriodoMap = Record<string, Disciplina>;

export type RequisitosMap = Record<string, string[]>;

function App() {
  const [name, setName] = useState("ccomp");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/dados_"+name+".json", {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Fetching error, response is not ok!');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });

  }, [data]);

  if (isLoading) return <div>Carregando...</div>;

  const separadores = Object.entries(data)
  

  return (
    <>
      <div className='flex flex-col text-center'>
        <h1 className='text-3xl text-center'>Prereq:</h1>
        <ul>
        {
          separadores.flatMap
)
        }
        </ul>
      </div>
    </>
  )
}

export default App
