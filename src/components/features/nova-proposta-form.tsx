"use client";
import { useState, useMemo } from "react";
import { Produto, OrcamentoItem } from "@/types";
import { ProdutoBusca } from "./produto-busca";

interface NovaPropostaFormProps {
  produtos: Produto[];
  orcamentoId?: number;
  initialData?: {
    cliente_nome: string;
    cliente_telefone: string;
    data?: string;
    items: OrcamentoItem[];
  };
}

const NAO_CAMERA = ["dvr", "nvr", "hd ", "cartão", "microsd", "material de instalação", "instalação de câmera", "configuração do sistema"];

function parseInitialItems(items: OrcamentoItem[]) {
  let gravadorNome = "";
  let gravadorPreco = 0;
  let hdNome = "";
  let hdPreco = 0;
  let materialNome = "";
  let materialPreco = 0;
  let configNome = "";
  let configPreco = 0;
  let dificuldade: "" | "padrao" | "dificil" = "";
  let deslocamento = 0;
  const cameraItems: OrcamentoItem[] = [];

  for (const item of items) {
    const d = item.descricao.toLowerCase();

    if (d.includes("dvr") || d.includes("nvr")) {
      gravadorNome = item.descricao;
      gravadorPreco = item.valor_unitario;
    } else if (d.includes("hd") || d.includes("cartão") || d.includes("microsd")) {
      hdNome = item.descricao;
      hdPreco = item.valor_unitario;
    } else if (d.includes("material de instalação")) {
      materialNome = item.descricao;
      materialPreco = item.valor_unitario;
    } else if (d.includes("configuração do sistema") || d.includes("instalação de câmera")) {
      configNome = item.descricao;
      configPreco = item.valor_unitario;
    } else if (d.includes("instalação (padrão)")) {
      dificuldade = "padrao";
    } else if (d.includes("instalação (difícil)")) {
      dificuldade = "dificil";
    } else if (d.includes("taxa de deslocamento")) {
      deslocamento = item.valor_unitario;
    } else if (item.tipo === "produto" && !NAO_CAMERA.some(k => d.includes(k))) {
      cameraItems.push(item);
    }
  }

  return { gravadorNome, gravadorPreco, hdNome, hdPreco, materialNome, materialPreco, configNome, configPreco, dificuldade, deslocamento, cameraItems };
}

