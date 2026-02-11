# Script para criar usuario admin no Supabase

$body = @{
    nome = "admin"
    senha = "admin123"
    status = "ativo"
    tipo_usuario = "admin"
    telas_liberadas = "[]"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/usuarios" -Method POST -ContentType "application/json" -Body $body

Write-Host "Usuario criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciais:" -ForegroundColor Cyan
Write-Host "   Usuario: admin" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Acesse: http://localhost:5173" -ForegroundColor Yellow
