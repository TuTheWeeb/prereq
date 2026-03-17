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

interface Edicoes {
    materias: Record<string, Disciplina[]>;
    obrigatorias: number;
    eletivas: number;
    ano: string;
}

interface Curso {
    edicoes: Edicoes[];
    nome: string;
}

function MenuEscolhaCurso({
    nome,
    setNome,
    cursos,
    edições,
    ano,
    setAno,
}: {
    nome: string;
    setNome: Function;
    cursos: Record<string, string>;
    edições: string[];
    ano: string;
    setAno: Function;
}) {
    return (
        <div className="flex justify-center border-b-2 border-emerald-600 mb-5 mt-5 pb-1 sm:text-xl">
            <div className="ml-4">
                <label>Grade: </label>
                <select
                    className="text-center"
                    value={ano}
                    onChange={(event) => setAno(event.target.value)}
                >
                    {edições.map((edição) => (
                        <option key={edição} value={edição}>
                            {edição}
                        </option>
                    ))}
                </select>
            </div>
            <div className="ml-4">
                <label>Selecione o seu curso: </label>
                <select
                    className="text-center"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                >
                    {Object.entries(cursos).map(([curso, _link]) => (
                        <option key={curso} value={curso}>
                            {curso}
                        </option>
                    ))}
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
                className="flex items-center max-[430px]:text-[14px] max-[430px]:w-33 sm:min-w-33 max-sm:border-2 sm:border-2 max-sm:rounded-md sm:rounded-xl bg-emerald-600 text-white border-emerald-500 p-1 m-1 hover:border-emerald-500 hover:bg-emerald-400 hover:text-white hover:font-extrabold h-18 justify-center cursor-pointer"
                onClick={() => {
                    set_discp(setCumpridas, disciplina.Codigo, Requisitos);
                }}
            >
                <h1 className="text-center">{disciplina.Nome}</h1>
            </li>
        );
    } else {
        return (
            <li
                className="flex items-center max-[430px]:text-[14px] max-[430px]:w-33 sm:min-w-33 max-sm:border-2 sm:border-2 max-sm:rounded-md sm:rounded-xl bg-slate-800 text-slate-300 border-slate-600 p-1 m-1 hover:border-emerald-500 hover:bg-slate-700 hover:text-white hover:font-extrabold h-18 justify-center cursor-pointer"
                onClick={() => {
                    set_discp(setCumpridas, disciplina.Codigo, Requisitos);
                }}
            >
                <h1 className="text-center">{disciplina.Nome}</h1>
            </li>
        );
    }
}

function dis_discp(
    setCumpridas: Function,
    codigo: string,
    Requisitos: Record<string, string[]>,
) {
    setCumpridas((prevCumpridas: Record<string, boolean>) => ({
        ...prevCumpridas,
        [codigo]: false,
    }));

    if (!Requisitos[codigo]) return;

    Requisitos[codigo].forEach((req) => {
        dis_discp(setCumpridas, req, Requisitos);
    });
}

function set_discp(
    setCumpridas: Function,
    codigo: string,
    Requisitos: Record<string, string[]>,
) {
    setCumpridas((prevCumpridas: Record<string, boolean>) => ({
        ...prevCumpridas,
        [codigo]: !prevCumpridas[codigo],
    }));

    if (!Requisitos[codigo]) return;

    Requisitos[codigo].forEach((req) => {
        dis_discp(setCumpridas, req, Requisitos);
    });
}

