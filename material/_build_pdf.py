#!/usr/bin/env python3
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "agent-loop-minimo.pdf"

FONT_DIR = Path("/usr/share/fonts/julietaula-montserrat-fonts")
LIB_DIR = Path("/usr/share/fonts/liberation-sans-fonts")

INK = (28, 25, 23)
INK_SOFT = (72, 66, 61)
RULE = (196, 184, 168)
ACCENT = (122, 72, 40)
ACCENT_SOFT = (232, 220, 204)
PAPER = (252, 249, 244)
BOX_BG = (244, 238, 228)
TABLE_HEAD = (56, 44, 36)
OK = (52, 92, 64)


class Doc(FPDF):
    def __init__(self):
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=True, margin=22)
        self.set_title("Arquitetura do loop mínimo")
        self.set_author("material")
        self.set_creator("material")
        self.add_font("Montserrat", "", str(FONT_DIR / "Montserrat-Regular.otf"))
        self.add_font("Montserrat", "B", str(FONT_DIR / "Montserrat-SemiBold.otf"))
        self.add_font("Montserrat", "I", str(FONT_DIR / "Montserrat-Italic.otf"))
        self.add_font("Body", "", str(LIB_DIR / "LiberationSans-Regular.ttf"))
        self.add_font("Body", "B", str(LIB_DIR / "LiberationSans-Bold.ttf"))
        self.add_font("Body", "I", str(LIB_DIR / "LiberationSans-Italic.ttf"))
        self.set_fallback_fonts(["Body"])

    def header(self):
        if self.page_no() == 1:
            return
        self.set_y(10)
        self.set_font("Montserrat", "", 8)
        self.set_text_color(*INK_SOFT)
        self.cell(0, 5, "Arquitetura do loop mínimo", align="L")
        self.set_xy(self.l_margin, 10)
        self.cell(0, 5, "pergunta e resposta", align="R")
        y = 16
        self.set_draw_color(*RULE)
        self.set_line_width(0.2)
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.set_y(20)

    def footer(self):
        self.set_y(-14)
        self.set_draw_color(*RULE)
        self.set_line_width(0.2)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(2)
        self.set_font("Montserrat", "", 8)
        self.set_text_color(*INK_SOFT)
        self.cell(0, 5, "Um ciclo  ·  estado  ·  uma chamada ao modelo", align="L")
        self.set_xy(self.l_margin, -12)
        self.cell(0, 5, str(self.page_no()), align="R")

    def cover(self):
        self.add_page()
        self.set_fill_color(*PAPER)
        # Full-page wash is implicit via later fills; draw a top bar.
        self.set_fill_color(*TABLE_HEAD)
        self.rect(0, 0, self.w, 58, "F")
        self.set_fill_color(*ACCENT)
        self.rect(0, 58, self.w, 2.2, "F")

        self.set_xy(self.l_margin, 18)
        self.set_font("Montserrat", "", 10)
        self.set_text_color(232, 220, 204)
        self.cell(0, 6, "ARQUITETURA")
        self.ln(10)
        self.set_x(self.l_margin)
        self.set_font("Montserrat", "B", 26)
        self.set_text_color(252, 249, 244)
        self.multi_cell(0, 11, "O loop mínimo\nde pergunta e resposta")
        self.set_y(68)
        self.set_font("Body", "", 12)
        self.set_text_color(*INK)
        self.multi_cell(
            0,
            6.4,
            "Como o ciclo funciona: o humano pergunta, o modelo responde, o "
            "transcript acumula as duas falas, e o orquestrador volta ao início. "
            "Não há tools, store externo nem orçamento. O sistema é estado + "
            "uma chamada ao modelo + um loop.",
        )
        self.ln(4)
        self._note(
            "Um chatbot de um único request não tem loop: pede e acaba. "
            "Aqui o loop existe para que cada nova pergunta veja tudo o que "
            "já foi dito. O modelo não lembra sozinho; ele só vê o que o "
            "orquestrador envia."
        )

    def h1(self, text: str):
        self.ln(3)
        # Keep the heading with the first block of body that follows.
        if self.get_y() > 200:
            self.add_page()
        self.set_font("Montserrat", "B", 15)
        self.set_text_color(*ACCENT)
        self.multi_cell(0, 8, text)
        self.set_draw_color(*ACCENT)
        self.set_line_width(0.45)
        y = self.get_y()
        self.line(self.l_margin, y, self.l_margin + 28, y)
        self.ln(4)
        self.set_text_color(*INK)

    def h2(self, text: str):
        self.ln(2)
        if self.get_y() > 238:
            self.add_page()
        self.set_font("Montserrat", "B", 12)
        self.set_text_color(*TABLE_HEAD)
        self.multi_cell(0, 7, text)
        self.ln(1.5)
        self.set_text_color(*INK)

    def p(self, text: str):
        self.set_font("Body", "", 11)
        self.set_text_color(*INK)
        self.multi_cell(0, 5.6, text)
        self.ln(2.2)

    def italic(self, text: str):
        self.set_font("Body", "I", 11)
        self.set_text_color(*INK_SOFT)
        self.multi_cell(0, 5.6, text)
        self.ln(2.2)

    def bullets(self, items: list[str]):
        self.set_font("Body", "", 11)
        self.set_text_color(*INK)
        w = self.epw
        for item in items:
            if self.get_y() > 268:
                self.add_page()
            x = self.l_margin
            y = self.get_y()
            self.set_fill_color(*ACCENT)
            self.circle(x + 1.4, y + 2.6, 0.7, "F")
            self.set_xy(x + 5, y)
            self.multi_cell(w - 5, 5.6, item)
            self.ln(0.8)
        self.ln(1.6)

    def _note(self, text: str):
        self._box(text, fill=ACCENT_SOFT, bar=ACCENT)

    def _box(self, text: str, fill=BOX_BG, bar=ACCENT):
        self.set_font("Body", "", 10.5)
        w = self.epw
        inner = w - 10
        lines = self.multi_cell(inner, 5.4, text, dry_run=True, output="LINES")
        h = 8 + len(lines) * 5.4
        if self.get_y() + h > 275:
            self.add_page()
        x, y = self.l_margin, self.get_y()
        self.set_fill_color(*fill)
        self.rect(x, y, w, h, "F")
        self.set_fill_color(*bar)
        self.rect(x, y, 1.6, h, "F")
        self.set_xy(x + 6, y + 4)
        self.set_text_color(*INK)
        self.multi_cell(inner, 5.4, text)
        self.set_y(y + h + 3)

    def code(self, text: str):
        self.set_font("Body", "", 9.2)
        w = self.epw
        lines = text.split("\n")
        h = 8 + len(lines) * 4.6
        if self.get_y() + h > 275:
            self.add_page()
        x, y = self.l_margin, self.get_y()
        self.set_fill_color(38, 34, 32)
        self.rect(x, y, w, h, "F")
        self.set_xy(x + 5, y + 4)
        self.set_text_color(236, 228, 214)
        self.multi_cell(w - 10, 4.6, text)
        self.set_text_color(*INK)
        self.set_y(y + h + 3.2)

    def table(self, headers: list[str], rows: list[list[str]], col_w: list[float] | None = None):
        if col_w is None:
            col_w = [self.epw / len(headers)] * len(headers)
        if self.get_y() > 188:
            self.add_page()
        self.set_font("Montserrat", "B", 8.5)
        self.set_fill_color(*TABLE_HEAD)
        self.set_text_color(252, 249, 244)
        h_head = 8
        x0 = self.l_margin
        y = self.get_y()
        x = x0
        for i, header in enumerate(headers):
            self.set_xy(x, y)
            self.rect(x, y, col_w[i], h_head, "F")
            self.set_xy(x + 1.6, y + 1.6)
            self.multi_cell(col_w[i] - 3.2, 5, header)
            x += col_w[i]
        self.set_y(y + h_head)
        self.set_font("Body", "", 9.4)
        self.set_text_color(*INK)
        for r_i, row in enumerate(rows):
            # measure height
            heights = []
            for i, cell in enumerate(row):
                lines = self.multi_cell(col_w[i] - 3.2, 4.8, cell, dry_run=True, output="LINES")
                heights.append(6 + len(lines) * 4.8)
            row_h = max(heights)
            if self.get_y() + row_h > 272:
                self.add_page()
            y = self.get_y()
            fill = (248, 244, 238) if r_i % 2 == 0 else (255, 253, 250)
            x = x0
            for i, cell in enumerate(row):
                self.set_fill_color(*fill)
                self.rect(x, y, col_w[i], row_h, "F")
                self.set_xy(x + 1.6, y + 1.4)
                self.set_text_color(*INK)
                self.multi_cell(col_w[i] - 3.2, 4.8, cell)
                x += col_w[i]
            self.set_y(y + row_h)
        self.ln(4)

    def numbered(self, items: list[str]):
        self.set_font("Body", "", 11)
        w = self.epw
        for i, item in enumerate(items, 1):
            if self.get_y() > 268:
                self.add_page()
            y = self.get_y()
            self.set_font("Montserrat", "B", 10)
            self.set_text_color(*ACCENT)
            self.set_xy(self.l_margin, y)
            self.cell(7, 5.6, f"{i}.")
            self.set_font("Body", "", 11)
            self.set_text_color(*INK)
            self.set_xy(self.l_margin + 7, y)
            self.multi_cell(w - 7, 5.6, item)
            self.ln(0.9)
        self.ln(1.6)


