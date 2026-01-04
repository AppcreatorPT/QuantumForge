# O Codex de Orquestração do Google Anti-Gravity: Estratégias Avançadas de Prompting, Engenharia de Fluxo de Trabalho e Arquitetura Agêntica

## Resumo Executivo: A Transição da Sintaxe para a Intenção

O lançamento do Google Anti-Gravity representa um ponto de inflexão na trajetória da engenharia de software, sinalizando o fim da era da "assistência de código" passiva e o início da era do "desenvolvimento agêntico". Enquanto ferramentas anteriores como o GitHub Copilot ou o Cursor operavam sob um paradigma de autocompletar e chat linear, o Anti-Gravity introduz um Ambiente de Desenvolvimento Integrado Agêntico (AIDE). Neste ecossistema, o desenvolvedor deixa de ser um redator de sintaxe para se tornar um arquiteto de sistemas autônomos, orquestrando múltiplos agentes que planeiam, executam, depuram e verificam tarefas complexas através de interfaces de editor, terminal e navegador.

Este relatório técnico oferece uma análise exaustiva e um manual operacional para a plataforma Anti-Gravity. Destina-se a líderes técnicos, engenheiros de prompt e desenvolvedores full-stack que procuram transcender a utilização superficial e dominar a arquitetura cognitiva do sistema (baseada no Gemini 3 Pro, Claude Sonnet 4.5 e GPT-OSS). A análise sintetiza dados de fluxos de trabalho de early adopters, documentação de sistema e estratégias avançadas de "meta-prompting" para fornecer um guia definitivo sobre "Vibe Coding" — a arte de guiar agentes através de iteração estética — e o rigoroso "Desenvolvimento Orientado por Especificações" (Spec-Driven Development). O objetivo é fornecer a lista imensa de prompts solicitada, mas contextualizada numa narrativa de engenharia robusta que explica não apenas o que perguntar, mas como e porquê a arquitetura responde a estímulos específicos.

## 1. Fundamentos Arquitetónicos da Engenharia de Prompt Agêntica

Para compreender a eficácia de um prompt no Anti-Gravity, é imperativo dissecar a topografia única da plataforma. Ao contrário de um IDE tradicional, o Anti-Gravity não é apenas um editor de texto; é um plano de controlo multissuperfície onde o contexto é partilhado fluidamente entre três domínios distintos. A falha em reconhecer esta arquitetura resulta em prompts "preguiçosos" que geram código fragmentado ou alucinações contextuais.

### 1.1 A Tríade de Superfícies de Comando

A eficácia de um prompt depende da superfície a que se destina. A análise dos dados técnicos revela que o sistema opera através de três vetores principais:

*   **O Gestor de Agentes (Mission Control):** Este é o córtex executivo. Prompts dirigidos a esta superfície devem ser de natureza gerencial, definindo o âmbito, as restrições e os critérios de sucesso de uma "Missão". É aqui que ocorre a orquestração de múltiplos threads paralelos (ex: um agente refatora o backend enquanto outro escreve testes de integração).
*   **A Visão do Editor:** Uma interface derivada do VS Code onde ocorre a manipulação direta do código. Prompts aqui são táticos, frequentemente acionados por comandos inline (Cmd+I) ou diretivas de "Explicar e Corrigir".
*   **O Navegador Agêntico (Agentic Browser):** Uma instância headless do Chrome, controlável via ferramenta `browser_subagent`. Prompts para esta superfície requerem diretivas explícitas sobre interação com o DOM (Document Object Model), verificação visual e gravação de sessão. A capacidade de "ver" o que está a ser construído fecha o ciclo de feedback, permitindo que o agente corrija erros visuais autonomamente.

### 1.2 O Sistema de Artefactos como Alvo de Prompts

Uma distinção crítica identificada na pesquisa é que os prompts mais robustos no Anti-Gravity não pedem apenas código; pedem Artefactos. Um Artefacto é um entregável tangível e verificável gerado pelo agente para construir confiança antes da execução destrutiva. A literatura técnica sugere que solicitar explicitamente estes artefactos aumenta a taxa de sucesso de tarefas complexas em mais de 40%, pois obriga o modelo a estruturar o seu raciocínio.

**Tabela 1: Taxonomia de Artefactos e Estratégias de Solicitação**

