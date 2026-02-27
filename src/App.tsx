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

// Disabilita sequencialmente cada dependencia
function dis_discp(setCumpridas: Function, codigo: string, Requisitos: Record<string, string[]>) {
  setCumpridas((prevCumpridas: Record<string, boolean>) => {
    return {
      ...prevCumpridas,
      [codigo]: false 
    };
  });

  if (Requisitos[codigo] === undefined) {
    return;
  }
  
  Requisitos[codigo].map((req) => {
    dis_discp(setCumpridas, req, Requisitos)
  });
}

// seta a disciplina como cumprida ou não cumprida
function set_discp(setCumpridas: Function, codigo: string, Requisitos: Record<string, string[]>) {
  setCumpridas((prevCumpridas: Record<string, boolean>) => {
    return {
      ...prevCumpridas,
      [codigo]: !prevCumpridas[codigo] 
    };
  });

  if (Requisitos[codigo] === undefined) {
    return;
  }

  Requisitos[codigo].map((req) => {
    dis_discp(setCumpridas, req, Requisitos)
  });
}

function App() {
  const [name, setName] = useState("ccomp");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  //const [reqs, setReqs] = useState({} as Record<string, string[]>);
  const [cumpridas, setCumpridas] = useState({} as Record<string, boolean>);
  const [onView, setOnView] = useState({} as Record<string, boolean>);
  const [disciplinas, setDisciplinas] = useState({} as Record<string, Disciplina>);
  const [Requisitos, setRequisitos] = useState({} as Record<string, string[]>);

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

  }, []);

  useEffect(() => {
    const novasDisciplinas: Record<string, Disciplina> = {};
    const novoOnView: Record<string, boolean> = {};
    const novoRequisitos: Record<string, string[]> = {};

    Object.entries(data).forEach(([chavePrincipal, Objetos]) => {
      if (chavePrincipal === "Requisitos") {
        return;
      }
      
      Object.assign(novasDisciplinas, Objetos);
      

      Object.entries(Objetos).forEach(([_, discp]) => {
        const disciplina = discp as Disciplina;
        
        if (disciplina.Requisitos.length > 0) {
          disciplina.Requisitos.map((req) => {
            if (novoRequisitos[req] === undefined) {
              novoRequisitos[req] = [disciplina.Codigo];
            } else {
              novoRequisitos[req] = [...novoRequisitos[req], disciplina.Codigo];
            }
          })
        }

        if (chavePrincipal === "1 Periodo" || disciplina.Requisitos.length === 0) {
          novoOnView[disciplina.Codigo] = true;
        } else {
          const requisitos = disciplina.Requisitos;
          
          const validade = requisitos.map((req) => cumpridas[req] === undefined || cumpridas[req] === false ? false : true ).reduce((p, n) => p && n);

          novoOnView[disciplina.Codigo] = validade;

          
        }
      });
    });

    setOnView(novoOnView);
    setDisciplinas(novasDisciplinas);
    setRequisitos(novoRequisitos);
  }, [data, cumpridas]);



  if (isLoading) return <div>Carregando...</div>;
  return (
    <>
      <div className='flex flex-col text-center bg-black text-white w-screen h-screen'>
        <h1 className='text-3xl text-center'>Prereq:</h1>
        <ul className='grid grid-cols-6 m-5 gap-2'>
          {
            Object.entries(onView).map(([codigo, validade]) => {
              const disciplina = disciplinas[codigo];
              if (validade) {
                return <li className='border-2 border-gray-800 rounded-xl p-2 hover:border-white hover:text-white'  onClick={
                          () => {set_discp(setCumpridas, disciplina.Codigo, Requisitos);}
                } key={disciplina.Codigo}>{disciplina.Nome}</li>;
              }

              return null;
            })
            }
        </ul>
      </div>
    </>
  )
}

export default App
