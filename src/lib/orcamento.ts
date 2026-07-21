import { query, queryMany, queryOne } from "./db";
import { Orcamento, OrcamentoItem, OrcamentoStatus } from "@/types";

interface CreateOrcamentoInput {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  data?: string;
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
  let sql = "SELECT * FROM orcamentos WHERE deleted_at IS NULL";
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
  const orcamento = await queryOne<Orcamento>("SELECT * FROM orcamentos WHERE id = $1 AND deleted_at IS NULL", [id]);
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

  const subtotal_equip = input.items
    .filter(i => i.tipo === "produto")
    .reduce((s, i) => s + i.quantidade * i.valor_unitario, 0);
  const subtotal_servicos = input.items
    .filter(i => i.tipo === "servico")
    .reduce((s, i) => s + i.quantidade * i.valor_unitario, 0);

  const orcamento = await queryOne<Orcamento>(
    `INSERT INTO orcamentos (cliente_nome, cliente_telefone, cliente_endereco, data, total, subtotal_equip, subtotal_servicos, vendedor_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'rascunho') RETURNING *`,
    [input.cliente_nome, input.cliente_telefone, input.cliente_endereco, input.data || null, total, subtotal_equip, subtotal_servicos, input.vendedor_id]
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

  const timestampFields: Record<OrcamentoStatus, string> = {
    rascunho: "",
    enviado: "enviado_em",
    aprovado: "aprovado_em",
    recusado: "recusado_em",
    instalado: "instalado_em",
    faturado: "faturado_em",
    pago: "pago_em",
    vencido: "vencido_em",
  };

  const col = timestampFields[status];
  if (col) {
    fields.push(`${col} = $${idx++}`);
    params.push(new Date().toISOString());
  }

  params.push(id);
  await query(
    `UPDATE orcamentos SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} AND deleted_at IS NULL`,
    params
  );
  return buscarOrcamento(id);
}

interface UpdateOrcamentoInput {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  data?: string;
  items: Omit<OrcamentoItem, "id" | "orcamento_id" | "total">[];
}

export async function atualizarOrcamento(id: number, input: UpdateOrcamentoInput): Promise<Orcamento | null> {
  const total = calcularTotal(input.items);

  const subtotal_equip = input.items
    .filter(i => i.tipo === "produto")
    .reduce((s, i) => s + i.quantidade * i.valor_unitario, 0);
  const subtotal_servicos = input.items
    .filter(i => i.tipo === "servico")
    .reduce((s, i) => s + i.quantidade * i.valor_unitario, 0);

  await query(
    `UPDATE orcamentos SET cliente_nome = $1, cliente_telefone = $2, cliente_endereco = $3, data = $4, total = $5, subtotal_equip = $6, subtotal_servicos = $7, updated_at = NOW() WHERE id = $8`,
    [input.cliente_nome, input.cliente_telefone, input.cliente_endereco || null, input.data || null, total, subtotal_equip, subtotal_servicos, id]
  );

  await query("DELETE FROM orcamento_items WHERE orcamento_id = $1", [id]);

  for (const item of input.items) {
    await query(
      `INSERT INTO orcamento_items (orcamento_id, descricao, quantidade, valor_unitario, total, tipo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, item.descricao, item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario, item.tipo]
    );
  }

  return buscarOrcamento(id);
}

export async function excluirOrcamento(id: number): Promise<boolean> {
  const result = await query(
    "UPDATE orcamentos SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function listarOrcamentosDeletados(): Promise<Orcamento[]> {
  const orcamentos = await queryMany<Orcamento>(
    "SELECT * FROM orcamentos WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
  );
  for (const o of orcamentos) {
    o.items = await queryMany<OrcamentoItem>(
      "SELECT * FROM orcamento_items WHERE orcamento_id = $1 ORDER BY id",
      [o.id]
    );
  }
  return orcamentos;
}

export async function restaurarOrcamento(id: number): Promise<Orcamento | null> {
  await query("UPDATE orcamentos SET deleted_at = NULL WHERE id = $1", [id]);
  return buscarOrcamento(id);
}