function App() {
    const [nome, setNome] = useState<string>(() => {
        const nomeSalvo = localStorage.getItem("curso");
        return nomeSalvo ? JSON.parse(nomeSalvo) : "Ciência da Computação";
    });

    const [cumpridas, setCumpridas] = useState<Record<string, boolean>>(() => {
        const cumpridasSalvas = localStorage.getItem("cumpridas");
        return cumpridasSalvas ? JSON.parse(cumpridasSalvas) : {};
    });

    const [cursos, setCursos] = useState<Record<string, string>>({});
    const [data, setData] = useState<Curso>();
    const [isLoading, setIsLoading] = useState(true);
    const [onView, setOnView] = useState({} as Record<string, boolean>);
    const [edições, setEdições] = useState<string[]>([]);
    const [ano, setAno] = useState<string>("");
    const [Requisitos, setRequisitos] = useState({} as Record<string, string[]>);
    const [groups, setGroups] = useState({} as Record<string, Disciplina[]>);

    // Carrega a lista de cursos principal
    useEffect(() => {
        fetch(import.meta.env.BASE_URL + "/courses.json", {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Erro ao buscar a lista de cursos");
                return res.json();
            })
            .then((data) => {
                setCursos(data);
                
                // Se o curso selecionado não existir dentro do JSON,
                // força a seleção do primeiro curso da lista.
                if (!data[nome]) {
                    const chaves = Object.keys(data);
                    if (chaves.length > 0) {
                        setNome(chaves[0]); // Puxa o primeiro curso válido
                    } else {
                        setIsLoading(false); // Destrava a tela se o JSON vier vazio
                    }
                }
            })
            .catch((error) => {
                console.error("Erro no fetch de courses.json:", error);
                setIsLoading(false); // Destrava a tela em caso de erro 404/500
            });
    }, [nome]);

    // Busca o curso selecionado
    useEffect(() => {
        if (!cursos[nome]) return;
        setIsLoading(true);
        setGroups({}); // Limpa a grade atual na troca de curso

        
        fetch(import.meta.env.BASE_URL + cursos[nome], {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw new Error("Erro na requisição do curso");
                return response.json();
            })
            .then((dat) => {
                const edicoesLista = dat[nome];
                if (!edicoesLista) {
                    console.error("Dados não encontrados para o curso selecionado.");
                    setIsLoading(false);
                    return;
                }

                const obj: Curso = { edicoes: edicoesLista, nome: nome };
                setData(obj);

                const anosDisponiveis = edicoesLista.map((e: any) => e.ano);
                setEdições(anosDisponiveis);

                // Só altera o ano se a grade nova não possuir o ano atualmente selecionado
                if (!anosDisponiveis.includes(ano)) {
                    setAno(anosDisponiveis[anosDisponiveis.length - 1]);
                }

                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Erro ao carregar curso:", error);
                setIsLoading(false);
            });

        localStorage.setItem("curso", JSON.stringify(nome));

        return () => {};
    }, [nome, cursos]);

    // Salva matérias cumpridas
    useEffect(() => {
        localStorage.setItem("cumpridas", JSON.stringify(cumpridas));
    }, [cumpridas]);

    // Processamento da grade, grupos e requisitos
    useEffect(() => {
        if (!data || !ano) return;

        const novoOnView: Record<string, boolean> = {};
        const novoRequisitos: Record<string, string[]> = {};
        const novoGroups: Record<string, Disciplina[]> = {};

        // Busca direto a edição correspondente ao ano
        const gradeAtual = data.edicoes.find((g) => g.ano === ano);

        if (gradeAtual && gradeAtual.materias) {
            Object.entries(gradeAtual.materias).forEach(([formato, materias]) => {
                novoGroups[formato] = materias;

                materias.forEach((disciplina) => {
                    const requisitosValidos = disciplina.Requisitos
                        ? disciplina.Requisitos.filter((req) => req.trim() !== "")
                        : [];

                    // Mapeia quem precisa dessa disciplina
                    if (requisitosValidos.length > 0) {
                        requisitosValidos.forEach((req) => {
                            if (!novoRequisitos[req]) {
                                novoRequisitos[req] = [disciplina.Codigo];
                            } else {
                                novoRequisitos[req].push(disciplina.Codigo);
                            }
                        });
                    }

                    // Verifica se a matéria deve aparecer (se é 1º Período ou tem pré-requisitos cumpridos)
                    if (formato === "1º Período" || formato === "1 Periodo" || requisitosValidos.length === 0) {
                        novoOnView[disciplina.Codigo] = true;
                    } else {
                        // O método 'every' checa se TODOS os requisitos retornam true
                        const validade = requisitosValidos.every((req) => cumpridas[req] === true);
                        novoOnView[disciplina.Codigo] = validade;
                    }
                });
            });
        }

        setOnView(novoOnView);
        setRequisitos(novoRequisitos);
        setGroups(novoGroups);
    }, [data, cumpridas, ano]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center bg-slate-900 text-slate-200 w-full h-screen font-bold text-xl">
                Carregando grade...
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center bg-slate-900 text-slate-200 min-h-screen">
            <div className="flex flex-col text-center font-bold flex-grow">
                <MenuEscolhaCurso
                    nome={nome}
                    setNome={setNome}
                    cursos={cursos}
                    edições={edições}
                    ano={ano}
                    setAno={setAno}
                />
                {Object.entries(groups).map(([nivel, objetos]) => {
                    return (
                        <ul
                            className="grid md:grid-cols-5 max-md:grid-cols-3 max-sm:grid-cols-3 sm:ml-5 sm:mr-5"
                            key={nivel}
                        >
                            {objetos.map((disciplina) => {
                                const validade = onView[disciplina.Codigo];

                                if (validade) {
                                    return (
                                        <Materia
                                            key={disciplina.Codigo}
                                            disciplina={disciplina}
                                            cumpridas={cumpridas}
                                            setCumpridas={setCumpridas}
                                            Requisitos={Requisitos}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </ul>
                    );
                })}
            </div>
            <div className="flex flex-col items-center justify-center w-full h-20 font-bold border-t-2 mt-5 border-emerald-600 text-md text-emerald-500">
                <a href="https://github.com/TuTheWeeb/prereq" className="underline">
                    https://github.com/TuTheWeeb/prereq
                </a>
                <p>Em caso de erros, entrar em contato:</p>
                <a href="mailto:eduardotcq@ic.ufrj.br" className="underline">
                    eduardotcq@ic.ufrj.br
                </a>
            </div>
        </div>
    );
}

export default App;