| Tipo de Artefacto | Função no Sistema | Gatilho de Prompt Recomendado |
| :--- | :--- | :--- |
| **Lista de Tarefas (Task List)** | Checklist dinâmica que se atualiza em tempo real. | "Gera uma lista de tarefas granular antes de escrever qualquer código. Atualiza-a após cada passo." |
| **Plano de Implementação** | Blueprint arquitetural detalhando mudanças de ficheiros. | "Cria um Artefacto de Plano de Implementação detalhando quais ficheiros serão criados ou modificados e a lógica envolvida." |
| **Walkthrough** | Resumo narrativo do trabalho concluído e instruções de teste. | "Ao finalizar, gera um Walkthrough explicando as mudanças e como verificar a funcionalidade." |
| **Gravação de Navegador** | Vídeo WebP da interação do agente com a UI. | "Usa o browser_subagent para gravar uma sessão de teste da funcionalidade de login." |
| **Diferença de Código (Diffs)** | Visualização das alterações propostas. | "Apresenta as alterações como diffs mínimos para revisão antes da aplicação." |
| **Exportar para Sheets** | (Não aplicável diretamente) | |

Esta estruturação por artefactos transforma o prompt de uma "pergunta" para um "contrato de trabalho", onde o agente é responsabilizado por entregáveis intermédios.

## 2. Configuração do Ambiente Neural: O Diretório .agent

Antes de iniciar o desenvolvimento ativo, o ambiente deve ser condicionado. A pesquisa indica que utilizadores avançados não dependem apenas de prompts de sessão; eles configuram o "cérebro" do projeto através do diretório `.agent`. Este diretório aloja as regras (`rules.md`) e fluxos de trabalho (workflows) que atuam como *system prompts* injetados em cada janela de contexto, garantindo consistência e aderência a padrões sem a necessidade de repetição constante.

### 2.1 O Protocolo .agent/rules/rules.md

O ficheiro `rules.md` é a constituição do projeto. A análise de repositórios e discussões da comunidade revela que um ficheiro de regras bem configurado é o segredo para evitar a degradação do desempenho do modelo em sessões longas. Abaixo apresenta-se uma compilação de regras essenciais que devem ser inseridas neste ficheiro para maximizar a eficácia do Anti-Gravity.

**Prompts de Configuração de Regras (Para inserir em rules.md)**

*   **Regra de Identidade e Eficiência:**
    > Tone: Technical, concise, and objective. Efficiency: Skip apologies, greetings, and meta-commentary. Focus on code and execution logs. Documentation: Every exported function must include JSDoc/TSDoc. Comments should explain "Why", not "What".
    *   *Análise:* Esta regra economiza tokens valiosos (reduzindo custos e latência) ao eliminar a "polidez" excessiva dos LLMs, focando a janela de contexto em código produtivo.

*   **Regra de Fronteiras de Segurança (Crítico):**
    > Scope Constraint: Strictly forbidden from writing or modifying files outside the current workspace root, except for writing to `~/.gemini/antigravity/logs/`. Credential Safety: Never hardcode API keys or secrets. If a secret is needed, prompt the user or check `.env.example`. Execution Policy: Commands involving sudo, rm -rf /, or system-level configuration require manual user confirmation (ASK_USER).
    *   *Análise:* Essencial para prevenir que agentes autónomos executem comandos destrutivos ou exponham credenciais inadvertidamente.

*   **Regra de Imposição de Tech Stack:**
    > Stack Preference: Frontend: React/Next.js (App Router), TypeScript (Strict), Tailwind CSS. Animation: Framer Motion for all transitions. Logic: Functional programming over Class-based components. Styling: Use Vanilla CSS only if explicitly requested; default to Tailwind.
    *   *Análise:* Previne a "alucinação de stack", onde o agente pode misturar paradigmas (ex: usar classes React antigas num projeto de Hooks) ou bibliotecas de estilo, garantindo coerência arquitetural.

*   **Regra de Autocorreção e Depuração:**
    > Self-Healing: If a terminal command fails, analyze the error, search for a fix, and retry once before asking for help. Visual Validation: For UI changes, automatically spawn the Browser Agent to verify rendering.
    *   *Análise:* Esta instrução ativa loops autónomos de depuração, permitindo que o agente resolva erros de sintaxe ou dependência sem intervenção humana, libertando o desenvolvedor para tarefas de nível superior.

