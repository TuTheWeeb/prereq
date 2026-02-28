import { useState, useEffect } from "react";
import "./App.css";

export interface Disciplina {
    Codigo: string;
    Nome: string;
    Teorica: string;
    Pratica: string;
    Extensao: string;
    Nivel: string;
    Requisitos: string[];
}

interface PropsMateria {
    disciplina: Disciplina;
    cumpridas: Record<string, boolean>;
    Requisitos: Record<string, string[]>;
    setCumpridas: Function;
}

function MenuEscolhaCurso({ nome, setNome }: { nome: string, setNome: Function }) {
    return (
        <div className="flex justify-center border-b-2 border-emerald-600 mb-5 mt-5 pb-1 sm:text-xl">
            <div className=""></div>
            <div className="">
                <label>Selecione o seu curso: </label>
                <select
                    className="text-center"
                    defaultValue={nome}
                    onChange={(event) => setNome(event.target.value)}
                >
                    <option key="ccomp" value="ccomp">
                        Ciências da Computação
                    </option>
                    <option key="quimica" value="quimica">
                        Quimica atribuições técnologicas
                    </option>
                </select>
            </div>
        </div>
    );
}

function Materia({
    disciplina,
    cumpridas,
    setCumpridas,
    Requisitos,
}: PropsMateria) {
    if (cumpridas[disciplina.Codigo] === true) {
        return (
            <li
                className="flex items-center max-[430px]:text-[14px] max-[430px]:w-33 sm:min-w-33 max-sm:border-2 sm:border-2 max-sm:rounded-md sm:rounded-xl bg-emerald-600 text-white border-emerald-500 p-1 m-1 hover:border-emerald-500 hover:bg-emerald-400 hover:text-white hover:font-extrabold h-18 justify-center"
                onClick={() => {
                    set_discp(setCumpridas, disciplina.Codigo, Requisitos);
                }}
                key={disciplina.Codigo}
            >
                <h1 className="">{disciplina.Nome}</h1>
            </li>
        );
    } else {
        return (
            <li
                className="flex items-center max-[430px]:text-[14px] max-[430px]:w-33 sm:min-w-33 max-sm:border-2 sm:border-2 max-sm:rounded-md sm:rounded-xl bg-slate-800 text-slate-300 border-slate-600 p-1 m-1 hover:border-emerald-500 hover:bg-slate-700 hover:text-white hover:font-extrabold h-18 justify-center"
                onClick={() => {
                    set_discp(setCumpridas, disciplina.Codigo, Requisitos);
                }}
                key={disciplina.Codigo}
            >
                <h1 className="">{disciplina.Nome}</h1>
            </li>
        );
    }
}

// Disabilita sequencialmente cada dependencia
function dis_discp(
    setCumpridas: Function,
    codigo: string,
    Requisitos: Record<string, string[]>,
) {
    setCumpridas((prevCumpridas: Record<string, boolean>) => {
        return {
            ...prevCumpridas,
            [codigo]: false,
        };
    });

    if (Requisitos[codigo] === undefined) {
        return;
    }

    Requisitos[codigo].map((req) => {
        dis_discp(setCumpridas, req, Requisitos);
    });
}

// seta a disciplina como cumprida ou não cumprida
function set_discp(
    setCumpridas: Function,
    codigo: string,
    Requisitos: Record<string, string[]>,
) {
    setCumpridas((prevCumpridas: Record<string, boolean>) => {
        return {
            ...prevCumpridas,
            [codigo]: !prevCumpridas[codigo],
        };
    });

    if (Requisitos[codigo] === undefined) {
        return;
    }

    Requisitos[codigo].map((req) => {
        dis_discp(setCumpridas, req, Requisitos);
    });
}

