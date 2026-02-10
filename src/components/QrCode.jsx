import React, { useEffect, useState } from "react";

function QrCodeWhatsapp() {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Carregando QR Code...");

  useEffect(() => {
    fetch("http://localhost:3001/api/whatsapp/qr")
      .then((res) => res.json())
      .then((data) => {
        setQr(data.qr || null);
        if (data.ready) {
          setStatus("ready");
          setMessage("WhatsApp conectado com sucesso.");
        } else if (data.qr) {
          setStatus("qr_available");
          setMessage("Escaneie o QR Code para conectar.");
        } else {
          setStatus("waiting_qr");
          setMessage(data.message || "Aguardando QR Code...");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro ao buscar QR Code. Verifique o servidor.");
      });
  }, []);

  return (
    <div>
      <h2>Escaneie o QR Code para conectar ao WhatsApp</h2>
      {qr ? (
        <img
          src={qr}
          alt="QR Code WhatsApp"
          style={{ width: 300, height: 300 }}
        />
      ) : (
        <p>{message}</p>
      )}
      {status === "ready" && <p>[✓] WhatsApp conectado.</p>}
    </div>
  );
}

export default QrCodeWhatsapp;
