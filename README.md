# Orbit

Aplicação para gerenciar projetos pessoais. Backend em ASP.NET Core 8 com SQLite e frontend em React/Vite.

## Stack

### Backend (`api/`)
- ASP.NET Core 8 — Minimal API
- Entity Framework Core 8 + SQLite
- Swashbuckle.AspNetCore + Microsoft.AspNetCore.OpenApi (Swagger / OpenAPI)

### Frontend (`web/`)
- React 19
- Vite 8
- Tailwind CSS 4
- ESLint

### Testes
- xUnit
- FluentAssertions
- `Microsoft.EntityFrameworkCore.InMemory` (unit tests)
- `Microsoft.AspNetCore.Mvc.Testing` + SQLite in-memory (integration tests)

## Estrutura do repositório

```
orbit/
├── OrbitApi.sln                  # Solution agregando api + testes
├── api/                          # Backend
│   ├── Endpoints/ProjectEndpoints.cs
│   ├── Models/Project.cs
│   ├── Data/AppDbContext.cs
│   ├── Program.cs
│   └── OrbitApi.csproj
├── web/                          # Frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── bruno/                        # Cliente HTTP (Bruno) — requests versionadas
│   ├── bruno.json
│   ├── environments/Local.bru
│   └── Projects/                 # CRUD de Projects
└── tests/
    ├── OrbitApi.UnitTests/       # 8 testes — handlers isolados
    └── OrbitApi.IntegrationTests/# 3 testes — pipeline HTTP completo
```

## Como rodar

### Backend
```bash
cd api
dotnet run
```
- API: `http://localhost:5121` (ou `https://localhost:7179`)
- Swagger UI: `http://localhost:5121/swagger` (apenas em ambiente Development)

### Frontend
```bash
cd web
npm install
npm run dev
```
- Dev server: `http://localhost:5173` (já liberado no CORS do backend).
- A URL da API é lida de `VITE_API_URL`. O default de desenvolvimento (`http://localhost:5121/api`) está em `web/.env.development` (versionado). Para sobrescrever localmente sem mexer no arquivo versionado, criar `web/.env.local` com o valor desejado — esse arquivo é ignorado pelo git.

### Testes
```bash
dotnet test OrbitApi.sln
```
Roda os 11 testes (unit + integration) na solução inteira.

