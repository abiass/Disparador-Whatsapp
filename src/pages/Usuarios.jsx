import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";

const API_URL = "http://localhost:3001/api/usuarios";

const tiposUsuario = ["admin", "supervisor", "consultor"];
const statusUsuario = ["ativo", "inativo"];

function Usuarios() {
  // Controle do modal de confirmação
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    senha: "",
    tipo_usuario: "consultor",
    status: "ativo",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Listar usuários
  const fetchUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // Verifica se a resposta é ok e se data é um array
      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar usuários");
      }

      if (Array.isArray(data)) {
        setUsuarios(data);
      } else {
        setUsuarios([]);
        setError("Resposta inválida do servidor");
      }
    } catch (err) {
      setUsuarios([]); // Garante que sempre seja um array
      setError(err.message || "Erro ao buscar usuários");
      console.error("Erro ao buscar usuários:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Cadastrar ou editar usuário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !form.nome ||
      (!editId && !form.senha) ||
      !form.tipo_usuario ||
      !form.status
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const body = { ...form };
      if (!editId) delete body.id;
      if (editId && !form.senha) delete body.senha;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao salvar usuário");
      setForm({
        nome: "",
        senha: "",
        tipo_usuario: "consultor",
        status: "ativo",
      });
      setEditId(null);
      fetchUsuarios();
    } catch {
      setError("Erro ao salvar usuário");
    }
    setLoading(false);
  };

  // Deletar usuário
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Erro ao deletar usuário");
      fetchUsuarios();
    } catch {
      setError("Erro ao deletar usuário");
    }
    setLoading(false);
    setModalOpen(false);
    setUsuarioParaDeletar(null);
  };

  // Preencher formulário para edição
  const handleEdit = (user) => {
    setForm({
      nome: user.nome,
      senha: "",
      tipo_usuario: user.tipo_usuario,
      status: user.status,
    });
    setEditId(user.id);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-3xl bg-white/90 rounded-2xl shadow-2xl border border-blue-100 p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          Usuários do Sistema
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
          {error && (
            <div className="text-red-600 text-center font-medium animate-pulse mb-2">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Nome*
              </label>
              <input
                type="text"
                className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-blue-50"
                value={form.nome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nome: e.target.value }))
                }
                required
              />
            </div>
            {/* Campo Email removido */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Senha{editId ? " (nova)" : "*"}
              </label>
              <input
                type="password"
                className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-blue-50"
                value={form.senha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, senha: e.target.value }))
                }
                required={!editId}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Tipo*
              </label>
              <select
                className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-blue-50"
                value={form.tipo_usuario}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tipo_usuario: e.target.value }))
                }
                required
              >
                {tiposUsuario.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Status*
              </label>
              <select
                className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-blue-50"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                required
              >
                {statusUsuario.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            {/* Campo Telas Liberadas removido */}
          </div>
          <div className="flex gap-2 mt-2 justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-6 rounded-lg font-bold shadow hover:from-green-600 hover:to-blue-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {editId ? "Salvar Edição" : "Cadastrar"}
            </button>
            {editId && (
              <button
                type="button"
                className="bg-gray-200 py-2 px-6 rounded-lg font-bold"
                onClick={() => {
                  setEditId(null);
                  setForm({
                    nome: "",
                    senha: "",
                    tipo_usuario: "consultor",
                    status: "ativo",
                  });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-100 bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-blue-700">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-blue-700">
                  Nome
                </th>
                {/* <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-blue-700">Email</th> */}
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-blue-700">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-blue-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-blue-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-50">
              {usuarios.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {user.nome}
                  </td>
                  {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.email}</td> */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {user.tipo_usuario}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {user.status}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm flex gap-2">
                    <button
                      className="bg-yellow-100 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded shadow"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97L7.5 18.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2"
                        />
                      </svg>
                    </button>
                    <button
                      className="bg-red-100 hover:bg-red-300 text-red-800 px-3 py-1 rounded shadow"
                      onClick={() => {
                        setUsuarioParaDeletar(user);
                        setModalOpen(true);
                      }}
                      title="Deletar"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Modal de confirmação de exclusão */}
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setUsuarioParaDeletar(null);
          }}
          title="Confirmar exclusão"
        >
          <div className="flex flex-col gap-4 items-center justify-center">
            <p className="text-lg text-gray-800">
              Deseja realmente deletar o usuário{" "}
              <span className="font-bold">{usuarioParaDeletar?.nome}</span>?
            </p>
            <div className="flex gap-4 justify-center mt-2">
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-red-700 transition"
                onClick={() => handleDelete(usuarioParaDeletar.id)}
                disabled={loading}
              >
                Deletar
              </button>
              <button
                className="bg-gray-200 px-6 py-2 rounded-lg font-bold"
                onClick={() => {
                  setModalOpen(false);
                  setUsuarioParaDeletar(null);
                }}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Usuarios;
