// Nova função de normalização flexível para comparação
function normalizarNumeroParaComparacao(numero) {
  if (!numero) return "";
  let n = numero.replace(/\D/g, "");
  // Remove zeros iniciais após o DDI 55
  if (n.startsWith("55")) {
    let parteLocal = n.substring(2);
    let parteLocalSemZeros = parteLocal.replace(/^0+/, "");
    return "55" + parteLocalSemZeros;
  }
  // Se não começa com 55, adiciona e remove zeros iniciais
  const semZeros = n.replace(/^0+/, "");
  return "55" + semZeros;
}

// Função de comparação flexível
function numerosCorrespondem(num1, num2) {
  const normalizado1 = normalizarNumeroParaComparacao(num1);
  const normalizado2 = normalizarNumeroParaComparacao(num2);
  if (normalizado1 === normalizado2) return true;
  // Comparação dos últimos 10-11 dígitos (ignorando possíveis dígitos extras)
  const ultimos1 = normalizado1.substring(
    Math.max(0, normalizado1.length - 11),
  );
  const ultimos2 = normalizado2.substring(
    Math.max(0, normalizado2.length - 11),
  );
  return ultimos1 === ultimos2;
}
import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal from "../components/Modal.jsx";
import { apiFetch } from '../utils/api';
import { getWsUrl } from '../config/api';

