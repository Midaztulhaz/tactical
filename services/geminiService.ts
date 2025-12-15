import { GoogleGenAI } from "@google/genai";
import { OsintResult, SearchType, GroundingChunk, OsintScanParams, PersonalData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o RADAR MAEZURU, uma ferramenta de Inteligência OSINT focada em extração de dados pessoais de fontes públicas.

MISSÃO:
1. Varrer a internet em busca do alvo.
2. EXTRAIR entidades específicas: Nome Completo, CPF/Documentos (se públicos em processos/listas), Email, Telefone, Endereço, Profissão.
3. MAPEAR REDE FAMILIAR: Identificar Cônjuge (Esposa/Marido), Filhos, Pais e Parentes mencionados.

SAÍDA OBRIGATÓRIA:
Gere um relatório textual detalhado.
AO FINAL DO TEXTO, INCLUA UM BLOCO JSON ESTRUTURADO (exatamente com este formato) contendo os dados extraídos:

\`\`\`json
{
  "fullName": "Nome completo encontrado",
  "cpf": "Possível CPF ou RG encontrado (ou N/A)",
  "birthDate": "Data nasc ou N/A",
  "location": "Cidade/Estado atual",
  "occupation": "Profissão/Empresa",
  "contact": {
    "emails": ["email1", "email2"],
    "phones": ["tel1", "tel2"]
  },
  "family": {
    "spouse": "Nome conjuge ou N/A",
    "children": ["filho1", "filho2"],
    "parents": ["pai", "mae"],
    "others": ["irmao", "primo"]
  }
}
\`\`\`
`;

export const performOsintScan = async (params: OsintScanParams): Promise<OsintResult> => {
  try {
    const { query, type, file, deepScan } = params;

    let promptText = `
      ALVO: "${query}"
      TIPO BUSCA: ${type}
      DEEP SCAN: ${deepScan ? "ATIVO (Busque em processos judiciais, diários oficiais e redes sociais)" : "PADRÃO"}
      
      INSTRUÇÃO DE COMANDO:
      Encontre tudo sobre este alvo. Prioridade máxima para:
      1. CPF e Documentos (Busque em Jusbrasil, Escavador, Diários Oficiais).
      2. Contato (Emails e Telefones em bios, sites de empresas, vazamentos públicos).
      3. Família (Quem é a esposa/marido? Tem filhos? Quem são os pais?).
      4. Redes Sociais.
      
      Se encontrar processos jurídicos, extraia os nomes das partes para identificar família.
    `;

    const parts: any[] = [{ text: promptText }];

    if (file) {
      parts.unshift({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        tools: [{ googleSearch: {}, googleMaps: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, // Temperatura baixa para maior precisão na extração de dados
      },
    });

    const fullText = response.text || "Alvo não localizado.";
    
    // Extração do JSON no final
    let personalData: PersonalData | undefined = undefined;
    let cleanSummary = fullText;

    const jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            personalData = JSON.parse(jsonMatch[1]);
            // Remove o JSON do texto visível para não duplicar informação
            cleanSummary = fullText.replace(jsonMatch[0], '').trim();
        } catch (e) {
            console.error("Erro ao parsear dados estruturados:", e);
        }
    }
    
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const chunks = rawChunks as GroundingChunk[];

    const profiles: { platform: string; url: string; confidence: 'High' | 'Medium' | 'Low' }[] = [];
    
    chunks.forEach(chunk => {
      if (chunk.web?.uri) {
        const url = chunk.web.uri;
        let platform = "Web";
        
        if (url.includes("instagram.com")) platform = "Instagram";
        else if (url.includes("facebook.com")) platform = "Facebook";
        else if (url.includes("linkedin.com")) platform = "LinkedIn";
        else if (url.includes("twitter.com") || url.includes("x.com")) platform = "X / Twitter";
        else if (url.includes("tiktok.com")) platform = "TikTok";
        else if (url.includes("jusbrasil")) platform = "Processos (Jusbrasil)";
        else if (url.includes("escavador")) platform = "Processos (Escavador)";
        else if (url.includes("receitafederal")) platform = "Receita Federal";

        const cleanQuery = query.replace(/\s+/g, '').toLowerCase();
        let confidence: 'High' | 'Medium' | 'Low' = 'Low';
        if (url.toLowerCase().includes(cleanQuery)) confidence = 'High';
        else if (chunk.web.title.toLowerCase().includes(cleanQuery)) confidence = 'Medium';

        profiles.push({ platform, url, confidence });
      }
    });

    const uniqueProfiles = profiles.filter((v, i, a) => a.findIndex(t => (t.url === v.url)) === i);

    return {
      summary: cleanSummary,
      sources: chunks,
      foundProfiles: uniqueProfiles,
      strategy: [],
      personalData: personalData
    };

  } catch (error) {
    console.error("Maezuru Scan Failed:", error);
    throw new Error("Falha na varredura. Tente refinar os parâmetros.");
  }
};