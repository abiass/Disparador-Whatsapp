import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, ChevronDown, Play, Download } from "lucide-react";
import { apiFetch } from '../utils/api';

export default function CriarCampanha() {
  const [formulario, setFormulario] = useState({
    nome: "",
    descricao: "",
    mensagem_template: "",
    contatos_selecionados: [],
    intervalo_min: 5,
    intervalo_max: 13,
    limite_por_hora: 30,
    agendar: false,
    data_agendamento: "",
  });

  const [contatos, setContatos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [filtroContatos, setFiltroContatos] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [contadorCaracteres, setContadorCaracteres] = useState(0);
  const [abaSeleção, setAbaSeleção] = useState("grupo"); // "grupo" ou "manual"

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);

      // Carregar grupos
      const gruposResponse = await apiFetch(
        "api/contatos/grupos-importacao/listar",
      );
      const gruposData = await gruposResponse.json();
      setGrupos(gruposData.grupos || []);

      // Carregar contatos
      const contatosResponse = await apiFetch("api/contatos?limite=1000");
      const contatosData = await contatosResponse.json();
      setContatos(contatosData.contatos || []);
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
      setGrupos([]);
      setContatos([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleSelecionarGrupo = async (grupoId) => {
    try {
      setCarregando(true);
      const response = await apiFetch(`api/contatos/contatos-grupo/${grupoId}`);
      const data = await response.json();

      // Adicionar todos os IDs do grupo aos contatos selecionados
      const novosSelecionados = [
        ...formulario.contatos_selecionados,
        ...data.contatos
          .map((c) => c.id)
          .filter((id) => !formulario.contatos_selecionados.includes(id)),
      ];

      setFormulario((prev) => ({
        ...prev,
        contatos_selecionados: novosSelecionados,
      }));

      alert(
        `✅ ${data.contatos.length} contatos do grupo "${data.grupo.nome_arquivo}" adicionados!`,
      );
    } catch (erro) {
      console.error("Erro ao selecionar grupo:", erro);
      alert("Erro ao selecionar grupo");
    } finally {
      setCarregando(false);
    }
  };

  const handleAdicionarContato = (contatoId) => {
    if (!formulario.contatos_selecionados.includes(contatoId)) {
      setFormulario((prev) => ({
        ...prev,
        contatos_selecionados: [...prev.contatos_selecionados, contatoId],
      }));
    }
  };

  const handleRemoverContato = (contatoId) => {
    setFormulario((prev) => ({
      ...prev,
      contatos_selecionados: prev.contatos_selecionados.filter(
        (id) => id !== contatoId,
      ),
    }));
  };

  const handleSubmit = async (e, iniciarAgora = false) => {
    e.preventDefault();

    if (!formulario.nome.trim()) {
      alert("Nome da campanha é obrigatório");
      return;
    }

    if (!formulario.mensagem_template.trim()) {
      alert("Digite a mensagem que será enviada");
      return;
    }

    if (formulario.mensagem_template.trim().length < 10) {
      alert("A mensagem deve ter pelo menos 10 caracteres");
      return;
    }

    if (formulario.contatos_selecionados.length === 0) {
      alert("Selecione pelo menos um contato");
      return;
    }

    if (formulario.agendar && !formulario.data_agendamento.trim()) {
      alert("Preencha a data e hora do agendamento");
      return;
    }

    try {
      setCarregando(true);

      const payload = {
        ...formulario,
        data_agendamento: formulario.data_agendamento.trim() || null,
        ...(iniciarAgora && { status: "em_andamento" }),
      };

      const response = await apiFetch("api/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.sucesso) {
        alert(`Campanha criada com sucesso! ${iniciarAgora ? "[RUN]" : "[Q]"}`);
        window.location.href = "/disparador";
      } else {
        alert(`Erro: ${data.erro}`);
      }
    } catch (erro) {
      console.error("Erro ao criar campanha:", erro);
      alert("Erro ao criar campanha");
    } finally {
      setCarregando(false);
    }
  };

  const contatosFiltrados = contatos.filter(
    (contato) =>
      (contato.nome &&
        contato.nome.toLowerCase().includes(filtroContatos.toLowerCase())) ||
      (contato.telefone_normalizado &&
        contato.telefone_normalizado.includes(filtroContatos)),
  );

  const contatosSelecionados = contatos.filter((c) =>
    formulario.contatos_selecionados.includes(c.id),
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Criar Campanha
        </h1>
        <p className="text-gray-600 mb-8">
          Configure uma nova campanha de disparo
        </p>

        {carregando ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="text-gray-600 mt-4">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            {/* Informações Básicas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informações Básicas
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Campanha *
                  </label>
                  <input
                    type="text"
                    required
                    value={formulario.nome}
                    onChange={(e) =>
                      setFormulario((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    placeholder="Ex: Campanha Prospecção Motoboys"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (Opcional)
                  </label>
                  <textarea
                    value={formulario.descricao}
                    onChange={(e) =>
                      setFormulario((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    placeholder="Descreva o objetivo da campanha..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Mensagem */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mensagem para Envio
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite a mensagem que será enviada *
                </label>
                <textarea
                  required
                  value={formulario.mensagem_template}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setFormulario((prev) => ({
                      ...prev,
                      mensagem_template: valor,
                    }));
                    setContadorCaracteres(valor.length);
                  }}
                  placeholder="Olá {nome}!\n\nEstou entrando em contato para...\n\nPodemos conversar?\n\nAguardo seu retorno!"
                  rows={8}
                  maxLength={3000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    💡 <strong>Dica:</strong> Use{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">
                      {"{nome}"}
                    </code>{" "}
                    para personalizar com o nome do contato
                  </p>
                  <p className="text-xs text-gray-600">
                    {contadorCaracteres}/3000 caracteres
                  </p>
                </div>
              </div>

              {formulario.mensagem_template && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Preview:</strong>
                  </p>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                    {formulario.mensagem_template.replace(
                      "{nome}",
                      "João Silva",
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Variáveis:{" "}
                    {formulario.mensagem_template.includes("{nome}")
                      ? "{nome}"
                      : "Nenhuma"}
                  </p>
                </div>
              )}
            </div>

            {/* Configurações */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Configurações de Envio
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalo Mínimo (seg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formulario.intervalo_min}
                    onChange={(e) =>
                      setFormulario((prev) => ({
                        ...prev,
                        intervalo_min: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalo Máximo (seg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formulario.intervalo_max}
                    onChange={(e) =>
                      setFormulario((prev) => ({
                        ...prev,
                        intervalo_max: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite por Hora
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={formulario.limite_por_hora}
                    onChange={(e) =>
                      setFormulario((prev) => ({
                        ...prev,
                        limite_por_hora: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Agendamento */}
              <div className="border-t pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formulario.agendar}
                    onChange={(e) =>
                      setFormulario((prev) => ({
                        ...prev,
                        agendar: e.target.checked,
                        data_agendamento: "",
                      }))
                    }
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Agendar Disparo
                  </span>
                </label>

                {formulario.agendar && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data e Hora
                    </label>
                    <input
                      type="datetime-local"
                      required={formulario.agendar}
                      value={formulario.data_agendamento}
                      onChange={(e) =>
                        setFormulario((prev) => ({
                          ...prev,
                          data_agendamento: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Seleção de Contatos - COM ABAS */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Selecionar Contatos ({formulario.contatos_selecionados.length})
              </h2>

              {/* ABAS */}
              <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setAbaSeleção("grupo")}
                  className={`pb-3 px-4 font-medium transition border-b-2 ${
                    abaSeleção === "grupo"
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📦 Por Base ({grupos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAbaSeleção("manual")}
                  className={`pb-3 px-4 font-medium transition border-b-2 ${
                    abaSeleção === "manual"
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🔍 Busca Manual
                </button>
              </div>

              {/* ABA: SELEÇÃO POR GRUPO */}
              {abaSeleção === "grupo" && (
                <div className="mb-6">
                  {grupos.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-600 mb-2">
                        Nenhuma base de contatos importada
                      </p>
                      <p className="text-sm text-gray-500">
                        Importe contatos em "Gerenciar Contatos" primeiro
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {grupos.map((grupo) => (
                        <div
                          key={grupo.id}
                          className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 truncate">
                                {grupo.nome_arquivo}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {grupo.total_contatos} contatos
                              </p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {grupo.contatos_atuais}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">
                            Importado em{" "}
                            {new Date(grupo.data_importacao).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSelecionarGrupo(grupo.id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
                          >
                            <Plus size={18} /> Adicionar Todos
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: SELEÇÃO MANUAL */}
              {abaSeleção === "manual" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Disponíveis */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Contatos Disponíveis
                    </h3>
                    <input
                      type="text"
                      placeholder="Buscar por nome ou telefone..."
                      value={filtroContatos}
                      onChange={(e) => setFiltroContatos(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
                    />

                    <div className="border border-gray-300 rounded-lg h-96 overflow-y-auto">
                      {contatosFiltrados
                        .filter(
                          (c) =>
                            !formulario.contatos_selecionados.includes(c.id),
                        )
                        .map((contato) => (
                          <div
                            key={contato.id}
                            className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                            onClick={() => handleAdicionarContato(contato.id)}
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {contato.nome}
                              </p>
                              <p className="text-xs text-gray-600">
                                {contato.telefone_normalizado}
                              </p>
                            </div>
                            <Plus size={18} className="text-gray-400" />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Selecionados */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Contatos Selecionados ({contatosSelecionados.length})
                    </h3>

                    <div className="border border-green-300 rounded-lg h-96 overflow-y-auto bg-green-50">
                      {contatosSelecionados.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <p>Nenhum contato selecionado</p>
                        </div>
                      ) : (
                        contatosSelecionados.map((contato) => (
                          <div
                            key={contato.id}
                            className="p-3 border-b border-green-200 flex justify-between items-center hover:bg-green-100"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {contato.nome}
                              </p>
                              <p className="text-xs text-gray-600">
                                {contato.telefone_normalizado}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoverContato(contato.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={carregando}
                onClick={(e) => handleSubmit(e, false)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
              >
                <Save size={20} /> Salvar como Rascunho
              </button>

              <button
                type="submit"
                disabled={
                  carregando || formulario.contatos_selecionados.length === 0
                }
                onClick={(e) => handleSubmit(e, true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
              >
                <Play size={20} /> Salvar Campanha
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "/disparador")}
                className="ml-auto px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