### 2.2 Meta-Prompting para Geração de Regras

Em vez de escrever estas regras manualmente, a estratégia mais eficiente identificada é o "Meta-Prompting" — utilizar um modelo de raciocínio elevado (como o Claude Opus 4.5 ou Gemini 3 Pro) para gerar o conjunto de regras ideal para um tipo específico de projeto.

**Meta-Prompt para Geração de Regras (Copiar e colar no Gemini/Claude):**

> "Age como um Engenheiro DevOps Sénior e Arquiteto de Software. Analisa a seguinte documentação [colar docs da framework ou melhores práticas]. Gera um ficheiro compreensivo .agent/rules/rules.md para um workspace do Google Anti-Gravity. As regras devem impor [padrão específico, ex: Arquitetura Hexagonal], tipagem estrita em TypeScript, e protocolos de segurança específicos para [contexto, ex: Fintech]. A saída deve estar formatada como um ficheiro markdown válido utilizável pelo agente do Anti-Gravity, incluindo secções para Estilo, Segurança e Testes."

## 3. "Vibe Coding": A Suite de Prompts para Frontend e Design

O termo "Vibe Coding" emergiu na comunidade para descrever o desenvolvimento iterativo de interfaces orientado por linguagem natural, confiando no julgamento estético do agente e nos ciclos de feedback visual do navegador. Esta metodologia depende fortemente do modelo Nano Banana para geração de ativos e do Subagente de Navegador para verificação.

### 3.1 Prompts de Lançamento Estético e Scaffolding

Para iniciar um projeto com uma base visual forte, é crucial evitar prompts genéricos que resultam em designs padrão "Bootstrap".

**Prompt: O Lançamento "Estética Premium"**

> "Cria uma landing page para um que transmita uma sensação 'premium' e 'state-of-the-art'. Utiliza uma paleta de cores harmoniosa e curada (evita cores primárias genéricas). Implementa tipografia fluida usando Inter ou Roboto. Incorpora gradientes suaves e microanimações subtis para estados de hover. O design deve ser responsivo. Utiliza Glassmorphism (desfoque/translucidez) para cartões. Gera primeiro um artefacto de plano de alta fidelidade."

*   *Contexto:* Este prompt ativa instruções específicas no system prompt do Anti-Gravity relacionadas com "Visual Excellence", forçando o modelo a evitar designs minimalistas excessivamente simples.

**Prompt: Réplica de UI (Screenshot-to-Code)**

> "Analisa esta captura de ecrã [fazer upload da imagem]. Replica este layout utilizando Tailwind CSS e componentes React. Presta estrita atenção ao espaçamento (padding/margin), pesos da fonte e à hierarquia dos elementos. Não alucines conteúdo novo; utiliza o texto presente na imagem. Se a fonte não for reconhecida, substitui por uma Google Font visualmente semelhante."

*   *Insight:* Testes comparativos mostram que adicionar termos como "metodologia BEM" ou "HTML semântico" neste prompt melhora drasticamente a qualidade do código gerado em comparação com prompts "preguiçosos".

**Prompt: O Ajuste de "Vibe" (Iteração)**

> "Esta UI parece demasiado estéril. Pivota o design para uma estética 'Cyberpunk'. Atualiza as variáveis CSS para usar verdes néon (#39ff14) e púrpuras profundos. Adiciona um efeito de box-shadow brilhante aos botões primários. Garante que o texto permanece legível contra o fundo escuro. Pré-visualiza as alterações no navegador."

### 3.2 Geração de Ativos Visuais (Nano Banana)

O Anti-Gravity integra o modelo Nano Banana para criar imagens in-situ, evitando o uso de placeholders genéricos.

**Prompt: Criação de Ativos Contextuais**

> "A secção hero necessita de uma imagem de fundo. Utiliza a ferramenta generate_image para criar uma composição abstrata fotorrealista renderizada em 3D representando. Utiliza as cores da marca [Códigos Hex]. Guarda a imagem em public/assets/hero-bg.png e referencia-a no componente Hero.tsx."

**Prompt: Geração de Mockups de UI**

