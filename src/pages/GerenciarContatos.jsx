import React, { useState, useEffect } from "react";
import {
  Upload,
  Download,
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function GerenciarContatos() {
  const [contatos, setContatos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 20,
    total: 0,
  });
  const [arquivoUpload, setArquivoUpload] = useState(null);
  const [importandoArquivo, setImportandoArquivo] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState(null);
  const [validandoNumerosEmProgresso, setValidandoNumerosEmProgresso] =
    useState(false);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    carregarContatos();
  }, [paginacao.pagina, busca, filtro]);

  const carregarContatos = async () => {
    try {
      setCarregando(true);
      const offset = (paginacao.pagina - 1) * paginacao.limite;
      const params = new URLSearchParams({
        limite: paginacao.limite,
        offset,
        ...(busca && { busca }),
        ...(filtro && { filtro }),
      });

      const response = await fetch(`/api/contatos?${params}`);
      const data = await response.json();

      setContatos(data.contatos);
      setPaginacao((prev) => ({ ...prev, total: data.total }));
    } catch (erro) {
      console.error("Erro ao carregar contatos:", erro);
      alert("Erro ao carregar contatos");
    } finally {
      setCarregando(false);
    }
  };

  const handleUploadArquivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extensao = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(extensao)) {
      alert("Apenas arquivos CSV ou Excel são permitidos");
      return;
    }

    try {
      setImportandoArquivo(true);
      const formData = new FormData();
      formData.append("arquivo", file);

      const response = await fetch("/api/contatos/importar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.sucesso) {
        setResultadoImportacao(data.resultados);
        setArquivoUpload(null);
        carregarContatos();
        alert(
          `[✓] Importação concluída!\n[✓] Inseridos: ${data.resultados.inseridos}\n[↻] Atualizados: ${data.resultados.atualizados}\n[✗] Erros: ${data.resultados.erros.length}`,
        );
      }
    } catch (erro) {
      console.error("Erro ao importar:", erro);
      alert("Erro ao importar arquivo");
    } finally {
      setImportandoArquivo(false);
    }
  };

  const deletarContato = async (id) => {
    if (!confirm("Tem certeza que deseja deletar este contato?")) return;

    try {
      const response = await fetch(`/api/contatos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.sucesso) {
        alert("Contato deletado [✓]");
        carregarContatos();
      }
    } catch (erro) {
      console.error("Erro ao deletar:", erro);
      alert("Erro ao deletar contato");
    }
  };

  const validarNumeros = async () => {
    if (contatos.length === 0) {
      alert("Nenhum contato para validar");
      return;
    }

    try {
      setValidandoNumerosEmProgresso(true);
      const ids = contatos.map((c) => c.id);

      const response = await fetch("/api/contatos/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const data = await response.json();

      if (data.sucesso) {
        alert(
          `[✓] Validações Concluídas!\n[✓] Válidos: ${data.validados}\n[✗] Inválidos: ${data.invalidos}`,
        );
        carregarContatos();
      }
    } catch (erro) {
      console.error("Erro ao validar:", erro);
      alert("Erro ao validar números");
    } finally {
      setValidandoNumerosEmProgresso(false);
    }
  };

  const exportarCSV = async () => {
    try {
      const response = await fetch("/api/contatos/exportar/csv");
      const csv = await response.text();

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `contatos_${Date.now()}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Arquivo exportado com sucesso!");
    } catch (erro) {
      console.error("Erro ao exportar:", erro);
      alert("Erro ao exportar contatos");
    }
  };

  const totalPaginas = Math.ceil(paginacao.total / paginacao.limite);

  const downloadTemplate = async () => {
    try {
      console.log("Iniciando download do template...");
      const response = await fetch("/api/contatos/template/download");
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log("Convertendo para blob...");
      const blob = await response.blob();
      console.log("Blob criado com tamanho:", blob.size);

      const url = URL.createObjectURL(blob);
      console.log("URL do objeto criada:", url);

      const link = document.createElement("a");
      link.href = url;
      link.download = "template_contatos.csv";
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Esperar um pouco antes de remover
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("Download completado e limpeza feita");
      }, 100);
    } catch (erro) {
      console.error("Erro ao baixar template:", erro);
      alert(`Erro ao baixar template: ${erro.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Gerenciar Contatos
          </h1>
          <p className="text-gray-600 mt-2">
            Importe, valide e organize seus contatos
          </p>
        </div>

        {/* Cards de ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              📁 Importar Contatos
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleUploadArquivo}
                disabled={importandoArquivo}
                className="hidden"
                id="uploadArquivo"
              />
              <label htmlFor="uploadArquivo" className="cursor-pointer">
                <p className="text-sm font-medium text-gray-700">
                  {importandoArquivo
                    ? "Processando..."
                    : "Clique para selecionar CSV ou Excel"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ou arraste o arquivo
                </p>
              </label>
            </div>
            <button
              onClick={downloadTemplate}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Download size={16} /> Baixar Template
            </button>
          </div>

          {/* Validar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              ✅ Validar Números
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Verifica quais números existem no WhatsApp
            </p>
            <button
              onClick={validarNumeros}
              disabled={validandoNumerosEmProgresso || contatos.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {validandoNumerosEmProgresso
                ? "[⏳] Validando..."
                : `Validar ${contatos.length} Contatos`}
            </button>
          </div>

          {/* Exportar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">📥 Exportar</h3>
            <p className="text-sm text-gray-600 mb-4">
              Baixar contatos em arquivo CSV
            </p>
            <button
              onClick={exportarCSV}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Download size={18} /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Resultado de importação */}
        {resultadoImportacao && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-900 mb-3">
              [📊] Resultado da Importação
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-600 font-bold">[✓] Inseridos</p>
                <p className="text-2xl font-bold text-green-900">
                  {resultadoImportacao.inseridos}
                </p>
              </div>
              <div>
                <p className="text-blue-600 font-bold">[↻] Atualizados</p>
                <p className="text-2xl font-bold text-blue-900">
                  {resultadoImportacao.atualizados}
                </p>
              </div>
              <div>
                <p className="text-red-600 font-bold">[✗] Erros</p>
                <p className="text-2xl font-bold text-red-900">
                  {resultadoImportacao.erros.length}
                </p>
              </div>
            </div>

            {resultadoImportacao.erros.length > 0 && (
              <div className="mt-4 max-h-48 overflow-y-auto bg-white rounded p-4 border border-red-200">
                <h4 className="font-medium text-red-900 mb-2">
                  Erros encontrados:
                </h4>
                <ul className="text-sm space-y-1">
                  {resultadoImportacao.erros.slice(0, 10).map((erro, idx) => (
                    <li key={idx} className="text-red-700">
                      • {erro.mensagem}
                    </li>
                  ))}
                  {resultadoImportacao.erros.length > 10 && (
                    <li className="text-gray-600 italic">
                      ... e mais {resultadoImportacao.erros.length - 10} erros
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
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
            <option value="">Todos os Contatos</option>
            <option value="verificados">[✓] WhatsApp Verificado</option>
            <option value="nao_verificados">[!] Não Verificados</option>
          </select>
        </div>

        {/* Tabela de Contatos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {carregando && contatos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Carregando contatos...</p>
            </div>
          ) : contatos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhum contato encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      WhatsApp
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contatos.map((contato) => (
                    <tr key={contato.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {contato.nome || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contato.telefone_normalizado}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contato.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contato.empresa || "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {contato.whatsapp_verificado ? (
                          <CheckCircle
                            size={20}
                            className="mx-auto text-green-600"
                          />
                        ) : (
                          <AlertCircle
                            size={20}
                            className="mx-auto text-gray-300"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => deletarContato(contato.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

            {Array.from(
              { length: Math.min(totalPaginas, 5) },
              (_, i) => i + 1,
            ).map((pagina) => (
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
            ))}

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