function Leads() {
  // Estado para leads e índice liberado
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalLead, setStatusModalLead] = useState(null);
  const [statusModalValue, setStatusModalValue] = useState("NOVO LEAD");
  const [obsPerdido, setObsPerdido] = useState("");
  const [leadIndex, setLeadIndex] = useState(0);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionLead, setSessionLead] = useState(null);
  const [obsViewOpen, setObsViewOpen] = useState(false);
  const [obsViewText, setObsViewText] = useState("");
  const [leadNotification, setLeadNotification] = useState(null);
  const leadNotificationTimeoutRef = useRef(null);
  // Ref para manter sessionLead sempre atualizado dentro do handler do WebSocket
  const sessionLeadRef = useRef(null);
  const userId = 1; // Troque para o id real do usuário logado

  // Buscar leads e índice liberado do backend
  useEffect(() => {
    apiFetch(`api/leads?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
        setLeadIndex(data.leadIndex || 0);
      });
  }, []);

  // Atualiza lista filtrada ao digitar ou ao carregar leads
  useEffect(() => {
    if (!search) {
      setFilteredLeads(leads);
      return;
    }
    // Função para remover acentos e espaços
    function normalizarTexto(txt) {
      return (txt || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^\u0000-\u007F]/g, "") // remove acentos
        .replace(/\s+/g, "");
    }
    const termo = normalizarTexto(search);
    setFilteredLeads(
      leads.filter((lead) => {
        const nomeMatch =
          lead.nome && normalizarTexto(lead.nome).includes(termo);
        const telefoneMatch =
          lead.telefone &&
          lead.telefone.replace(/\D/g, "").includes(search.replace(/\D/g, ""));
        const cnpjMatch =
          lead.cnpj &&
          lead.cnpj.replace(/\D/g, "").includes(search.replace(/\D/g, ""));
        return nomeMatch || telefoneMatch || cnpjMatch;
      }),
    );
  }, [search, leads]);

  // Checa status do WhatsApp ao carregar
  const [wppReady, setWppReady] = useState(false);
  const [error, setError] = useState(null);

  const isLeadLivre = (lead) => {
    const statusRaw = (lead?.status_lead || lead?.status || "")
      .toString()
      .toLowerCase();
    const statusNorm = statusRaw.replace(/\s+/g, "_");
    return ["finalizado", "perdido", "em_atendimento"].includes(statusNorm);
  };

  useEffect(() => {
    apiFetch("api/whatsapp/qr")
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setWppReady(!!data.ready);
        if (data.ready) {
          setError(null);
          return;
        }
        if (data.status === "qr_available") {
          setError("WhatsApp não está conectado. Escaneie o QR Code.");
          return;
        }
        if (data.status === "waiting_qr") {
          setError(data.message || "Aguardando QR Code...");
          return;
        }
        setError("WhatsApp não está conectado. Escaneie o QR Code.");
      })
      .catch(() => {
        setWppReady(false);
        setError("Erro ao verificar status do WhatsApp.");
      });
  }, []);

  // Função para abrir sessão WhatsApp e buscar histórico usando o telefone
  const openWhatsAppSession = async (lead, idx) => {
    setError(null);
    if (typeof idx !== "undefined" && idx > leadIndex && !isLeadLivre(lead)) {
      return;
    }
    if (!wppReady) {
      setError(
        error || "O WhatsApp não está conectado. Escaneie o QR Code primeiro.",
      );
      return;
    }
    const telefone = lead.telefone;
    await apiFetch("api/whatsapp/conversation/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: telefone }),
    }).catch((err) => console.error("Erro ao registrar conversa:", err));
    setSessionLead(lead);
    setSessionOpen(true);
    // Reseta o chat ao trocar de lead
    setChatHistory([]);
    await fetchChatHistory(telefone, true);
  };

  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const chatEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const wsRef = useRef(null);

  // Conectar ao WebSocket para receber mensagens em tempo real
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let connectionAttempt = 0;
    const maxRetries = 5;

    const connectWebSocket = () => {
      if (connectionAttempt >= maxRetries) {
        console.error("❌ Máximo de tentativas de reconexão atingido");
        return;
      }

      connectionAttempt++;
      const wsUrl = getWsUrl();
      console.log(
        `🔌 Tentativa ${connectionAttempt} de conexão WebSocket para: ${wsUrl}`,
      );

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("✅ WebSocket conectado com sucesso");
          connectionAttempt = 0; // Reset contador ao conectar
          wsRef.current = ws;
        };

        ws.onerror = (error) => {
          console.error("❌ Erro WebSocket:", error);
        };

        ws.onclose = () => {
          console.log("⚠️ WebSocket desconectado. Reconectando em 2s...");
          ws = null;
          wsRef.current = null;

          // Tentar reconectar
          reconnectTimeout = setTimeout(() => {
            connectWebSocket();
          }, 2000);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("❌ Erro ao criar WebSocket:", error);
        wsRef.current = null;

        reconnectTimeout = setTimeout(() => {
          connectWebSocket();
        }, 2000);
      }
    };

    // Conectar ao montar
    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws && ws.readyState === 1) {
        console.log("🔌 Fechando WebSocket ao desmontar");
        ws.close();
      }
    };
  }, []);

  // Handler estável para mensagens do WebSocket
  const handleWsMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("🟢 [WS] Mensagem recebida:", data);
      if (data.type === "lead_update" && data.lead) {
        setLeads((prev) => {
          const idx = prev.findIndex(
            (l) =>
              l.id === data.lead.id ||
              numerosCorrespondem(l.telefone, data.lead.telefone),
          );
          if (idx === -1) {
            return [data.lead, ...prev];
          }
          const next = [...prev];
          next[idx] = { ...next[idx], ...data.lead };
          return next;
        });
        setLeadNotification({
          id: data.lead.id || Date.now(),
          nome: data.lead.nome || "Lead",
          telefone: data.lead.telefone || "",
        });
        if (leadNotificationTimeoutRef.current) {
          clearTimeout(leadNotificationTimeoutRef.current);
        }
        leadNotificationTimeoutRef.current = setTimeout(() => {
          setLeadNotification(null);
        }, 4000);
        return;
      }
      const leadAtual = sessionLeadRef.current;
      console.log(
        "🟢 [WS] sessionLeadRef:",
        leadAtual?.nome,
        "|",
        leadAtual?.telefone,
      );
      if (!leadAtual) {
        console.log("⏭️ [WS] Ignorando mensagem - sem sessionLead ativo");
        return;
      }
      if (data.type !== "new_message") {
        console.log("⏭️ [WS] Ignorando - tipo de mensagem:", data.type);
        return;
      }
      // Normalização e comparação flexível
      const leadOriginal = leadAtual.telefone;
      const msgOriginal = data.numero;
      const leadNormalizado = normalizarNumeroParaComparacao(leadOriginal);
      const msgNormalizado = normalizarNumeroParaComparacao(msgOriginal);
      const corresponde = numerosCorrespondem(leadOriginal, msgOriginal);
      console.log("🔍 [WS] Comparação detalhada:", {
        leadOriginal,
        msgOriginal,
        leadNormalizado,
        msgNormalizado,
        corresponde,
      });
      // Se a mensagem é do lead atual, atualizar o chat
      if (corresponde) {
        console.log(
          "✨ [WS] MATCH FLEX! Nova mensagem recebida:",
          data.message,
        );
        if (data.message && data.message.fromMe === false) {
          // Mensagem do cliente: recarrega histórico do backend
          fetchChatHistory(leadAtual.telefone, false);
        } else {
          // Mensagem do atendente: lógica otimista
          setChatHistory((prev) => {
            const exists = prev.some(
              (m) =>
                m.body === data.message.body &&
                m.timestamp === data.message.timestamp &&
                m.fromMe === data.message.fromMe,
            );
            if (exists) return prev;
            return [...prev, data.message];
          });
          setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } else {
        console.log("❌ [WS] MISMATCH FLEX: Número não corresponde", {
          leadOriginal,
          msgOriginal,
          leadNormalizado,
          msgNormalizado,
        });
      }
    } catch (err) {
      console.error("❌ [WS] Erro ao processar mensagem WebSocket:", err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (leadNotificationTimeoutRef.current) {
        clearTimeout(leadNotificationTimeoutRef.current);
      }
    };
  }, []);

  // Configura o handler do WebSocket uma vez ao montar
  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.onmessage = handleWsMessage;
    console.log("🟢 [WS] Handler configurado");
    return () => {
      if (wsRef.current) wsRef.current.onmessage = null;
    };
  }, [handleWsMessage]);

  // Atualiza sessionLeadRef sempre que sessionLead mudar
  useEffect(() => {
    sessionLeadRef.current = sessionLead;
  }, [sessionLead]);

  // Função para resetar o intervalo de polling
  const resetPollingInterval = (whatsapp) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (sessionOpen && whatsapp) {
      pollingIntervalRef.current = setInterval(() => {
        fetchChatHistory(whatsapp, false);
      }, 10000);
    }
  };

  // Função para buscar histórico com estado de carregamento e atualizar id_whatsapp
  const fetchChatHistory = async (telefone, showLoading = true) => {
    if (showLoading) setIsLoadingMessages(true);
    try {
      const numero = telefone.replace(/\D/g, "");
      const res = await apiFetch(
        `api/whatsapp/chat/${numero}`,
      );
      const data = await res.json();
      // Atualiza o id_whatsapp do lead no banco se veio do backend
      if (
        data.id_whatsapp &&
        sessionLead &&
        sessionLead.id_whatsapp !== data.id_whatsapp
      ) {
        // Atualiza no backend
        await fetch("http://localhost:3001/api/leads/update-id-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sessionLead.id,
            id_whatsapp: data.id_whatsapp,
          }),
        });
        // Atualiza no frontend
        setSessionLead((prev) => ({ ...prev, id_whatsapp: data.id_whatsapp }));
        setLeads((prev) =>
          prev.map((l) =>
            l.id === sessionLead.id
              ? { ...l, id_whatsapp: data.id_whatsapp }
              : l,
          ),
        );
      }
      // Mesclar histórico local com o do backend
      setChatHistory((prev) => {
        const backendHistory = data.history || [];
        if (prev.length > 0) {
          const lastLocal = prev[prev.length - 1];
          const lastBackend = backendHistory[backendHistory.length - 1];
          if (
            lastLocal.fromMe &&
            (!lastBackend || lastLocal.body !== lastBackend.body)
          ) {
            return [...backendHistory, lastLocal];
          }
        }
        return backendHistory;
      });
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } finally {
      if (showLoading) setIsLoadingMessages(false);
      resetPollingInterval(telefone);
    }
  };

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!sessionLead || !message.trim()) return;
    const messageToSend = message;
    const newMessage = {
      fromMe: true,
      body: messageToSend,
      timestamp: Math.floor(Date.now() / 1000),
    };
    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
    // Enviar para o backend usando o telefone
    await apiFetch("api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero: sessionLead.telefone,
        mensagem: messageToSend,
      }),
    });
    // Libera próximo lead após envio da mensagem
    apiFetch("api/leads/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, next_index: leadIndex + 1 }),
    })
      .then((res) => res.json())
      .then(() => setLeadIndex(leadIndex + 1));
    // Recarregar histórico completo após envio (para sincronizar)
    setTimeout(() => fetchChatHistory(sessionLead.telefone, false), 1000);
  };

  // Função para fechar sessão e liberar próximo lead
  const closeWhatsAppSession = () => {
    // 📱 Notificar o backend que estamos fechando a conversa
    if (sessionLead) {
      const numero = sessionLead.whatsapp || sessionLead.telefone;
      if (numero) {
        apiFetch("api/whatsapp/conversation/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numero }),
        }).catch((err) => console.error("Erro ao fechar conversa:", err));
      }
    }
    setSessionOpen(false);
    setSessionLead(null);
    setMessage("");
    // Chama backend para liberar próximo lead
  };

  // Atualiza chat a cada 10s enquanto modal aberto
  useEffect(() => {
    if (!sessionOpen || !sessionLead) return;
    resetPollingInterval(sessionLead.whatsapp);
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [sessionOpen, sessionLead]);

  // Garantir que o handler do WebSocket está configurado quando a sessão abre
  useEffect(() => {
    if (!sessionOpen || !sessionLead) {
      console.log("⏭️ Sessão não aberta ou sem lead");
      return;
    }

    if (!wsRef.current) {
      console.error("❌ WebSocket não inicializado");
      return;
    }

    if (wsRef.current.readyState === 0) {
      console.log("⏳ WebSocket ainda está conectando, aguardando...");
      const timeout = setTimeout(() => {
        if (wsRef.current?.readyState === 1) {
          console.log("✅ WebSocket conectado, configurando handler");
          // Disparar o useEffect que configura o handler
          // Ele será disparado automaticamente pela mudança de sessionLead
        }
      }, 500);
      return () => clearTimeout(timeout);
    }

    if (wsRef.current.readyState !== 1) {
      console.error(
        "❌ WebSocket em estado inválido:",
        wsRef.current.readyState,
      );
      return;
    }

    console.log(
      "✅ Configurando handler WebSocket para a sessão de:",
      sessionLead.nome,
    );
  }, [sessionOpen, sessionLead]);

  return (
    <div className="min-h-screen w-full flex flex-col p-0 md:p-1">
      {leadNotification && (
        <div className="fixed right-4 top-4 z-50 rounded-xl bg-green-600 text-white shadow-xl px-4 py-3 text-sm flex items-center gap-2">
          <span className="font-bold">Novo lead respondeu</span>
          <span className="opacity-90">{leadNotification.nome}</span>
          {leadNotification.telefone && (
            <span className="opacity-80">({leadNotification.telefone})</span>
          )}
        </div>
      )}
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="bg-white/90 rounded-2xl shadow-2xl border border-blue-100 p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-blue-700">
                Lista de Leads
              </h2>
              <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                {leads.length} registros
              </span>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                placeholder="Pesquisar por telefone ou CNPJ"
                className="flex-1 min-w-[340px] max-w-[480px] px-4 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 placeholder-gray-400 transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              <button
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow hover:from-green-600 hover:to-blue-700 transition text-sm"
                onClick={(e) => {
                  e.preventDefault(); /* já filtra ao digitar */
                }}
                type="button"
              >
                Pesquisar
              </button>
            </div>
          </div>
          {/* Desktop View */}
          <div className="hidden md:flex flex-col flex-1 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto flex-1 rounded-lg shadow-md mt-2">
              <table className="min-w-full divide-y divide-blue-100 bg-white rounded-lg overflow-hidden">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-700">
                      CNPJ
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-700">
                      Nome
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-700">
                      Telefone
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-700">
                      Data/Hora
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-700">
                      WhatsApp
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-700">
                      Status Lead
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-50">
                  {filteredLeads.map((lead, idx) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 text-center">
                        {lead.cnpj}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 text-center">
                        {lead.nome}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 text-center">
                        {lead.telefone}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 text-center">
                        {lead.datahora
                          ? new Date(lead.datahora).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-center">
                        {lead.telefone ? (
                          <button
                            onClick={() => openWhatsAppSession(lead, idx)}
                            className={`text-green-600 hover:text-green-800 transition-colors ${idx > leadIndex && !isLeadLivre(lead) ? "opacity-40 cursor-not-allowed" : ""}`}
                            aria-label={`Abrir sessão WhatsApp de ${lead.nome}`}
                            disabled={idx > leadIndex && !isLeadLivre(lead)}
                          >
                            <svg
                              className="w-5 h-5 mx-auto"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-center">
                            {lead.status_lead || "NOVO LEAD"}
                          </span>
                          {lead.status_lead === "PERDIDO" &&
                            lead.obs_perdido && (
                              <button
                                className="p-1 rounded-full bg-blue-100 hover:bg-blue-200"
                                title="Visualizar observação"
                                onClick={() => {
                                  setObsViewText(lead.obs_perdido);
                                  setObsViewOpen(true);
                                }}
                              >
                                <svg
                                  className="w-4 h-4 text-blue-800"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            )}
                          <button
                            className="p-1 rounded-full bg-yellow-100 hover:bg-yellow-400"
                            title="Alterar status"
                            onClick={() => {
                              setStatusModalLead(lead);
                              setStatusModalValue(
                                lead.status_lead || "NOVO LEAD",
                              );
                              setObsPerdido(lead.obs_perdido || "");
                              setStatusModalOpen(true);
                            }}
                          >
                            <svg
                              className="w-4 h-4 text-yellow-800"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97L7.5 18.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2"
                              />
                            </svg>
                          </button>
                        </div>
                        {/* Modal de visualização da observação do perdido */}
                        <Modal
                          open={obsViewOpen}
                          onClose={() => setObsViewOpen(false)}
                          title="Observação do Perdido"
                        >
                          <div className="p-4 text-gray-800 min-w-[220px] max-w-[320px] break-words">
                            {obsViewText || (
                              <span className="text-gray-400">
                                Sem observação.
                              </span>
                            )}
                          </div>
                        </Modal>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Modal para alterar status do lead - fora do <tr> */}
              <Modal
                open={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                title="Alterar status do lead"
              >
                {statusModalLead && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="w-full">
                      <label className="block text-sm font-medium mb-2">
                        Status atual:
                      </label>
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={statusModalValue}
                        onChange={(e) => setStatusModalValue(e.target.value)}
                      >
                        <option value="NOVO LEAD">NOVO LEAD</option>
                        <option value="EM ATENDIMENTO">EM ATENDIMENTO</option>
                        <option value="PERDIDO">PERDIDO</option>
                        <option value="FINALIZADO">FINALIZADO</option>
                      </select>
                    </div>
                    {statusModalValue === "PERDIDO" && (
                      <div className="w-full">
                        <label className="block text-sm font-medium mb-2">
                          Observação do motivo (opcional):
                        </label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          value={obsPerdido}
                          onChange={(e) => setObsPerdido(e.target.value)}
                          placeholder="Descreva o motivo do perdido..."
                        />
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-4 py-2 rounded bg-green-600 text-white"
                        onClick={async () => {
                          try {
                            await apiFetch(
                              `api/leads/${statusModalLead.id}/status`,
                              {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  status_lead: statusModalValue,
                                  obs_perdido:
                                    statusModalValue === "PERDIDO"
                                      ? obsPerdido
                                      : undefined,
                                }),
                              },
                            );
                            setLeads((prev) =>
                              prev.map((l) =>
                                l.id === statusModalLead.id
                                  ? {
                                      ...l,
                                      status_lead: statusModalValue,
                                      obs_perdido:
                                        statusModalValue === "PERDIDO"
                                          ? obsPerdido
                                          : undefined,
                                    }
                                  : l,
                              ),
                            );
                            setStatusModalOpen(false);
                          } catch (err) {
                            alert("Erro ao atualizar status do lead");
                          }
                        }}
                      >
                        Salvar
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-gray-200"
                        onClick={() => setStatusModalOpen(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          </div>

          {/* Mobile View - Card Layout */}
          <div className="md:hidden overflow-y-auto flex-1">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Status Lead
                    </p>
                    <span className="text-gray-900 mr-2">
                      {lead.status_lead || "NOVO LEAD"}
                    </span>
                    <button
                      className="ml-1 p-1 rounded-full bg-yellow-300 hover:bg-yellow-400"
                      title="Alterar status"
                      onClick={() => {
                        setStatusModalLead(lead);
                        setStatusModalValue(lead.status_lead || "NOVO LEAD");
                        setStatusModalOpen(true);
                      }}
                    >
                      <svg
                        className="w-4 h-4 text-yellow-800"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97L7.5 18.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2"
                        />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      CNPJ
                    </p>
                    <p className="font-medium text-gray-900">{lead.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Nome
                    </p>
                    <p className="font-medium text-gray-900">{lead.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Telefone
                    </p>
                    <p className="text-gray-900">{lead.telefone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </p>
                    <p className="text-gray-500">{lead.datahora}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      WhatsApp
                    </p>
                    {lead.whatsapp ? (
                      <button
                        onClick={() => openWhatsAppSession(lead)}
                        className="text-green-600 hover:text-green-800 transition-colors mt-2"
                        aria-label={`Abrir sessão WhatsApp de ${lead.nome}`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="text-red-600 font-bold p-2">{error}</div>}
          <Modal
            open={sessionOpen}
            onClose={closeWhatsAppSession}
            title={`Sessão WhatsApp${sessionLead && sessionLead.nome ? ` — ${sessionLead.nome}` : ""}`}
          >
            {sessionLead &&
            sessionLead.nome &&
            (sessionLead.whatsapp || sessionLead.telefone) ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Sessão de conversa com <strong>{sessionLead.nome}</strong> (
                  {sessionLead.whatsapp || sessionLead.telefone}).
                </p>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Status Lead
                  </p>
                  <p className="text-gray-900">
                    {sessionLead.status_lead || "—"}
                  </p>
                </div>
                <div className="bg-[#ece5dd] rounded-lg p-4 h-96 overflow-auto border flex flex-col">
                  {/* Indicador visual do status do WebSocket */}
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${wsRef.current && wsRef.current.readyState === 1 ? "bg-green-500" : "bg-red-500"}`}
                    ></span>
                    <span className="text-xs text-gray-500">
                      WebSocket:{" "}
                      {wsRef.current && wsRef.current.readyState === 1
                        ? "Conectado"
                        : "Desconectado"}
                    </span>
                  </div>
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="mb-4">
                          <svg
                            className="animate-spin h-8 w-8 text-green-600 mx-auto"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          Carregando mensagens...
                        </p>
                      </div>
                    </div>
                  ) : chatHistory.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Nenhuma mensagem ainda.
                    </p>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-${msg.fromMe ? "end" : "start"} mb-2`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-sm whitespace-pre-line ${msg.fromMe ? "bg-[#dcf8c6] text-gray-800" : "bg-white text-gray-900"}`}
                          style={{
                            borderBottomRightRadius: msg.fromMe ? 0 : "0.75rem",
                            borderBottomLeftRadius: !msg.fromMe ? 0 : "0.75rem",
                          }}
                        >
                          {msg.type === "image" && msg.mediaData ? (
                            <img
                              src={`data:${msg.mimetype};base64,${msg.mediaData}`}
                              alt={msg.body || "imagem"}
                              className="max-w-[220px] max-h-[220px] mb-1 rounded"
                            />
                          ) : msg.type === "audio" && msg.mediaData ? (
                            <audio controls className="mb-1">
                              <source
                                src={`data:${msg.mimetype};base64,${msg.mediaData}`}
                                type={msg.mimetype}
                              />
                              Seu navegador não suporta áudio.
                            </audio>
                          ) : null}
                          {msg.body}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {msg.timestamp
                            ? new Date(msg.timestamp * 1000).toLocaleString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : ""}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <input
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-sm border bg-green-600 text-white"
                  >
                    Enviar
                  </button>
                </form>
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeWhatsAppSession}
                    className="px-4 py-2 rounded-md text-sm border"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-red-600 font-bold text-center mb-4">
                  Não foi possível abrir a conversa.
                  <br />
                  Verifique se o lead está selecionado corretamente e se os
                  dados estão completos.
                </p>
                <button
                  onClick={closeWhatsAppSession}
                  className="px-4 py-2 rounded-md text-sm border"
                >
                  Fechar
                </button>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Leads;
