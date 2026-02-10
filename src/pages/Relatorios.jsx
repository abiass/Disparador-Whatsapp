import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Calendar } from "lucide-react";

export default function Relatorios() {
  const [relatorioGeral, setRelatorioGeral] = useState(null);
  const [graficosData, setGraficosData] = useState({
    envios: [],
    status: [],
  });
  const [carregando, setCarregando] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const carregarRelatorios = async () => {
    try {
      setCarregando(true);

      // Carregara relatório geral
      const params = new URLSearchParams();
      if (dataInicio) params.append("dataInicio", dataInicio);
      if (dataFim) params.append("dataFim", dataFim);

      const response = await fetch(`/api/relatorios/geral?${params}`);
      const data = await response.json();
      setRelatorioGeral(data);

      // Carregargráficos
      const [enviosRes, statusRes] = await Promise.all([
        fetch("/api/relatorios/grafico/envios"),
        fetch("/api/relatorios/grafico/status"),
      ]);

      const envios = await enviosRes.json();
      const status = await statusRes.json();

      setGraficosData({
        envios: envios.dados,
        status: status.dados,
      });
    } catch (erro) {
      console.error("Erro ao carregar relatórios:", erro);
    } finally {
      setCarregando(false);
    }
  };

  const cores = ["#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

  if (!relatorioGeral) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">
            Análise completa de campanhas e envios
          </p>
        </div>

        {/* Filtros de Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={carregarRelatorios}
                disabled={carregando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
              >
                {carregando ? "Carregando..." : "Filtrar"}
              </button>

              <button
                onClick={() => {
                  setDataInicio("");
                  setDataFim("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total de Mensagens</p>
            <p className="text-3xl font-bold text-gray-900">
              {relatorioGeral.resumoGeral.total_mensagens.toLocaleString(
                "pt-BR",
              )}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Enviadas</p>
            <p className="text-3xl font-bold text-green-600">
              {relatorioGeral.resumoGeral.enviadas.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Entregues</p>
            <p className="text-3xl font-bold text-blue-600">
              {relatorioGeral.resumoGeral.entregues.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Lidas</p>
            <p className="text-3xl font-bold text-purple-600">
              {relatorioGeral.resumoGeral.lidas.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Falhas</p>
            <p className="text-3xl font-bold text-red-600">
              {relatorioGeral.resumoGeral.falhas.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Taxa de sucesso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Taxa de Entrega
            </h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-4xl font-bold text-green-600">
                  {relatorioGeral.resumoGeral.taxa_entrega}%
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {relatorioGeral.resumoGeral.entregues} de{" "}
                  {relatorioGeral.resumoGeral.total_mensagens} mensagens
                </p>
              </div>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <p className="text-3xl font-bold text-green-600">
                  {relatorioGeral.resumoGeral.taxa_entrega}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Taxa de Erro
            </h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-4xl font-bold text-red-600">
                  {relatorioGeral.resumoGeral.taxa_erro}%
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {relatorioGeral.resumoGeral.falhas} de{" "}
                  {relatorioGeral.resumoGeral.total_mensagens} mensagens
                </p>
              </div>
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <p className="text-3xl font-bold text-red-600">
                  {relatorioGeral.resumoGeral.taxa_erro}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Linha - Envios por dia */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Envios por Dia (30 dias)
            </h3>
            {graficosData.envios.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={graficosData.envios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="envios"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Sem dados para este período
              </p>
            )}
          </div>

          {/* Pie - Status de mensagens */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Distribuição por Status
            </h3>
            {graficosData.status.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={graficosData.status}
                    dataKey="total"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {graficosData.status.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={cores[index % cores.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Sem dados para este período
              </p>
            )}
          </div>
        </div>

        {/* Resumo de Campanhas */}
        {relatorioGeral.campanhas && relatorioGeral.campanhas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Resumo por Status de Campanha
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {relatorioGeral.campanhas.map((camp) => (
                <div
                  key={camp.status}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <p className="text-2xl font-bold text-gray-900">
                    {camp.total}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {camp.status.replace("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info geral */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total de Contatos</p>
              <p className="text-2xl font-bold text-blue-600">
                {relatorioGeral.contatos_totais.toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Campanhas Ativas</p>
              <p className="text-2xl font-bold text-blue-600">
                {relatorioGeral.campanhas?.find(
                  (c) => c.status === "em_andamento",
                )?.total || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Taxa Média de Entrega</p>
              <p className="text-2xl font-bold text-blue-600">
                {relatorioGeral.resumoGeral.taxa_entrega}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
