export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numero = telefone.replace(/\D/g, "");
  return `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
}
