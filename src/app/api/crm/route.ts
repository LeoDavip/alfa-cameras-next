export async function POST() {
  try {
    return Response.json({ message: "CRM sync triggered" });
  } catch (error) {
    console.error("POST /crm error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