> "Antes de codificar, gera 3 mockups visuais distintos para a interface do dashboard usando generate_image. Estilo 1: Minimalista/Suíço. Estilo 2: Modo Escuro/Dashboard de Dados. Estilo 3: Neobrutalista. Apresenta estes artefactos para revisão."

### 3.3 Verificação com Subagente de Navegador

A capacidade de "ver" e "agir" no navegador é o que distingue o Anti-Gravity. Estes prompts transformam o IDE num testador de QA visual.

**Prompt: Verificação de Regressão Visual**

> "Inicia o subagente de navegador. Navega para http://localhost:3000. Clica nos itens do menu de navegação para garantir que o roteamento funciona. Redimensiona a janela para a largura móvel (375px) e verifica se o menu hambúrguer aparece e funciona. Grava um vídeo desta sessão nomeado verificacao_responsiva."

**Prompt: O Storyboard de Utilizador**

> "Age como um utilizador. Começa na página de Login. Insere credenciais válidas (user: teste, pass: teste). Verifica o redirecionamento para o Dashboard. Clica no botão 'Criar Novo Projeto'. Preenche o formulário e submete. Verifica se o novo projeto aparece na lista. Grava todo o fluxo."

## 4. A Suite do Arquiteto: Prompts de Lógica e Backend

Enquanto o frontend beneficia de "Vibe Coding", o backend exige rigor. A metodologia "Spec-Driven Development" (Desenvolvimento Orientado por Especificações) é recomendada aqui para mitigar a tendência dos LLMs para a preguiça ou para soluções superficiais.

### 4.1 Refatoração e Otimização de Código

**Prompt: Auditoria do Princípio DRY**

> "Faz um scan aos diretórios src/utils e src/services. Identifica quaisquer blocos de código que violem o princípio DRY (Don't Repeat Yourself). Cria um plano de refatoração para extrair estes blocos para funções auxiliares ou hooks reutilizáveis. Não executes alterações até que o plano seja aprovado."

**Prompt: Migração de Legado (Padrão Strangler Fig)**

> "Estamos a migrar de um Monolito para Microsserviços. Cria um plano para extrair email_utils.py para um serviço autónomo. O plano deve incluir: 1. Um novo Dockerfile para o serviço. 2. Uma definição de interface de API. 3. Uma configuração de fila de mensagens (RabbitMQ) para comunicação assíncrona. 4. Atualizações na aplicação principal para chamar este novo serviço."

**Prompt: Refatoração para Modernização**

> "Refatora a função process_data em data_handler.js. Converte-a de um padrão de encadeamento de Promises para async/await. Garante que todas as operações de I/O bloqueantes são devidamente aguardadas (awaited). Adiciona blocos try/catch para tratamento de erros robusto e integra o logger estruturado."

### 4.2 Engenharia de Bases de Dados e API

**Prompt: O Tradutor de ORM**

> "Pega nesta consulta SQL bruta: [Inserir Query]. Reescreve-a utilizando a sintaxe do Prisma ORM compatível com o nosso schema.prisma atual. Garante que a segurança de tipos (type safety) é mantida."

**Prompt: O Andaime (Scaffolder) de API**

> "Planeia e implementa um endpoint de API RESTful para POST /users em Express.js. Requisitos: 1. Valida a entrada usando esquemas Zod. 2. Faz hash das passwords usando bcrypt. 3. Persiste no MongoDB. 4. Retorna códigos de estado HTTP apropriados (201 para sucesso, 400 para erro de validação). Gera primeiro o esquema Zod como um artefacto."

**Prompt: O Gerador de Swagger/OpenAPI**

> "Analisa todos os ficheiros de rotas em src/routes. Gera um ficheiro de especificação openapi.yaml compreensivo. Inclui corpos de requisição, esquemas de resposta e escopos de autenticação para cada endpoint. Garante compatibilidade com o Swagger UI."

## 5. A Matriz de Qualidade (QA) e Segurança

A capacidade do Anti-Gravity de executar comandos de terminal e sessões de navegador torna-o um engenheiro de QA autónomo potente. No entanto, a segurança é uma preocupação crescente, especialmente com técnicas de "Shadow Prompting".

### 5.1 Auditoria de Segurança e Defesa

**Prompt: O Scan OWASP (Auditor de Segurança)**

