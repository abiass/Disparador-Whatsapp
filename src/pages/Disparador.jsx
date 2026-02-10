import React, { useState, useEffect } from "react";
import { Play, Pause, Trash2, Plus, Search, RefreshCw } from "lucide-react";

export default function Disparador() {
  const [campanhas, setCampanhas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
  });

  useEffect(() => {
    carregarCampanhas();
  }, [paginacao.pagina, filtro, busca]);

  const carregarCampanhas = async () => {
    try {
      setCarregando(true);
      const offset = (paginacao.pagina - 1) * paginacao.limite;
      const params = new URLSearchParams({
        limite: paginacao.limite,
        offset,
        ...(filtro && { status: filtro }),
        ...(busca && { busca }),
      });

      const response = await fetch(`/api/campanhas?${params}`);
      const data = await response.json();

      setCampanhas(data.campanhas);
      setPaginacao((prev) => ({ ...prev, total: data.total }));
    } catch (erro) {
      console.error("Erro ao carregar campanhas:", erro);
      alert("Erro ao carregar campanhas");
    } finally {
      setCarregando(false);
    }
  };

  const iniciarCampanha = async (id) => {
    try {
      const response = await fetch(`/api/campanhas/${id}/iniciar`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.sucesso) {
        alert("Campanha iniciada! [RUN]");
        carregarCampanhas();
      }
    } catch (erro) {
      console.error("Erro ao iniciar campanha:", erro);
      alert("Erro ao iniciar campanha");
    }
  };

  const pausarCampanha = async (id) => {
    try {
      const response = await fetch(`/api/campanhas/${id}/pausar`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.sucesso) {
        alert("Campanha pausada [⏸]");
        carregarCampanhas();
      }
    } catch (erro) {
      console.error("Erro ao pausar campanha:", erro);
      alert("Erro ao pausar campanha");
    }
  };

  const deletarCampanha = async (id) => {
    if (!confirm("Tem certeza que deseja deletar esta campanha?")) return;

    try {
      const response = await fetch(`/api/campanhas/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.sucesso) {
        alert("Campanha deletada [✓]");
        carregarCampanhas();
      }
    } catch (erro) {
      console.error("Erro ao deletar campanha:", erro);
      alert("Erro ao deletar campanha");
    }
  };

  const getStatusColor = (status) => {
    const cores = {
      rascunho: "bg-gray-100 text-gray-800",
      agendada: "bg-blue-100 text-blue-800",
      em_andamento: "bg-yellow-100 text-yellow-800",
      pausada: "bg-orange-100 text-orange-800",
      concluida: "bg-green-100 text-green-800",
      erro: "bg-red-100 text-red-800",
    };
    return cores[status] || "bg-gray-100 text-gray-800";
  };

  const getProgressoPercent = (campanha) => {
    const total = campanha.total_contatos || 1;
    return ((campanha.enviados || 0) / total) * 100;
  };

  const totalPaginas = Math.ceil(paginacao.total / paginacao.limite);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Disparador de Campanhas
            </h1>
            <p className="text-gray-600 mt-2">
              Gerenciamento inteligente de envios por WhatsApp
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/campanhas")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <Plus size={20} /> Nova Campanha
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar campanha..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginacao((prev) => ({ ...prev, pagina: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginacao((prev) => ({ ...prev, pagina: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="agendada">Agendada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="pausada">Pausada</option>
            <option value="concluida">Concluída</option>
            <option value="erro">Erro</option>
          </select>

          <button
            onClick={carregarCampanhas}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            disabled={carregando}
          >
            <RefreshCw size={20} /> Atualizar
          </button>
        </div>

        {/* Lista de Campanhas */}
        <div className="bg-white rounded-lg shadow">
          {carregando && campanhas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Carregando campanhas...</p>
            </div>
          ) : campanhas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhuma campanha encontrada</p>
              <button
                onClick={() => (window.location.href = "/criar-campanha")}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Criar primeira campanha →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {campanhas.map((campanha) => (
                <div
                  key={campanha.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {campanha.nome}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {campanha.descricao}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campanha.status)}`}
                    >
                      {campanha.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>
                        Progresso: {campanha.enviados}/{campanha.total_contatos}
                      </span>
                      <span>{getProgressoPercent(campanha).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${getProgressoPercent(campanha)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {campanha.total_contatos}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">[✓] Enviados</p>
                      <p className="text-lg font-bold text-green-600">
                        {campanha.enviados}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">[📬] Entregues</p>
                      <p className="text-lg font-bold text-blue-600">
                        {campanha.entregues}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">[✗] Falhas</p>
                      <p className="text-lg font-bold text-red-600">
                        {campanha.falhas}
                      </p>
                    </div>
                  </div>

                  {/* Data */}
                  <div className="text-xs text-gray-500 mb-4">
                    {campanha.data_inicio && (
                      <>
                        Iniciado em:{" "}
                        {new Date(campanha.data_inicio).toLocaleString("pt-BR")}
                      </>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    {campanha.status === "rascunho" ||
                    campanha.status === "pausada" ? (
                      <button
                        onClick={() => iniciarCampanha(campanha.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        <Play size={16} /> Iniciar
                      </button>
                    ) : campanha.status === "em_andamento" ? (
                      <button
                        onClick={() => pausarCampanha(campanha.id)}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        <Pause size={16} /> Pausar
                      </button>
                    ) : null}

                    <button
                      onClick={() => deletarCampanha(campanha.id)}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition ml-auto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() =>
                setPaginacao((prev) => ({
                  ...prev,
                  pagina: Math.max(1, prev.pagina - 1),
                }))
              }
              disabled={paginacao.pagina === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
              (pagina) => (
                <button
                  key={pagina}
                  onClick={() => setPaginacao((prev) => ({ ...prev, pagina }))}
                  className={`px-4 py-2 rounded-lg ${
                    paginacao.pagina === pagina
                      ? "bg-green-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pagina}
                </button>
              ),
            )}

            <button
              onClick={() =>
                setPaginacao((prev) => ({
                  ...prev,
                  pagina: Math.min(totalPaginas, prev.pagina + 1),
                }))
              }
              disabled={paginacao.pagina === totalPaginas}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