def build():
    pdf = Doc()
    pdf.set_margins(18, 18, 18)
    pdf.cover()

    pdf.h1("1.  O que o loop é")
    pdf.p(
        "O modelo é uma função sem memória: recebe uma lista de mensagens e "
        "devolve texto. Quem lembra é o host. O loop é o mecanismo que, a cada "
        "pergunta, acrescenta essa pergunta ao histórico, chama o modelo com o "
        "histórico inteiro, acrescenta a resposta, e espera a próxima pergunta."
    )
    pdf.p(
        "Sem o loop, cada chamada é isolada. Com o loop, a conversa é um único "
        "estado que cresce. A diferença entre “chatbot de um tiro” e “conversa” "
        "não está no modelo; está neste ciclo."
    )
    pdf.bullets(
        [
            "O modelo não age no mundo: só emite texto.",
            "O orquestrador não interpreta o conteúdo: só encadeia estado e chamada.",
            "A memória operacional é o transcript, não uma variável à parte.",
        ]
    )

    pdf.h1("2.  Os quatro blocos")
    pdf.p(
        "O sistema cabe em quatro peças. Cada uma tem um lado de dentro e um "
        "lado de fora. Se um bloco fizer o trabalho de outro, o ciclo deixa de "
        "ser legível."
    )
    pdf.table(
        ["Bloco", "Responsabilidade", "Fora do bloco"],
        [
            [
                "Transcript",
                "Guarda as mensagens na ordem em que aconteceram.",
                "Não chama o modelo. Não decide quando parar.",
            ],
            [
                "Adaptador do modelo",
                "Traduz a lista de mensagens no formato da API e devolve o texto.",
                "Não conhece o loop. Não grava estado.",
            ],
            [
                "Orquestrador",
                "Dono do ciclo: lê, grava, chama, grava, mostra, repete.",
                "Não executa ações no mundo. Não parseia a resposta para “fazer” algo.",
            ],
            [
                "I/O",
                "Entrega texto do humano e devolve texto do assistente.",
                "Não conhece mensagens, roles nem o vendor do modelo.",
            ],
        ],
        [40, 72, 62],
    )
    pdf.h2("Dependências")
    pdf.code(
        "I/O  ──►  Orquestrador  ──►  Transcript\n"
        "                    └──►  Adaptador  ──►  API do modelo"
    )
    pdf.p(
        "As setas apontam para dentro. O adaptador não importa o transcript. "
        "O transcript não importa o I/O. O orquestrador é o único que vê os "
        "três. Por isso ele é o loop: é o único lugar onde “depois disto, "
        "aquilo” está escrito."
    )

    pdf.h1("3.  Estado")
    pdf.p(
        "O estado é um array de mensagens. Não há run, orçamento, pause nem "
        "índice de turno. Se algo precisa ser lembrado no próximo ciclo, está "
        "neste array. Se não está, o modelo não vê."
    )
    pdf.table(
        ["Campo", "Papel"],
        [
            [
                "role",
                "Quem falou. Três valores: system, user, assistant.",
            ],
            [
                "content",
                "O texto dessa fala. Neste recorte, sempre uma string.",
            ],
        ],
        [40, 134],
    )
    pdf.h2("Os três roles")
    pdf.table(
        ["role", "Origem", "Função no ciclo"],
        [
            [
                "system",
                "O orquestrador, uma vez, no início.",
                "Instrução permanente. O modelo trata como contexto, não como fala do usuário.",
            ],
            [
                "user",
                "O humano, via I/O, a cada turno.",
                "A pergunta atual e todas as anteriores.",
            ],
            [
                "assistant",
                "O modelo, via adaptador, a cada turno.",
                "A resposta que o próximo turno precisa “lembrar”.",
            ],
        ],
        [32, 52, 90],
    )
    pdf.p(
        "O system existe antes do loop começar. Cada volta bem-sucedida acrescenta "
        "exatamente duas mensagens: uma user e, depois da chamada, uma assistant. "
        "O array só cresce; mensagens antigas não se editam."
    )
    pdf._note(
        "Há uma única memória. Qualquer cópia paralela (“última resposta”, "
        "“resumo atual”) vira uma segunda fonte de verdade e o ciclo passa a "
        "mentir quando as duas divergem."
    )

    pdf.h1("4.  O ciclo")
    pdf.p(
        "O orquestrador é uma máquina de dois estados visíveis: esperando o "
        "humano e chamando o modelo. O transcript muda só nestas transições."
    )
    pdf.code(
        "iniciar\n"
        "  transcript ← [system]\n"
        "\n"
        "enquanto verdadeiro\n"
        "  pergunta ← I/O.ler()\n"
        "  se a pergunta encerra a sessão → sair do loop\n"
        "\n"
        "  transcript.append({ role: user, content: pergunta })\n"
        "  resposta ← adaptador(transcript)\n"
        "  transcript.append({ role: assistant, content: resposta })\n"
        "  I/O.escrever(resposta)\n"
        "\n"
        "encerrar"
    )
    pdf.h2("Invariantes")
    pdf.numbered(
        [
            "O modelo só é chamado depois do user estar no transcript. Sem isso, a pergunta atual não existe para ele.",
            "A resposta só é mostrada depois do assistant estar no transcript. Sem isso, o próximo turno não vê o que foi dito.",
            "A chamada envia o transcript inteiro, na ordem. O modelo não recebe um recorte “inteligente” neste recorte.",
        ]
    )
    pdf.p(
        "Uma pergunta produz uma chamada e um par user/assistant. Não há "
        "paralelismo: o próximo user só entra quando o assistant do turno "
        "atual já está gravado, ou quando o turno foi abortado sem commit."
    )

    pdf.h1("5.  Anatomia de um turno")
    pdf.code(
        "humano  ──►  I/O.read\n"
        "                │\n"
        "                ▼\n"
        "         orquestrador  (encerra ou segue)\n"
        "                │\n"
        "                ▼\n"
        "         append user     ──►  transcript\n"
        "                │\n"
        "                ▼\n"
        "         adaptador(transcript.all())\n"
        "                │\n"
        "                ▼\n"
        "         modelo devolve texto\n"
        "                │\n"
        "                ▼\n"
        "         append assistant ──►  transcript\n"
        "                │\n"
        "                ▼\n"
        "         I/O.write  ──►  humano\n"
        "                │\n"
        "                └──  volta a I/O.read"
    )
    pdf.p(
        "O turno é a unidade de consistência. Ou o par user/assistant entra "
        "inteiro, ou não entra. O adaptador devolve texto ou falha: não devolve "
        "uma mensagem pela metade para o transcript."
    )
    pdf.p(
        "O I/O pode ser um terminal, um socket ou um handler HTTP. Para o "
        "orquestrador isso é irrelevante: ele só vê duas funções, ler e escrever "
        "string."
    )

    pdf.h1("6.  Contratos internos")
    pdf.p(
        "Estes são os tipos que os blocos trocam. Não descrevem um vendor. "
        "Não há ToolCall: a saída do modelo, neste recorte, é só texto."
    )
    pdf.table(
        ["Contrato", "Forma"],
        [
            [
                "Message",
                "role: system | user | assistant\ncontent: string",
            ],
            [
                "Transcript",
                "messages: Message[]\nappend(message)\nall() → a lista que o adaptador envia",
            ],
            [
                "ModelAdapter",
                "entrada: lista de mensagens\nsaída: string\nfalha de transporte: erro, não uma Message",
            ],
            [
                "Orchestrator",
                "start() coloca o system\nturn(userText) → assistantText\no loop externo chama turn até parar",
            ],
            [
                "I/O",
                "read() → string\nwrite(string)",
            ],
        ],
        [42, 132],
    )
    pdf.p(
        "turn é o ciclo de um turno, não o loop da sessão. O loop da sessão "
        "é “enquanto I/O.ler() não encerrar, chamar turn”. Separar os dois "
        "evita que o adaptador ou o transcript saibam o que é “sair”."
    )

    pdf.h1("7.  A mensagem system")
    pdf.p(
        "O system é a primeira mensagem do transcript e a única que não vem "
        "de um turno. Ela é estado, não configuração escondida no adaptador: "
        "viaja junto com user e assistant em toda chamada."
    )
    pdf._box(
        "Exemplo do slot, não de um produto: “Responda em português, de forma "
        "direta. Se não souber, diga que não sabe.”"
    )
    pdf.p(
        "Arquiteturalmente o system é só um role com privilégio semântico no "
        "modelo. O orquestrador não o reescreve a cada turno. O adaptador não "
        "o inventa. Se a voz ou as restrições mudam, muda a mensagem no "
        "transcript — a mesma fonte de verdade."
    )
    pdf._note(
        "O system não é barreira. Ele sugere comportamento. Quem impede uma "
        "chamada ou uma saída é o orquestrador, não o texto da primeira mensagem."
    )

    pdf.h1("8.  Parada")
    pdf.p(
        "Neste recorte o loop não decide sozinho que “já acabou”. Quem encerra "
        "é o humano, ou uma falha que impede o turno de fechar. Não há "
        "max_steps: cada volta espera um input explícito."
    )
    pdf.table(
        ["Condição", "Onde", "Efeito no estado"],
        [
            [
                "Sinal de encerrar (sair, EOF, hangup)",
                "I/O → orquestrador",
                "O loop para. O transcript fica como está. Não há chamada ao modelo.",
            ],
            [
                "Falha do adaptador",
                "Adaptador → orquestrador",
                "Não nasce assistant. O turno não se completa.",
            ],
        ],
        [58, 42, 74],
    )
    pdf.h2("Falha e o user órfão")
    pdf.p(
        "Se o orquestrador já gravou o user e o adaptador falha, o transcript "
        "fica com uma pergunta sem resposta. Isso quebra o ritmo do array "
        "(user, assistant, user, assistant…). Há duas formas consistentes:"
    )
    pdf.bullets(
        [
            "Abortar o turno: remover o user recém-gravado. O array volta ao estado anterior à pergunta.",
            "Manter o user e não inventar assistant. A próxima tentativa ou o próximo envio precisa lidar com um user sem par.",
        ]
    )
    pdf.p(
        "O que o ciclo não faz: gravar um assistant com a mensagem de erro "
        "como se o modelo tivesse falado. Erro de transporte não é fala. Se o "
        "humano precisa ver o erro, isso sai pelo I/O, fora do transcript, ou "
        "como um canal à parte — não como role assistant."
    )

    pdf.h1("9.  Fronteira deste recorte")
    pdf.p(
        "O recorte termina onde o modelo deixa de ser “função de texto”. "
        "Tudo abaixo existe em arquiteturas maiores; aqui não faz parte do ciclo."
    )
    pdf.table(
        ["Fora", "Por quê"],
        [
            [
                "Tools",
                "A saída deixaria de ser só texto. O loop teria um ramo “executar” antes de voltar ao modelo.",
            ],
            [
                "Store externo",
                "Haveria uma segunda memória além do transcript. O compilador de contexto teria de juntar as duas.",
            ],
            [
                "Orçamento (passos, tokens, custo)",
                "O orquestrador passaria a encerrar sem input humano. Aqui quem limita é o próprio turno.",
            ],
            [
                "Pause / resume",
                "O run teria identidade própria, serializável no meio de um ciclo. Aqui a sessão é o próprio processo + o array.",
            ],
        ],
        [48, 126],
    )
    pdf.p(
        "A fronteira não é uma lista de tarefas. É o que este ciclo, por "
        "construção, não contém: um único estado, um único tipo de saída, "
        "um único dono do “e agora?”."
    )

    pdf.h1("10.  Por que a memória funciona")
    pdf.p(
        "O modelo não “lembra” a conversa. Na segunda pergunta ele só acerta "
        "o contexto se o orquestrador reenviar o array completo. O exemplo "
        "abaixo é o ciclo visto pelo estado, não um roteiro de uso."
    )
    pdf.table(
        ["Momento", "O que o transcript contém", "O que o modelo recebe"],
        [
            [
                "Início",
                "[system]",
                "Ainda não é chamado.",
            ],
            [
                "Depois da 1ª pergunta",
                "[system, user1]",
                "system + user1",
            ],
            [
                "Depois da 1ª resposta",
                "[system, user1, assistant1]",
                "— (turno fechado)",
            ],
            [
                "Na 2ª pergunta",
                "[system, user1, assistant1, user2]",
                "as quatro mensagens",
            ],
        ],
        [48, 68, 58],
    )
    pdf.p(
        "Se na segunda pergunta o modelo ignora o que foi dito na primeira, "
        "o defeito está no host: o adaptador não recebeu o array inteiro, "
        "ou o assistant anterior nunca foi gravado. O modelo não tem outro "
        "canal de memória neste desenho."
    )

    pdf.output(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
