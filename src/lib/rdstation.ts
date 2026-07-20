import axios from "axios";

const BASE_URL = "https://crm.rdstation.com/api/v1";
const CLIENT_ID = process.env.RD_STATION_CLIENT_ID;
const CLIENT_SECRET = process.env.RD_STATION_CLIENT_SECRET;
const REDIRECT_URI = process.env.RD_STATION_REDIRECT_URI;

const accessToken: string | null = null;

export function getAuthUrl(): string {
  return `https://api.rd.services/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
}

export async function exchangeCode(code: string): Promise<{ access_token: string; refresh_token: string }> {
  const res = await axios.post("https://api.rd.services/auth/token", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code,
  });
  return res.data;
}

export async function createDeal(nome: string, valor: number, contatoEmail: string) {
  const res = await axios.post(
    `${BASE_URL}/deals`,
    { deal: { name: nome, amount: valor, deal_stage_id: "" }, contact: { email: contatoEmail } },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data;
}