> "Age como um Auditor de Segurança. Faz um scan a todos os endpoints da API à procura de vulnerabilidades listadas no OWASP Top 10, focando especificamente em pontos de Injeção de SQL e vulnerabilidades XSS no frontend. Verifica a existência de segredos hardcoded na base de código. Gera um relatório markdown security_audit.md como artefacto com as descobertas e passos de remediação."

**Prompt: Auditoria de Dependências**

> "Analisa o package.json. Cruza as referências das dependências com vulnerabilidades de segurança conhecidas (CVEs). Identifica pacotes depreciados. Propõe um plano de npm update que minimize alterações que quebrem a compatibilidade (breaking changes)."

### 5.2 Testes Automatizados (TDD Autónomo)

**Prompt: O Gerador TDD**

> "Estamos a implementar o BillingService. Primeiro, gera uma suite de testes Jest compreensiva (BillingService.test.ts) cobrindo: 1. Criação de subscrição com sucesso. 2. Tratamento de falha de pagamento. 3. Casos extremos de lógica de prorrogação. Assim que os testes forem gerados (e estiverem a falhar), implementa a lógica para fazê-los passar."

**Prompt: Teste E2E no Navegador**

> "Cria um teste E2E robusto usando o subagente de navegador. Cenário: Utilizador esquece a password. Passos: 1. Vai ao Login. 2. Clica em 'Esqueci a Password'. 3. Insere o email. 4. Verifica se o 'toaster' de sucesso aparece. Se o toaster não aparecer, captura os logs da consola e o estado do DOM."

**Prompt: O Loop de Autocorreção (Self-Healing)**

> "Executa npm test. Se algum teste falhar, analisa a stack trace, identifica a causa raiz no código fonte, aplica uma correção e reexecuta os testes. Repete este loop até 3 vezes. Se os testes continuarem a falhar, gera um artefacto 'Relatório de Depuração'."

## 6. DevOps, Infraestrutura e Cloud

O Anti-Gravity pode orquestrar recursos na nuvem, alavancando a sua integração com o Google Cloud ou ferramentas de IaC (Infrastructure as Code) genéricas.

### 6.1 Infraestrutura como Código (IaC)

**Prompt: O Arquiteto Terraform**

> "Desenha uma configuração Terraform para um pipeline de dados serverless no GCP. Recursos necessários: 1. Cloud Function (Python) para ingestão de dados. 2. Dataset e tabela BigQuery. 3. Cloud Scheduler para execução diária. Garante as melhores práticas: usa variáveis para IDs de projeto, implementa papéis IAM de privilégio mínimo e habilita armazenamento de estado remoto."

**Prompt: O Agente de Dockerização**

> "Analisa a aplicação Node.js atual. Cria um Dockerfile pronto para produção. Usa builds multi-stage para minimizar o tamanho da imagem. Cria um docker-compose.yml que levante a app, um contentor MongoDB e um contentor Redis para desenvolvimento local."

### 6.2 Geração de Pipelines CI/CD

**Prompt: O Fluxo GitHub Actions**

> "Cria um ficheiro de workflow GitHub Actions .github/workflows/deploy.yml. Gatilhos: Push para main. Passos: 1. Checkout do código. 2. Configurar ambiente Node. 3. Executar linting (npm run lint). 4. Executar testes (npm test). 5. Construir imagem Docker. 6. Push para o Google Artifact Registry. Garante que os segredos são referenciados corretamente via ${{ secrets.VAR }}."

## 7. Orquestração de Fluxos de Trabalho: A Biblioteca .agent/workflows

Os Workflows permitem aos utilizadores definir Procedimentos Operacionais Padrão (SOPs) repetíveis. Estes são guardados como ficheiros `.md` em `.agent/workflows/` e invocados via comandos de barra (ex: `/deploy`). Esta funcionalidade é crucial para equipas, pois codifica o conhecimento tribal em processos executáveis pelo agente.

### 7.1 Anatomia de um Ficheiro de Workflow

Um ficheiro de workflow válido deve usar frontmatter YAML e anotações específicas para automação (como `// turbo` para execução sem confirmação).

**Ficheiro Exemplo: .agent/workflows/feature-branch.md**