export function NovaPropostaForm({ produtos, orcamentoId, initialData }: NovaPropostaFormProps) {
  const parsed = useMemo(() => parseInitialItems(initialData?.items ?? []), [initialData?.items]);

  const [clienteNome, setClienteNome] = useState(initialData?.cliente_nome ?? "");
  const [clienteTelefone, setClienteTelefone] = useState(initialData?.cliente_telefone ?? "");
  const [data, setData] = useState(initialData?.data ?? new Date().toISOString().split("T")[0]);

  const [cameraItems, setCameraItems] = useState<OrcamentoItem[]>(parsed.cameraItems);
  const [gravadorNome, setGravadorNome] = useState(parsed.gravadorNome);
  const [gravadorPreco, setGravadorPreco] = useState(parsed.gravadorPreco);
  const [hdNome, setHdNome] = useState(parsed.hdNome);
  const [hdPreco, setHdPreco] = useState(parsed.hdPreco);
  const [materialNome, setMaterialNome] = useState(parsed.materialNome);
  const [materialPreco, setMaterialPreco] = useState(parsed.materialPreco);
  const [configNome, setConfigNome] = useState(parsed.configNome);
  const [configPreco, setConfigPreco] = useState(parsed.configPreco);
  const [dificuldade, setDificuldade] = useState<"" | "padrao" | "dificil">(parsed.dificuldade);
  const [deslocamento, setDeslocamento] = useState(parsed.deslocamento);

  const [erros, setErros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function capitalizar() {
    setClienteNome(prev => prev.replace(/\b\w/g, l => l.toUpperCase()));
  }

  const descontoDeslocamento = 0;

  const cameras = produtos.filter(p =>
    !NAO_CAMERA.some(k => p.nome.toLowerCase().includes(k))
  );

  const produtosParaBusca = cameras.length > 0 ? cameras : produtos;

  function addCamera(produto: Produto) {
    setCameraItems([
      ...cameraItems,
      {
        descricao: produto.nome,
        quantidade: 1,
        valor_unitario: Number(produto.preco),
        total: Number(produto.preco),
        tipo: "produto",
      },
    ]);
  }

  function updateCameraQtd(index: number, qtd: number) {
    const newItems = [...cameraItems];
    newItems[index].quantidade = qtd;
    newItems[index].total = qtd * newItems[index].valor_unitario;
    setCameraItems(newItems);
  }

  function removeCamera(index: number) {
    setCameraItems(cameraItems.filter((_, i) => i !== index));
  }

  function buildItems(): OrcamentoItem[] {
    const items: OrcamentoItem[] = [...cameraItems];

    if (gravadorNome && gravadorPreco > 0) {
      items.push({ descricao: gravadorNome, quantidade: 1, valor_unitario: gravadorPreco, total: gravadorPreco, tipo: "produto" });
    }
    if (hdNome && hdPreco > 0) {
      items.push({ descricao: hdNome, quantidade: 1, valor_unitario: hdPreco, total: hdPreco, tipo: "produto" });
    }
    if (materialNome && materialPreco > 0) {
      items.push({ descricao: materialNome, quantidade: 1, valor_unitario: materialPreco, total: materialPreco, tipo: "servico" });
    }
    if (configNome && configPreco > 0) {
      items.push({ descricao: configNome, quantidade: 1, valor_unitario: configPreco, total: configPreco, tipo: "servico" });
    }

    if (dificuldade) {
      const totalCameras = cameraItems.reduce((s, i) => s + i.quantidade, 0) || 1;
      const precoPorCamera = dificuldade === "padrao" ? 100 : 150;
      const label = dificuldade === "padrao" ? "Instalação (padrão)" : "Instalação (difícil)";
      items.push({ descricao: label, quantidade: totalCameras, valor_unitario: precoPorCamera, total: totalCameras * precoPorCamera, tipo: "servico" });
    }

    if (deslocamento > 0) {
      const desc = descontoDeslocamento;
      const valorFinal = deslocamento * (1 - desc);
      const nomeDesc = desc > 0
        ? `Taxa de deslocamento (${Math.round(desc * 100)}% off)`
        : "Taxa de deslocamento";
      items.push({ descricao: nomeDesc, quantidade: 1, valor_unitario: valorFinal, total: valorFinal, tipo: "servico" });
    }

    return items;
  }

  function validar(): string[] {
    const erros: string[] = [];
    if (!clienteNome.trim()) erros.push("Preencha o nome do cliente");
    if (!data) erros.push("Selecione uma data");
    if (cameraItems.length === 0) erros.push("Adicione pelo menos uma câmera");
    const tel = clienteTelefone.replace(/\D/g, "");
    if (tel.length > 0 && tel.length < 10) erros.push("Telefone deve ter pelo menos 10 dígitos (incluindo DDD)");
    return erros;
  }

  const items = buildItems();
  const subtotalEquip = items.filter(i => i.tipo === "produto").reduce((s, i) => s + i.total, 0);
  const subtotalServicos = items.filter(i => i.tipo === "servico").reduce((s, i) => s + i.total, 0);
  const total = subtotalEquip + subtotalServicos;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validar();
    if (validationErrors.length > 0) {
      setErros(validationErrors);
      return;
    }
    setErros([]);
    setLoading(true);

    try {
      const method = orcamentoId ? "PUT" : "POST";
      const url = orcamentoId ? `/api/orcamentos/${orcamentoId}` : "/api/orcamentos";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_nome: clienteNome.trim(),
          cliente_telefone: clienteTelefone.replace(/\D/g, ""),
          data,
          items: items.map(({ descricao, quantidade, valor_unitario, tipo }) => ({
            descricao, quantidade, valor_unitario, tipo,
          })),
        }),
      });

      if (!res.ok) throw new Error("Falha ao salvar");
      window.location.assign(orcamentoId ? `/orcamentos/${orcamentoId}` : "/orcamentos");
    } catch {
      alert("Erro ao salvar orçamento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {erros.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          {erros.map((e, i) => (
            <p key={i} className="text-red-600 text-sm font-medium">{e}</p>
          ))}
        </div>
      )}

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">1</span>
          Dados do Cliente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-primary mb-1">Cliente</label>
            <input
              value={clienteNome}
              onChange={e => setClienteNome(e.target.value)}
              onBlur={capitalizar}
              placeholder="Nome do cliente"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary mb-1">WhatsApp</label>
            <input
              value={clienteTelefone}
              onChange={e => setClienteTelefone(e.target.value)}
              placeholder="11988887777"
              maxLength={11}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">2</span>
          Câmeras
        </h3>

        <ProdutoBusca produtos={produtosParaBusca} onSelect={addCamera} />

        {cameraItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cameraItems.map((item, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: "var(--secondary, #5E59D6)" }}
              >
                <span className="max-w-[200px] truncate">{item.descricao}</span>
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={e => updateCameraQtd(i, Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="w-12 px-1 py-0.5 rounded text-center text-gray-900 bg-white/90 text-sm font-bold"
                />
                <span className="min-w-[70px] text-right">R$ {item.total.toFixed(2)}</span>
                <button type="button" onClick={() => removeCamera(i)}
                  className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-sm hover:bg-white/40"
                >×</button>
              </div>
            ))}
          </div>
        )}
        {cameraItems.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Nenhuma câmera adicionada.</p>
        )}
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">3</span>
          Gravador e Armazenamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-1">Gravador (DVR/NVR)</label>
            <input
              value={gravadorNome}
              onChange={e => setGravadorNome(e.target.value)}
              placeholder="Ex: DVR Intelbras 8 canais"
              className="w-full px-3 py-2 border rounded-md"
            />
            {gravadorNome && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Preço:</span>
                <input
                  type="number"
                  value={gravadorPreco}
                  onChange={e => setGravadorPreco(Number(e.target.value))}
                  min={0}
                  step={0.1}
                  className="w-32 px-2 py-1 border rounded-md text-sm"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-primary mb-1">HD / Armazenamento</label>
            <input
              value={hdNome}
              onChange={e => setHdNome(e.target.value)}
              placeholder="Ex: HD 1TB"
              className="w-full px-3 py-2 border rounded-md"
            />
            {hdNome && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Preço:</span>
                <input
                  type="number"
                  value={hdPreco}
                  onChange={e => setHdPreco(Number(e.target.value))}
                  min={0}
                  step={0.1}
                  className="w-32 px-2 py-1 border rounded-md text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">4</span>
          Serviços
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-1">Material de Instalação</label>
            <input
              value={materialNome}
              onChange={e => setMaterialNome(e.target.value)}
              placeholder="Ex: Kit de cabos e conectores"
              className="w-full px-3 py-2 border rounded-md"
            />
            {materialNome && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Preço:</span>
                <input
                  type="number"
                  value={materialPreco}
                  onChange={e => setMaterialPreco(Number(e.target.value))}
                  min={0}
                  step={0.1}
                  className="w-32 px-2 py-1 border rounded-md text-sm"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-primary mb-1">Configuração do Sistema</label>
            <input
              value={configNome}
              onChange={e => setConfigNome(e.target.value)}
              placeholder="Ex: Configuração de rede e app"
              className="w-full px-3 py-2 border rounded-md"
            />
            {configNome && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Preço:</span>
                <input
                  type="number"
                  value={configPreco}
                  onChange={e => setConfigPreco(Number(e.target.value))}
                  min={0}
                  step={0.1}
                  className="w-32 px-2 py-1 border rounded-md text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-1">Dificuldade da Instalação</label>
            <select
              value={dificuldade}
              onChange={e => setDificuldade(e.target.value as "" | "padrao" | "dificil")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Não adicionar instalação</option>
              <option value="padrao">Padrão — R$ 100/câmera</option>
              <option value="dificil">Difícil — R$ 150/câmera</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-primary mb-1">Deslocamento (R$)</label>
            <input
              type="number"
              value={deslocamento}
              onChange={e => setDeslocamento(Number(e.target.value))}
              min={0}
              step={10}
              placeholder="0 = não cobrar"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Resumo do Orçamento</h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qtd</th>
                <th className="text-right py-2">Valor Unit.</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{item.descricao}</td>
                  <td className="text-center py-2">{item.quantidade}</td>
                  <td className="text-right py-2">R$ {item.valor_unitario.toFixed(2)}</td>
                  <td className="text-right py-2">R$ {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end gap-8 text-sm">
            <div>
              <span className="text-gray-500">Equipamentos:</span>
              <span className="font-bold ml-2">R$ {subtotalEquip.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">Serviços:</span>
              <span className="font-bold ml-2">R$ {subtotalServicos.toFixed(2)}</span>
            </div>
            <div className="text-lg">
              <span className="text-gray-700">Total:</span>
              <span className="font-bold ml-2 text-lg">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : orcamentoId ? "Atualizar Orçamento" : "Salvar Orçamento"}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-primary text-primary rounded-md font-bold hover:bg-primary hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
