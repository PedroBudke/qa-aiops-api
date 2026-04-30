# Fase 5 — Dashboard QA_AIOps

## Estrutura
```
fase5/
├── API_PYTHON/
│   ├── script.py          ← API FastAPI
│   ├── requirements.txt   ← dependências Python
│   ├── treino.pkl         ← modelo treinado (copie da Fase 3/4)
│   └── scaler.pkl         ← scaler (se houver)
└── FRONTEND/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        └── App.jsx        ← dashboard principal
```

---

## 1. Rodar a API Python

```bash
# Entre na pasta da API
cd API_PYTHON

# Copie seu modelo treinado para esta pasta
# (o arquivo treino.pkl gerado no Colab na Fase 3/4)

# Instale as dependências
pip install -r requirements.txt

# Rode a API
uvicorn script:app --reload --port 8000
```

Acesse: http://localhost:8000 → deve retornar `{"status":"online",...}`

---

## 2. Rodar o Frontend React

```bash
# Entre na pasta do frontend
cd FRONTEND

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 3. Usar o Dashboard

1. Abra http://localhost:3000
2. Arraste o `resultados_carga_anomala.csv` para a área de upload
3. O dashboard irá:
   - Mostrar **🚨 ALERTA VERMELHO** se anomalias > 5%
   - Mostrar **✅ NORMAL** se anomalias ≤ 5%
   - Exibir gráfico de latência com linha de baseline
   - Listar as requisições classificadas como anomalia

---

## Observações

- A API precisa estar rodando ANTES de usar o frontend
- O arquivo `treino.pkl` deve estar na pasta `API_PYTHON/`
- Se seu modelo foi salvo como `modelo_anomalia.pkl`, renomeie para `treino.pkl`
  ou altere a linha `MODELO_PATH = "treino.pkl"` no `script.py`