function App() {
    
    // Busca o curso selecionado no cache caso não ache incia vazio
    const [nome, setNome] = useState<string>(() => {
      const nomeSalvo = localStorage.getItem("curso");
      return nomeSalvo ? JSON.parse(nomeSalvo) : "ccomp";
    });

    // Busca cumpridas no cache caso não ache incializa vazia
    const [cumpridas, setCumpridas] = useState<Record<string, boolean>>(() => {
      const cumpridasSalvas = localStorage.getItem("cumpridas");
      return cumpridasSalvas ? JSON.parse(cumpridasSalvas) : {};
    });

    const [data, setData] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
        
    const [onView, setOnView] = useState({} as Record<string, boolean>);
    
    
    const [Requisitos, setRequisitos] = useState(
        {} as Record<string, string[]>,
    );
    const [groups, setGroups] = useState({} as Record<string, Disciplina[]>);

    useEffect(() => {
        fetch("/dados_" + nome + ".json", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Fetching error, response is not ok!");
                }
                return response.json();
            })
            .then((data) => {
                setData(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        
      // Salva o nome alterado para o localStorage
      localStorage.setItem("curso", JSON.stringify(nome));  
    }, [nome]);

    useEffect(() => {
      // Salva as materias cumpridas no localStorage
      localStorage.setItem("cumpridas", JSON.stringify(cumpridas));
    }, [cumpridas]);

    useEffect(() => {
        const novoOnView: Record<string, boolean> = {};
        const novoRequisitos: Record<string, string[]> = {};

        Object.entries(data).forEach(([chavePrincipal, Objetos]) => {
            if (chavePrincipal === "Requisitos") {
                return;
            }

            Object.entries(Objetos).forEach(([_, discp]) => {
                const disciplina = discp as Disciplina;

                if (disciplina.Requisitos.length > 0) {
                    disciplina.Requisitos.map((req) => {
                        if (novoRequisitos[req] === undefined) {
                            novoRequisitos[req] = [disciplina.Codigo];
                        } else {
                            novoRequisitos[req] = [
                                ...novoRequisitos[req],
                                disciplina.Codigo,
                            ];
                        }
                    });
                }

                if (
                    chavePrincipal === "1 Periodo" ||
                    disciplina.Requisitos.length === 0
                ) {
                    novoOnView[disciplina.Codigo] = true;
                } else {
                    const requisitos = disciplina.Requisitos;

                    const validade = requisitos
                        .map((req) =>
                            cumpridas[req] === undefined ||
                            cumpridas[req] === false
                                ? false
                                : true,
                        )
                        .reduce((p, n) => p && n);

                    novoOnView[disciplina.Codigo] = validade;
                }
            });
        });

        for (const [nivel, objetos] of Object.entries(data)) {
            if (nivel === "Requisitos") {
                continue;
            }

            groups[nivel] = objetos;
        }

        setOnView(novoOnView);
        setRequisitos(novoRequisitos);
        setGroups(groups);
    }, [data, cumpridas]);

    if (isLoading) return <div className="flex flex-col justify-center bg-slate-900 text-slate-200 w-full h-full">.</div>;
    return (
        <div className="flex flex-col justify-center bg-slate-900 text-slate-200">
            <div className="flex flex-col text-center font-bold">
                <MenuEscolhaCurso nome={nome} setNome={setNome}></MenuEscolhaCurso>
                {Object.entries(groups).map(([nivel, objetos]) => {
                    return (
                        <ul
                            className="grid md:grid-cols-5 max-md:grid-cols-3 max-sm:grid-cols-3 sm:ml-5 sm:mr-5"
                            key={nivel}
                        >
                            {Object.entries(objetos).map(
                                ([codigo, disciplina]) => {
                                    const validade = onView[codigo];

                                    if (validade) {
                                        return (
                                            <Materia
                                                disciplina={disciplina}
                                                cumpridas={cumpridas}
                                                setCumpridas={setCumpridas}
                                                Requisitos={Requisitos}
                                            ></Materia>
                                        );
                                    }

                                    return <></>;
                                },
                            )}
                        </ul>
                    );
                })}
            </div>
            <div className="flex flex-col items-center justify-center w-full h-20 font-bold border-t-2 mt-5 border-emerald-600 text-md text-emerald-500">
                <a href="https://github.com/TuTheWeeb/prereq" className="underline">
                    https://github.com/TuTheWeeb/prereq
                </a>
                <p>Em caso de erros, entrar em contato:</p>
                <a href="mailto:eduardotcq@ic.ufrj.br" className="underline">eduardotcq@ic.ufrj.br</a>
            </div>
        </div>
    );
}

export default App;