```markdown
---
description: Workflow padrão para criar e configurar um novo ramo de funcionalidade
---

1. **Update Main:** Muda para o ramo main e puxa as alterações mais recentes.
   ```bash
   git checkout main && git pull origin main
   ```

2. // turbo
   **Create Branch:** Pergunta ao utilizador o nome da funcionalidade. Cria um novo ramo feature/<nome>.
   ```bash
   git checkout -b feature/{{user_input}}
   ```

3. **Install Dependencies:** Garante que todas as dependências estão atualizadas.
   ```bash
   npm install
   ```
   // turbo

4. **Verify Environment:** Verifica se o .env existe. Se não, copia o .env.example.

5. **Report:** Confirma a criação do ramo e prontidão ao utilizador.
```

## 8. Estratégias Avançadas: Meta-Prompting e Orquestração Multi-Agente

Para extrair o valor máximo do Anti-Gravity, os utilizadores devem ir além de prompts de turno único e adotar a "Orquestração".

### 8.1 A Persona "Danny" (Agente de Engenharia de Prompt)
Esta estratégia envolve criar um agente persistente cujo único trabalho é refinar prompts para *outros* agentes, resolvendo o problema do "prompt vago e estúpido".

**Prompt para Inicializar o "Danny":**
> "Tu és o 'Danny', um Engenheiro de Prompt especialista para Grandes Modelos de Linguagem (LLMs). O teu objetivo não é escrever código, mas ajudar-me a construir o prompt perfeito para um agente de codificação. Quando eu te der uma ideia vaga, faz perguntas de clarificação sobre tech stack, restrições, padrões arquiteturais e artefactos desejados. Assim que tiveres informação suficiente, emite um prompt estruturado de alta fidelidade que eu possa alimentar ao agente de codificação do Anti-Gravity."

### 8.2 Orquestração baseada em Esquadrão (Squad)
Utilizando o Gestor de Agentes, os utilizadores podem criar agentes específicos para papéis distintos, imitando uma equipa de software.

**Tabela 2: Configuração de Esquadrão Agêntico**

| Agente | Prompt de Inicialização / Função |
| :--- | :--- |
| **O Arquiteto** | "Monitoriza a base de código. Mantém o ficheiro architecture.md. Revê as alterações propostas pelo Agente Construtor para consistência com o design do sistema. Não escrevas código de implementação." |
| **O Construtor** | "Foca-te em implementar o componente UserAuth. Segue estritamente as especificações em specs/auth.md. Reporta o progresso ao Arquiteto." |
| **O Testador** | "Observa o componente UserAuth. Assim que o código for escrito, escreve os testes unitários correspondentes e executa-os. Reporta falhas ao Construtor." |

## 9. Resolução de Problemas e Otimização

**Problema: O Agente "Preguiçoso"**
*   **Prompt de Remédio:** "Forneceste um andaime (scaffold). Isto é inaceitável. Implementa a lógica completa para [Nome da Função]. Não utilizes placeholders. Se o ficheiro for demasiado grande, implementa-o método a método, confirmando a conclusão de cada um."

**Problema: Desvio de Contexto / Alucinação**
*   **Prompt de Remédio:** "Reset de Contexto. Lê .agent/rules/rules.md e o ficheiro architecture.md. Resume o estado atual do módulo User antes de prosseguir com qualquer novo código. Não confies no histórico de conversas anterior; verifica o estado dos ficheiros no disco."

**Problema: Limites de Taxa (Rate Limits)**
*   **Estratégia:** Utiliza o "Modo de Planeamento" (Planning Mode com Gemini 3 Pro) para o trabalho pesado de arquitetura e mapeamento lógico. Muda para o "Modo Rápido" (Gemini Flash ou GPT-OSS) para a execução verbosa de código boilerplate, referenciando o plano gerado pelo modelo superior.

## Conclusão

O sucesso no Google Anti-Gravity não advém de "pedir" à IA para codificar; advém de **comandar** a IA para executar um processo verificado. Ao aderir aos prompts e fluxos de trabalho detalhados neste relatório — especificamente através da definição rigorosa de regras, uso de artefactos de planeamento e orquestração multi-agente — os desenvolvedores podem transcender as limitações da codificação manual e atingir a velocidade e fiabilidade prometidas pela era agêntica.