### Cliente HTTP (Bruno)
Abrir a pasta `bruno/` no app do [Bruno](https://www.usebruno.com/), selecionar o environment **Local** e disparar os requests da pasta `Projects/`. Requer a API rodando em `http://localhost:5121`. Detalhes na seção [Cliente HTTP (Bruno)](#cliente-http-bruno-1).

---

## Cliente HTTP (Bruno)

[Bruno](https://www.usebruno.com/) é um cliente HTTP estilo Postman/Insomnia, mas que armazena cada request como **arquivo texto (`.bru`)** no filesystem. Isso permite versionar a collection junto ao código, ter diff legível em PRs e evitar dependência de cloud/login.

### Instalação
- App desktop: [usebruno.com/downloads](https://www.usebruno.com/downloads) (Windows, macOS, Linux).
- CLI (opcional, para rodar a collection sem GUI): `npm install -g @usebruno/cli`.

### Abrir a collection
1. Abrir o app do Bruno.
2. **Open Collection** → apontar para a pasta `bruno/` deste repositório.
3. No canto superior direito, selecionar o environment **Local**.
4. Garantir que a API esteja rodando (`cd api && dotnet run`).
5. Disparar qualquer request da pasta `Projects/`.

### Estrutura da collection
```
bruno/
├── bruno.json              # metadata (nome, versão, tipo)
├── .gitignore              # ignora .env e *.local.bru
├── environments/
│   └── Local.bru           # baseUrl = http://localhost:5121
└── Projects/               # uma pasta por recurso/agrupamento
    ├── List Projects.bru       (seq: 1)
    ├── Get Project By Id.bru   (seq: 2)
    ├── Create Project.bru      (seq: 3)
    ├── Update Project.bru      (seq: 4)
    └── Delete Project.bru      (seq: 5)
```

### Convenções
- **Uma pasta por recurso** (`Projects/`, `Users/`, ...). Espelha o agrupamento de endpoints do backend (`MapGroup("/api/projects")`).
- **Um arquivo `.bru` por request**, nomeado em inglês com case natural (`Create Project.bru`).
- **`seq:` numera a ordem na UI**, normalmente `List → GetById → Create → Update → Delete`.
- **`baseUrl` sempre via environment**, nunca hardcoded — facilita apontar para outro ambiente sem editar requests.
- **Path params** declarados em `params:path { id: 1 }` e referenciados como `:id` na URL.

### Adicionar um novo request
Pelo app: clicar com botão direito na pasta → **New Request**. O Bruno gera o `.bru` automaticamente.

Manualmente (formato resumido):
```
meta {
  name: <Nome do request>
  type: http
  seq: <número de ordem na pasta>
}

get {
  url: {{baseUrl}}/api/<rota>
  body: none
  auth: none
}
```
Para POST/PUT, trocar `get` por `post`/`put`, mudar `body: none` para `body: json` e adicionar bloco `body:json { ... }`.

### Adicionar um novo environment
Criar um arquivo em `bruno/environments/` (ex.: `Staging.bru`):
```
vars {
  baseUrl: https://staging.example.com
}
```
O environment fica selecionável no dropdown da UI.

### Variáveis e segredos
- **Variáveis públicas** vão direto no `.bru` do environment (`baseUrl`, ids comuns, etc.) e são versionadas.
- **Segredos** (tokens, API keys, senhas) vão em `bruno/.env` (já no `.gitignore`) no formato `KEY=value` e são referenciados nos requests como `{{process.env.KEY}}`. Nunca colocar segredos diretamente no `.bru`.

Hoje o projeto não tem auth; quando aparecer (ex.: JWT), bastará criar `bruno/.env` com `JWT_TOKEN=...` e adicionar `Authorization: Bearer {{process.env.JWT_TOKEN}}` nos requests que precisarem.

### Rodar a collection inteira pela CLI
```bash
bru run --env Local
```
Executa todos os requests em ordem (`seq:`) e retorna exit code != 0 se algum falhar. Útil para smoke test pós-deploy — registrado também em [O que ficou para depois](#smoke-tests-com-bru-cli).

---

## Segredos e variáveis de ambiente

Hoje o Orbit não tem segredos (SQLite local, sem auth, sem chaves externas). Esta seção documenta a **convenção** que vamos seguir quando aparecerem.

### Regras gerais
1. **Nunca commitar segredos.** O `.gitignore` cobre `.env`, `.env.local` e `.env.*.local`. Se algum escapar, **rotacione o segredo** (gere outro) — apagar do git não basta porque o valor permanece no histórico do repositório.
2. **Tudo que tiver prefixo `VITE_*` é público.** O Vite injeta essas variáveis no bundle JavaScript que vai para o navegador, então o usuário consegue ver via DevTools. Trate qualquer `VITE_*` como anúncio em outdoor: serve para URLs, feature flags, IDs de analytics públicos. **Nunca para chaves de API, tokens ou senhas.**
3. **Segredos nunca trafegam pelo frontend.** Se precisar consumir uma API de terceiro com chave secreta, o backend faz a chamada e expõe um endpoint próprio para o front.

### Padrão por stack

| Stack | Em desenvolvimento | Em produção |
|-------|--------------------|-------------|
| **.NET (`api/`)** | `dotnet user-secrets` | Variáveis de ambiente do host (Azure App Service, Render, Fly.io) ou cofre (Azure Key Vault, AWS Secrets Manager) |
| **Vite (`web/`)** | `.env.development` (público, versionado) e `.env.local` (override pessoal, ignorado) | Variáveis injetadas no build, **somente valores públicos** |
| **Bruno (`bruno/`)** | `bruno/.env` (ignorado), referenciado como `{{process.env.X}}` nos requests | N/A — Bruno é ferramenta de dev |

### Backend: `dotnet user-secrets`
Quando aparecer um segredo no backend (JWT signing key, connection string de banco remoto, chave de API externa):

```bash
cd api
dotnet user-secrets init                           # adiciona um UserSecretsId no csproj
dotnet user-secrets set "Jwt:Key" "valor-secreto"
```

Os valores ficam em `~/.microsoft/usersecrets/<id>/secrets.json`, **fora da pasta do projeto** — impossível commitar por acidente. O `IConfiguration` carrega automaticamente em ambiente Development:

```csharp
var jwtKey = builder.Configuration["Jwt:Key"];
```

Em produção, o mesmo `IConfiguration` lê de variáveis de ambiente injetadas pelo host (`Jwt__Key=...`).

### Frontend: somente valores públicos
- **`web/.env.development`** (versionado): defaults de dev. Hoje contém apenas `VITE_API_URL=http://localhost:5121/api`.
- **`web/.env.local`** (ignorado): override pessoal. Útil se você roda a API noutra porta ou contra outro ambiente.
- **`web/.env.production`** (versionado, quando existir): defaults de produção, novamente só com valores públicos.

### Exemplo prático futuro
Quando adicionarmos auth com JWT:
1. Backend: `dotnet user-secrets set "Jwt:Key" "..."` e ler via `Configuration["Jwt:Key"]`.
2. Frontend: armazena o token recebido no login (em memória ou `httpOnly` cookie). **Nunca em `VITE_*`** nem em `localStorage` (XSS-vulnerável).
3. Bruno: `bruno/.env` com `JWT_TOKEN=...`, request usa `Authorization: Bearer {{process.env.JWT_TOKEN}}`.

---

## Decisões técnicas

### Minimal API em vez de Controllers
A API permanece em Minimal API. Em .NET 8 ela cobre Swagger nativo, testes via `WebApplicationFactory` e organização por grupos (`MapGroup`). Para um CRUD de poucas entidades, é mais enxuto que Controllers. Se um dia o `ProjectEndpoints.cs` crescer demais, evolui-se para *vertical slices* (`Features/Projects/Create.cs`, etc.) — não há necessidade de migrar para Controllers.

### Handlers como métodos estáticos com `TypedResults`
Os handlers foram extraídos das lambdas inline para métodos estáticos em `ProjectEndpoints`, retornando `TypedResults<TOk, TNotFound>`. Isso permite testá-los unitariamente sem subir a aplicação, mantendo o estilo Minimal API e ganhando tipagem forte nos retornos.

### `Program` como `partial class` pública
Necessário para o `WebApplicationFactory<Program>` enxergar a classe e subir a aplicação nos testes de integração.

### EF Core com `EnsureCreated()`
Cria o schema no startup se ainda não existir. Suficiente para protótipo solo. **Não suporta evoluir** o schema — listado nos próximos passos como migração para `dotnet ef migrations`.

### SQLite local
Arquivo único (`api/orbit.db`), zero infraestrutura. Para produção, basta trocar a connection string em `appsettings.json` — EF Core suporta Postgres/SQL Server com mudança mínima de código.

### Estratégia de `.gitignore` consolidado (revisada)
**Histórico:** começamos com gitignores por aplicação (raiz + `api/` + `web/` + `tests/` + `bruno/`), seguindo a ideia de "co-localizar patterns". Na prática isso falhou duas vezes — `api/bin`/`obj` foram para o primeiro commit (raiz só tinha regras Node) e depois `tests/*/bin`/`obj` foram parar tracked (o `api/.gitignore` não alcança `tests/`). Toda nova pasta de stack obrigava criar mais um gitignore, e patterns como `[Bb]in/` se repetiam entre `api/` e `tests/`.

**Decisão atual:** um único `.gitignore` na raiz, organizado por seções (`# Sistema operacional`, `# Editores`, `# Segredos`, `# .NET`, `# Node / Vite`, `# Bruno`). Padrões como `[Bb]in/`, `[Oo]bj/` e `node_modules/` casam em qualquer profundidade do repositório, então não importa se a stack aparece em `api/`, `tests/` ou numa pasta nova futura.

**Tradeoff aceito:** patterns deixam de estar co-localizados com o código que os gera, em troca de ter uma fonte única, que não esquece e não tem padrões duplicados. Para um monorepo solo de tamanho moderado, o ganho de confiabilidade compensa.

### Camadas de teste
- **Unit tests** (`tests/OrbitApi.UnitTests`): testam os handlers diretamente, com `AppDbContext` usando o provedor `InMemory`. Rápidos, isolam regras de negócio e CRUD.
- **Integration tests** (`tests/OrbitApi.IntegrationTests`): sobem a aplicação real via `WebApplicationFactory<Program>`, sobrescrevem o `DbContext` para usar SQLite in-memory (mais fiel que o provedor `InMemory`) e exercitam o pipeline HTTP completo — CORS, serialização JSON, status codes, roteamento.

### Cliente HTTP versionado (Bruno)
Os requests para validação manual da API ficam em `bruno/`, no formato `.bru` (texto plano) — diff legível em PR e versionamento natural junto ao código. Cada request é um arquivo, environments ficam em `bruno/environments/`. Segredos eventuais devem ir em `bruno/.env` (ignorado pelo git) e ser referenciados como `{{process.env.X}}`.

---

## O que ficou para depois

### CI (Continuous Integration)
Automatizar build, testes e lint a cada push ou Pull Request. Há três camadas possíveis, complementares:

1. **Script local** (`scripts/check.sh`) — sequência manual de `dotnet test && npm run lint && npm run build` para rodar antes de pushar.
2. **Git hooks** via Husky ou lefthook — roda os mesmos comandos automaticamente no `pre-push`, ainda no ambiente local.
3. **GitHub Actions** (`.github/workflows/ci.yml`) — executa em ambiente limpo na nuvem. Gratuito até 2000 min/mês em repo privado, ilimitado em público. Acrescenta o histórico de "este commit passou" e elimina o "funciona na minha máquina".

Plano sugerido: começar pelas duas camadas locais (sem dependência de servidor) e adicionar o GitHub Actions quando o repo for hospedado.

### Migração do `web/` para TypeScript
Hoje o front está em JavaScript (`.jsx`). Compensa migrar quando:
- O projeto crescer (~10+ componentes/arquivos).
- Quiser tipos do `Project` sincronizados automaticamente entre backend e frontend (via `openapi-typescript` consumindo o Swagger gerado pela API).

A migração é incremental: instalar `typescript`, gerar `tsconfig.json`, e renomear arquivos `.jsx` → `.tsx` conforme forem tocados. Vite suporta TS nativamente. Arquivos JS e TS coexistem sem fricção.

### EF Core Migrations
Substituir `db.Database.EnsureCreated()` por migrations geradas com `dotnet ef migrations add <Nome>`. Necessário a partir do momento em que o modelo `Project` (ou novas entidades) começar a sofrer alterações de schema — `EnsureCreated` só cria do zero, não evolui.

### Smoke tests com `bru` CLI
A collection do Bruno pode ser executada inteira pelo CLI (`npm install -g @usebruno/cli` → `bru run --env Local`), retornando exit code != 0 se algum request falhar. Encaixa bem como **smoke test pós-deploy** dentro do CI futuro: complementa os testes de integração do xUnit (que rodam in-process) validando o pipeline real (servidor levantado, porta correta, CORS).

### Vertical Slices (apenas se necessário)
Se `ProjectEndpoints.cs` virar uma parede de centenas de linhas, quebrar em arquivos por feature: `Features/Projects/Create.cs`, `List.cs`, `Update.cs`, etc. Mantém Minimal API e evita arquivos gigantes. **Não fazer prematuramente** — só quando o arquivo realmente atrapalhar.
