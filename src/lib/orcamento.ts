import { query, queryMany, queryOne } from "./db";
import { Orcamento, OrcamentoItem, OrcamentoStatus } from "@/types";

interface CreateOrcamentoInput {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  items: Omit<OrcamentoItem, "id" | "orcamento_id" | "total">[];
  vendedor_id: number;
}

export function calcularTotal(items: Pick<OrcamentoItem, "quantidade" | "valor_unitario">[]): number {
  return items.reduce((acc, item) => acc + item.quantidade * item.valor_unitario, 0);
}

export async function listarOrcamentos(filtros?: {
  status?: OrcamentoStatus;
  vendedor_id?: number;
}): Promise<Orcamento[]> {
  let sql = "SELECT * FROM orcamentos WHERE 1=1";
  const params: unknown[] = [];
  let idx = 1;

  if (filtros?.status) {
    sql += ` AND status = $${idx++}`;
    params.push(filtros.status);
  }
  if (filtros?.vendedor_id) {
    sql += ` AND vendedor_id = $${idx++}`;
    params.push(filtros.vendedor_id);
  }
  sql += " ORDER BY created_at DESC";

  return queryMany<Orcamento>(sql, params);
}

export async function buscarOrcamento(id: number): Promise<Orcamento | null> {
  const orcamento = await queryOne<Orcamento>("SELECT * FROM orcamentos WHERE id = $1", [id]);
  if (!orcamento) return null;

  const items = await queryMany<OrcamentoItem>(
    "SELECT * FROM orcamento_items WHERE orcamento_id = $1 ORDER BY id",
    [id]
  );
  orcamento.items = items;
  orcamento.total = calcularTotal(items);

  return orcamento;
}

export async function criarOrcamento(input: CreateOrcamentoInput): Promise<Orcamento> {
  const total = calcularTotal(input.items);

  const orcamento = await queryOne<Orcamento>(
    `INSERT INTO orcamentos (cliente_nome, cliente_telefone, cliente_endereco, total, vendedor_id, status)
     VALUES ($1, $2, $3, $4, $5, 'rascunho') RETURNING *`,
    [input.cliente_nome, input.cliente_telefone, input.cliente_endereco, total, input.vendedor_id]
  );

  if (!orcamento) throw new Error("Failed to create orcamento");

  for (const item of input.items) {
    await queryOne(
      `INSERT INTO orcamento_items (orcamento_id, descricao, quantidade, valor_unitario, total, tipo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orcamento.id, item.descricao, item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario, item.tipo]
    );
  }

  return buscarOrcamento(orcamento.id) as Promise<Orcamento>;
}

export async function atualizarStatus(id: number, status: OrcamentoStatus): Promise<Orcamento | null> {
  const fields: string[] = ["status = $1"];
  const params: unknown[] = [status];
  let idx = 2;

  if (status === "enviado") {
    fields.push(`enviado_em = $${idx++}`);
    params.push(new Date().toISOString());
  }
  if (status === "faturado") {
    fields.push(`faturado_em = $${idx++}`);
    params.push(new Date().toISOString());
  }

  params.push(id);
  await query(`UPDATE orcamentos SET ${fields.join(", ")} WHERE id = $${idx}`, params);
  return buscarOrcamento(id);
}
